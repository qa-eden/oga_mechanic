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
import { useRouter, useLocalSearchParams } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { resetPasswordSchema } from "@/utils/validationSchemas";
import { routes, sellerRoutes } from "@/constants/routes";

const Step5 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleStep5Submit = (values: any, { setSubmitting }: any) => {
    setSubmitting(false);
    // Navigate to completion with all form data
    console.log('Step 5 submitted with values:', values);
    console.log('Previous step data:', params);
    
    // Navigate to main home with all collected data
    router.push({
      pathname: sellerRoutes.accountCreated,
      params: {
        ...params,
        ...values
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
                      title="Create account"
                      className="py-4 mb-2"
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