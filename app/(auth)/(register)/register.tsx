import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import KeyboardAwareScrollView from "@/components/KeyboardAwareScrollView";
import { Formik } from "formik";
import { router } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { routes } from "@/constants/routes";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { userAPI, DirectRegisterRequest } from "@/lib/api/user";
import * as Yup from "yup";
import { StatusBar } from "expo-status-bar";

// Validation schema
const registerSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  last_name: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone_number: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const Register = () => {
  const { visible, alertConfig, hideAlert, showError, showSuccess } = useCustomAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (values: any, { setSubmitting, setFieldError }: any) => {
    try {
      setIsSubmitting(true);

      // Prepare registration data
      const registerData: DirectRegisterRequest = {
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        role: "primary_user", // Default role
      };

      // Call registration API
      const response = await userAPI.directRegister(registerData);

      if (response.status) {
        // Navigate directly to OTP verification page
        router.replace({
          pathname: routes?.verifyEmail as any,
          params: { email: values.email }
        });
      } else {
        showError("Registration Failed", response.message || "Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Extract error message
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        // Set field-specific errors
        if (errors.email) {
          setFieldError("email", errors.email[0]);
          errorMessage = errors.email[0];
        } else if (errors.phone_number) {
          setFieldError("phone_number", errors.phone_number[0]);
          errorMessage = errors.phone_number[0];
        } else if (errors.password) {
          setFieldError("password", errors.password[0]);
          errorMessage = errors.password[0];
        }
      }

      showError("Registration Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView keyboardVerticalOffset={90}>
      <StatusBar style="dark" />
      <View className="pt-[4rem]">
        <HeaderAndDescTextCenter
          header="Create Account"
          text1="Sign Up to get Started"
          containerStyle=" !px-1"
        />
      </View>

      <Formik
        initialValues={{
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          password: "",
          confirm_password: "",
        }}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
      >
        {() => (
          <View className="px-5">
            {/* Name Fields */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormikInput
                  name="first_name"
                  label="First Name"
                  placeholder="John"
                  containerStyle=""
                  required={true}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <View className="flex-1">
                <FormikInput
                  name="last_name"
                  label="Last Name"
                  placeholder="Doe"
                  containerStyle=""
                  required={true}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Input */}
            <FormikInput
              name="email"
              label="Email Address"
              placeholder="johndoe@gmail.com"
              containerStyle=""
              type="email"
              required={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Phone Number Input */}
            <FormikInput
              name="phone_number"
              label="Phone Number"
              placeholder="08012345678"
              containerStyle=""
              type="phone"
              required={true}
              keyboardType="phone-pad"
            />

            {/* Password Input */}
            <FormikInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              containerStyle=""
              required={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Confirm Password Input */}
            <FormikInput
              name="confirm_password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              type="password"
              containerStyle=""
              required={true}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Terms and Conditions */}
            <View className="mb-6">
              <Text className="text-sm text-gray-600 text-center">
                By signing up, you agree to our{" "}
                <Text className="text-primary-500 font-NunitoBold">
                  Terms & Conditions
                </Text>{" "}
                and{" "}
                <Text className="text-primary-500 font-NunitoBold">
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <FormikButton
              title={isSubmitting ? "Creating Account..." : "Sign Up"}
              className="mb-6"
              loading={isSubmitting}
              disabled={isSubmitting}
            />

            <AuthNavigateLink
              onPress={() => router?.push(routes?.signIn)}
              text="Already have an account?"
              textLink="Sign In"
              containerClassName="mb-4"
            />
          </View>
        )}
      </Formik>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
        />
      )}
    </KeyboardAwareScrollView>
  );
};

export default Register;
