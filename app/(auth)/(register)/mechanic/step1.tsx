"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
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
import { step1Schema } from "@/utils/validationSchemas";
import { mechanicRoutes, routes } from "@/constants/routes";
import FormikCheckbox from "@/components/forms/FormikCheckbox";
import { useRegisterStep2 } from "@/hooks/useRegistration";

const MechanicStep1 = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registerStep2Mutation = useRegisterStep2();

  // Reset any stuck states on component mount
  useEffect(() => {
    setIsSubmitting(false);
    
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  const handleStep1Submit = async (values: any, { setSubmitting }: any) => {
    // Use TanStack Query mutation for step 2
    registerStep2Mutation.mutate({
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      email: values.email.trim(),
      phone_number: values.phone.trim()
    }, {
      onSuccess: () => {
        setSubmitting(false);
        router.push(mechanicRoutes?.step2);
      },
      onError: (error: any) => {
        setSubmitting(false);
        console.error('Registration step 1 failed:', error);
        // You can add error handling here if needed
      }
    });
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
              <ProgressBar step={1} totalSteps={4} />
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
                termsAndConditions: false,
                }}
              validationSchema={step1Schema}
              onSubmit={handleStep1Submit}
            >
              {() => (
                <View className="flex-1">
                  <FormikInput
                    name="firstName"
                    label="First Name"
                    placeholder="Enter first name"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="lastName"
                    label="Last Name"
                    placeholder="Enter last name"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="email"
                    label="Email"
                    placeholder="Enter email address"
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

                  {/* Terms and Conditions */}
                  <View className="flex-row items-start mt-6 mb-4">
                    <View className="">
                      <FormikCheckbox
                        name="termsAndConditions"
                        label=""
                        labelStyle=""
                        containerStyle="flex-shrink"
                      />
                    </View>
                    <Text className="flex-1 text-sm text-gray-600 font-NunitoMedium leading-5">
                      By registering you accept our{" "}
                      <Text className="text-red-600 font-NunitoBold">
                        Terms and Conditions
                      </Text>
                      , and{" "}
                      <Text className="text-red-600 font-NunitoBold">
                        Privacy Policy
                      </Text>{" "}
                      on this platform.
                    </Text>
                  </View>

                  <View style={{ height: 20 }} />

                  <FormikButton
                    title="Verify Account"
                    className="py-4 mb-2"
                    loading={registerStep2Mutation.isPending}
                  />

                  <AuthNavigateLink
                    onPress={() => router.push(routes.signIn)}
                    text="Already have account an account?"
                    textLink="Sign in"
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

export default MechanicStep1;
