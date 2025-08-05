"use client";

import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
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
import { CheckIcon } from "react-native-heroicons/outline";
import { useState } from "react";
import SelectField from "@/components/forms/SelectField";
import FormikCheckbox from "@/components/forms/FormikCheckbox";

const MechanicStep1 = () => {

  const countries = [
    { label: "Nigeria", value: "Nigeria" },
    { label: "Ghana", value: "Ghana" },
    { label: "Kenya", value: "Kenya" },
    { label: "South Africa", value: "South Africa" },
  ];

  const cities: { [key: string]: { label: string; value: string }[] } = {
    Nigeria: [
      { label: "Lagos", value: "Lagos" },
      { label: "Abuja", value: "Abuja" },
      { label: "Port Harcourt", value: "Port Harcourt" },
      { label: "Kano", value: "Kano" },
    ],
    Ghana: [
      { label: "Accra", value: "Accra" },
      { label: "Kumasi", value: "Kumasi" },
      { label: "Tamale", value: "Tamale" },
    ],
    Kenya: [
      { label: "Nairobi", value: "Nairobi" },
      { label: "Mombasa", value: "Mombasa" },
      { label: "Kisumu", value: "Kisumu" },
    ],
    "South Africa": [
      { label: "Johannesburg", value: "Johannesburg" },
      { label: "Cape Town", value: "Cape Town" },
      { label: "Durban", value: "Durban" },
    ],
  };

  const handleStep1Submit = (values: any, { setSubmitting }: any) => {
    console.log("Step 1 values:", values);
    setSubmitting(false);
    router.push(mechanicRoutes?.step2);
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
                country: "Nigeria",
                city: "Lagos",
                termsAndConditions: false,
                }}
              validationSchema={step1Schema}
              onSubmit={handleStep1Submit}
            >
              {({ setFieldValue, values, errors, touched }) => (
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

                  <SelectField
                    label="Country"
                    placeholder="Select your country"
                    options={countries}
                    value={values.country}
                    onSelect={(value) => {
                      setFieldValue("country", value);
                      setFieldValue("city", ""); // Reset city when country changes
                    }}
                    error={errors.country}
                    touched={touched.country}
                    labelStyle="mt-2"
                  />

                  <SelectField
                    label="City"
                    placeholder="Select your city"
                    options={cities[values.country] || []}
                    value={values.city}
                    onSelect={(value) => setFieldValue("city", value)}
                    error={errors.city}
                    touched={touched.city}
                    disabled={!values.country}
                    labelStyle="mt-2"
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

                  <FormikButton title="Verify Account" className="py-4 mb-2" />

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
