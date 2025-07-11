"use client";

import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { routes } from "@/constants/routes";

const Step2 = () => {
  const handleStep2Submit = (values: any, { setSubmitting }: any) => {
    console.log("Step 2 values:", values);
    setSubmitting(false);
    router.push(routes?.userStep3);
  };

  const handleSkip = () => {
    router.push(routes?.userStep3);
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
          className="flex-1"
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: 100 
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          decelerationRate="normal"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          keyboardDismissMode="interactive"
          overScrollMode="never"
        >
          <View className="px-5">
            <UserAuthHeader />

            <View className="py-4">
              <ProgressBar step={2} totalSteps={3} />
            </View>

            <HeaderAndDescTextCenter
              header="Add your car details"
              text1="Kindly input your car details to continue"
              containerStyle="!px-0 !py-2"
            />

            <Formik
              initialValues={{
                vin: "",
                model: "",
                modelYear: "",
                vehicleType: "",
                engineType: "",
                transmission: "",
                bodyStyle: "",
              }}
              onSubmit={handleStep2Submit}
            >
              {() => (
                <View>
                  <FormikInput
                    name="vin"
                    label="VIN-Vehicle Identification Number"
                    placeholder="Enter your VIN"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="model"
                    label="Make & Model"
                    placeholder="Enter your make & model"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="modelYear"
                    label="Model Year"
                    placeholder="Enter your model year"
                    labelStyle="mt-2"
                    type="number"
                    keyboardType="numeric"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="vehicleType"
                    label="Vehicle Type"
                    placeholder="Enter your vehicle type"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="engineType"
                    label="Engine Type"
                    placeholder="Enter your engine type"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="transmission"
                    label="Transmission"
                    placeholder="Enter your transmission"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="bodyStyle"
                    label="Body Style"
                    placeholder="Enter your body style"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <View style={{ height: 40 }} />

                  <FormikButton title="Proceed" className="py-4 mb-2" />

                  <CustomButton
                    bgVariant="secondary"
                    textVariant="secondary"
                    title="Skip for now"
                    className="py-4 mb-2"
                    onPress={handleSkip}
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

export default Step2;
