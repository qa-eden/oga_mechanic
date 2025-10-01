"use client";

import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { resetPasswordSchema } from "@/utils/validationSchemas";
import { routes, sellerRoutes } from "@/constants/routes";
import { userAPI } from "@/lib/api/user";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Step5 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep5Submit = async (values: any, { setSubmitting }: any) => {

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitting(true);

    try {
      const response = await userAPI.registerStep(5, {
        password: values.password,
        password_confirm: values.confirmPassword,
      });

      // Handle registration response structure (data is nested)
      const responseData = response.data || response;
      
      // Store user data to AsyncStorage
      const userData = {
        access_token: responseData.access,
        refresh_token: responseData.refresh,
        user_id: responseData.user_id,
        email: responseData.email,
        role: responseData.role,
        message: response.message,
        referenceId: response.referenceId
      };
      
      // Store tokens and user data
      try {
        await AsyncStorage.setItem('auth_token', responseData.access);
        await AsyncStorage.setItem('refresh_token', responseData.refresh);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        await AsyncStorage.setItem('is_logged_in', 'true');
        
        // Call /users/roles/ endpoint after successful registration
        try {
          console.log('🔄 Fetching user roles after seller registration...');
          const rolesResponse = await userAPI.getUserRoles();
          console.log('✅ User roles fetched after seller registration:', rolesResponse);
          
          // Store roles data in local storage
          await AsyncStorage.setItem('user_roles_data', JSON.stringify(rolesResponse));
          console.log('✅ User roles data stored in AsyncStorage after seller registration');
        } catch (rolesError) {
          console.error('❌ Failed to fetch roles after seller registration:', rolesError);
          // Continue with registration even if roles fetch fails
        }
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        // Continue with navigation even if storage fails
      }

      // Navigate to success page with all collected data
      router.push({
        pathname: sellerRoutes.accountCreated,
        params: {
          ...params,
          ...values
        }
      });

    } catch (error: any) {

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';

      Alert.alert(
        'Registration Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

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
                <ProgressBar step={5} totalSteps={5} />
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
                validationSchema={resetPasswordSchema}
                onSubmit={handleStep5Submit}
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
                      title={isSubmitting ? "Creating account..." : "Create account"}
                      className="py-4 mb-2"
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
    </SafeAreaView>
  );
}

export default Step5