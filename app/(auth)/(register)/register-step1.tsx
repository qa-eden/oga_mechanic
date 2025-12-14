"use client";

import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { router } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { routes } from "@/constants/routes";
import * as Yup from "yup";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Validation schema for step 1
const step1Schema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
    .required("Phone number is required"),
});

const RegisterStep1 = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Submit = async (values: any, { setSubmitting }: any) => {
    try {
      setIsSubmitting(true);
      
      // Store step 1 data in AsyncStorage
      await AsyncStorage.setItem('register_step1_data', JSON.stringify({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim(),
        phone_number: values.phone.trim()
      }));
      
      setSubmitting(false);
      setIsSubmitting(false);
      
      // Navigate to step 2
      router.push(routes?.registerStep2 as any);
    } catch (error) {
      console.error("Error saving data:", error);
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          decelerationRate="normal"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          keyboardDismissMode="interactive"
          overScrollMode="never"
          nestedScrollEnabled={true}
        >
          <View className="px-5 flex-1">
            <UserAuthHeader />

            <View className="py-4">
              <ProgressBar step={1} totalSteps={2} />
            </View>

            <HeaderAndDescTextCenter
              header="Personal details"
              text1="Kindly input your personal details to continue"
              containerStyle="!px-0 !py-2"
            />

            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
              }}
              validationSchema={step1Schema}
              onSubmit={handleStep1Submit}
            >
              {() => (
                <View className="flex-1">
                  <FormikInput
                    name="firstName"
                    label="First Name"
                    placeholder="Enter your first name"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="lastName"
                    label="Last Name"
                    placeholder="Enter your last name"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="email"
                    label="Email address"
                    placeholder="Enter your email address"
                    type="email"
                    labelStyle="mt-2"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="phone"
                    label="Phone number"
                    placeholder="Enter your phone number"
                    type="phone"
                    labelStyle="mt-2"
                    autoCorrect={false}
                  />

                  <FormikButton
                    title="Proceed"
                    className="py-4 my-2"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  />

                  <AuthNavigateLink
                    onPress={() => router.push(routes.signIn)}
                    text="Already have an account?"
                    textLink="Sign In"
                    containerClassName="mt-4"
                  />
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterStep1;
