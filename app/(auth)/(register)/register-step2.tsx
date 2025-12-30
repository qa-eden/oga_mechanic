"use client";

import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { useRouter } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { routes } from "@/constants/routes";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI, DirectRegisterRequest } from "@/lib/api/user";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

// Validation schema for step 2 (password)
const step2Schema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const RegisterStep2 = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Data, setStep1Data] = useState<any>(null);
  const { visible, alertConfig, hideAlert, showError } = useCustomAlert();

  // Load step 1 data on mount
  useEffect(() => {
    const loadStep1Data = async () => {
      try {
        const data = await AsyncStorage.getItem('register_step1_data');
        if (data) {
          setStep1Data(JSON.parse(data));
        } else {
          // If no step 1 data, redirect back to step 1
          router.replace(routes?.register as any);
        }
      } catch (error) {
        console.error("Error loading step 1 data:", error);
        router.replace(routes?.register as any);
      }
    };

    loadStep1Data();
  }, []);

  const handleStep2Submit = async (values: any, { setSubmitting, setFieldError }: any) => {
    if (!step1Data) {
      showError("Error", "Registration data not found. Please start over.");
      router.replace(routes?.register as any);
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare registration data combining step 1 and step 2
      const registerData: DirectRegisterRequest = {
        email: step1Data.email,
        password: values.password,
        // confirm_password: values.confirmPassword,
        first_name: step1Data.first_name,
        last_name: step1Data.last_name,
        phone_number: step1Data.phone_number,
        role: "primary_user",
      };

      // Call registration API
      const response = await userAPI.directRegister(registerData);

      if (response.status) {
        // Store tokens and user data following login structure
        try {
          const responseData = response.data;
          
          if (responseData?.access && responseData?.refresh) {
            const { access, refresh, user } = responseData;
            
            // Store tokens and user data
            await AsyncStorage.multiSet([
              ['auth_token', access],
              ['refresh_token', refresh],
              ['user_data', JSON.stringify(user)],
              ['is_logged_in', 'true']
            ]);
            
            // Store active role if available
            if (user?.role) {
              await AsyncStorage.setItem('current_active_role', user.role);
            }
            
            console.log('Registration successful, tokens stored');
          }
        } catch (storageError) {
          console.error('Error storing registration data:', storageError);
          // Continue to verification even if storage fails
        }
        
        // Clear step 1 data from storage
        await AsyncStorage.removeItem('register_step1_data');
        
        // Navigate to OTP verification page
        router.replace({
          pathname: routes?.verifyEmail as any,
          params: { email: step1Data.email }
        });
      } else {
        showError("Registration Failed", response.message || "Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Extract error message
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        // Set field-specific errors
        if (errors.password) {
          setFieldError("password", errors.password[0]);
          errorMessage = errors.password[0];
        } else if (errors.email) {
          errorMessage = errors.email[0];
        } else if (errors.phone_number) {
          errorMessage = errors.phone_number[0];
        }
      }

      showError("Registration Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (!step1Data) {
    return null; // Or a loading spinner
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: 200,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            bounces={true}
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          >
            <View className="px-5">
              <UserAuthHeader />

              <View className="py-4">
                <ProgressBar step={2} totalSteps={2} />
              </View>

              <HeaderAndDescTextCenter
                header="Password"
                text1="Kindly set up your password"
                containerStyle="px-0 py-2"
              />

              <Formik
                initialValues={{
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={step2Schema}
                onSubmit={handleStep2Submit}
              >
                {() => (
                  <View>
                    <FormikInput
                      name="password"
                      label="Password"
                      placeholder="*********"
                      type="password"
                      labelStyle="mt-2"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    <FormikInput
                      name="confirmPassword"
                      label="Confirm password"
                      placeholder="*********"
                      type="password"
                      labelStyle="mt-2"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    {/* Spacing before buttons */}
                    <View style={{ height: 40 }} />

                    <FormikButton
                      title={isSubmitting ? "Creating Account..." : "Create account"}
                      className="py-4 mb-2"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    />

                    <AuthNavigateLink
                      onPress={() => router.push(routes.signIn)}
                      text="Already have an account?"
                      textLink="Sign In"
                      containerClassName="mt-4"
                    />

                    {/* Extra bottom spacing */}
                    <View style={{ height: 100 }} />
                  </View>
                )}
              </Formik>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterStep2;
