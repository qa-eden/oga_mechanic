import { View } from "react-native";
import React from "react";
import { Formik } from "formik";
import { useRouter } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "@/utils/toastUtils";
import { routes } from "@/constants/routes";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { resetPasswordSchema } from "@/utils/validationSchemas";
import KeyboardAwareScrollView from "@/components/KeyboardAwareScrollView";
import { useLocalSearchParams } from "expo-router";
import { userAPI } from "@/lib/api/user";
import Toast from "react-native-toast-message";

const ResetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string, code: string }>();
  const { email, code } = params;

  const handleProceed = async (values: any, { setSubmitting }: any) => {
    if (values.password !== values.confirmPassword) {
      showToast.error("Passwords do not match");
      setSubmitting(false);
      return;
    }

    try {
      const response = await userAPI.resetPassword({
        email,
        otp: code,
        new_password: values.password,
        confirm_new_password: values.confirmPassword
      });

      if (response.status) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: 'Your password has been updated successfully.',
        });
        router.push(routes?.resetPasswordSuccess);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: response.message || 'Could not reset your password.',
        });
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
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
            header="Reset Password"
            text1="Please create a new password"
          />
        </View>

        <Formik
          initialValues={{
            password: "",
            confirmPassword: "",
          }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleProceed}
        >
          <View className="px-5 pt-[1rem]">
            <FormikInput
              name="password"
              label="Password"
              placeholder="*********"
              containerStyle="mb-4"
              type="password"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormikInput
              name="confirmPassword"
              label="Confirm password"
              placeholder="*********"
              containerStyle="mb-6"
              type="password"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormikButton title="Reset password" className="mb-6" />

            <AuthNavigateLink
              onPress={() => router?.replace(routes?.signIn)}
              text="Didn't Forget Password?"
              textLink="Sign In"
              containerClassName="mb-4"
            />
          </View>
        </Formik>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
