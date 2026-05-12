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
import { userAPI } from "@/lib/api/user";
import Toast from "react-native-toast-message";


const forgetPassword = () => {
  const router = useRouter();

  const handleProceed = async (values: any, { setSubmitting }: any) => {
    try {
      const response = await userAPI.forgotPassword(values.email);
      if (response.status) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: response.message || 'Check your email for the recovery code.',
        });
        router.push({
          pathname: routes?.enterCode as any,
          params: { email: values.email }
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2: response.message || 'Could not send recovery code.',
        });
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAwareScrollView>
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
