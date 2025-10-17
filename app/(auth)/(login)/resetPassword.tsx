import { View, ScrollView } from "react-native";
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

const ResetPassword = () => {
  const router = useRouter();

  const handleProceed = (values: any, { setSubmitting }: any) => {

    if (values.password !== values.confirmPassword) {
      showToast.error("Password does not match");
      setSubmitting(false);
    } else {
      // Simulate API call
      setTimeout(() => {
        setSubmitting(false);
      router.push(routes?.resetPasswordSuccess);
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
