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
import { routes } from "@/constants/routes";
import { useUserStore } from "@/stores/userStore";
import { useRegistrationStore } from "@/stores/registrationStore";
import { RegisterData } from "@/lib/api/user";

const Step3 = () => {
  const router = useRouter();
  const { register, loading, error } = useUserStore();
  const { getRegistrationData, clearData } = useRegistrationStore();

  const handleStep3Submit = async (values: any, { setSubmitting }: any) => {
    console.log("Step 3 values:", values);
    
    try {
      // Get data from previous steps
      const step1Data = getRegistrationData();
      
      const registrationData: RegisterData = {
        email: step1Data.email,
        password: values.password,
        password_confirm: values.confirmPassword,
        first_name: step1Data.first_name,
        last_name: step1Data.last_name,
        roles: [0] // User role
      };
      
      const success = await register(registrationData);
      
      if (success) {
        clearData(); // Clear registration data after successful registration
        router.push(routes?.accountCreated);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
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
                <ProgressBar step={3} totalSteps={3} />
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
                onSubmit={handleStep3Submit}
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
                      title={loading ? "Creating account..." : "Create account"}
                      className="py-4 mb-2"
                      loading={loading}
                      disabled={loading}
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
};

export default Step3;
