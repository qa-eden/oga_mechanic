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
import { step1Schema } from "@/utils/validationSchemas";
import { routes } from "@/constants/routes";

const Step1 = () => {
  const handleStep1Submit = (values: any, { setSubmitting }: any) => {
    console.log("Step 1 values:", values);
    setSubmitting(false);
    router.push(routes?.userStep2);
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
              <ProgressBar step={1} totalSteps={3} />
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

                  <View style={{ height: 30 }} />

                  <FormikButton title="Proceed" className="py-4 mb-2" />

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

export default Step1;
