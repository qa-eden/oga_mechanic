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
import { resetPasswordSchema } from "@/utils/validationSchemas";
import { routes, mechanicRoutes } from "@/constants/routes";
import { useRegisterStep4 } from "@/hooks/useRegistration";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "@/hooks/useAuth";

const MechanicStep4 = () => {
  const router = useRouter();
  const registerStep4Mutation = useRegisterStep4();
  const { visible, alertConfig, hideAlert, showError, showSuccess } = useCustomAlert();
  const { checkAuthStatus } = useAuth();

  const handleStep4Submit = async (values: any, { setSubmitting }: any) => {
    registerStep4Mutation.mutate({
      password: values.password,
      password_confirm: values.confirmPassword
    }, {
      onSuccess: async (response) => {
        setSubmitting(false);
        
        try {
          // Store tokens and user data
          await AsyncStorage.multiSet([
            ['auth_token', response.data.access],
            ['refresh_token', response.data.refresh],
            ['user_data', JSON.stringify({
              user_id: response.data.user_id,
              email: response.data.email,
              role: response.data.role
            })]
          ]);

          // Refresh auth status to update context
          await checkAuthStatus();

          showSuccess(
            "Account Created Successfully!",
            "Your mechanic account has been created. Redirecting to success page..."
          );

          // Navigate to success page after a short delay
          setTimeout(() => {
            router.push(mechanicRoutes?.accountCreated);
          }, 2000);
        } catch (error) {
          console.error('Error storing user data:', error);
          showError(
            "Login Error",
            "Account created but failed to log you in. Please sign in manually."
          );
        }
      },
      onError: (error: any) => {
        setSubmitting(false);
        console.error('Registration step 4 failed:', error);
        showError(
          "Registration Failed",
          error?.response?.data?.message || "Failed to create account. Please try again."
        );
      }
    });
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
                <ProgressBar step={4} totalSteps={4} />
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
                onSubmit={handleStep4Submit}
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
                      title="Create account"
                      className="py-4 mb-2"
                      loading={registerStep4Mutation.isPending}
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
      <CustomAlert
        visible={visible}
        title={alertConfig?.title || ""}
        message={alertConfig?.message || ""}
        type={alertConfig?.type || "info"}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};


export default MechanicStep4
