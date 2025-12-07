import { View } from "react-native";
import React from "react";
import { Formik } from "formik";
import { useRouter } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { SafeAreaView } from "react-native-safe-area-context";
import { routes } from "@/constants/routes";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { forgotPasswordSchema } from "@/utils/validationSchemas";
import KeyboardAwareScrollView from "@/components/KeyboardAwareScrollView";


const forgetPassword = () => {
  const router = useRouter();

  const handleProceed = (values: any, { setSubmitting }: any) => {

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      router.push(routes?.enterCode);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAwareScrollView keyboardVerticalOffset={90}>
        <View className="pt-[2rem]">
          <HeaderAndDescTextCenter
            header="Forgot Password?"
            text1="Please enter your email, an OTP will be sent"
          />
        </View>

        <Formik
          initialValues={{
            email: "",
          }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleProceed}
        >
          <View className="px-5 pt-[1rem]">
            <FormikInput
              name="email"
              label="Email address"
              placeholder="johndoe@gmail.com"
              containerStyle="mb-6"
              type="email"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormikButton title="Proceed" className="mb-6" />

            <AuthNavigateLink
              onPress={() => router?.replace(routes?.signIn)}
              text="Didn't have an account?"
              textLink="Sign In"
              containerClassName="mb-4"
            />
          </View>
        </Formik>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default forgetPassword;
