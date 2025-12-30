import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { userAPI, ChangePasswordData } from "@/lib/api/user";
import { useMutation } from "@tanstack/react-query";
import SuccessModal from "@/components/modals/SuccessModal";
import CustomAlert from "@/components/CustomAlert";

// Validation Schema
const changePasswordSchema = Yup.object().shape({
  old_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  new_password_confirm: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords must match")
    .required("Confirm password is required"),
});

const ChangePassword = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorConfig, setErrorConfig] = useState({
    title: "",
    message: "",
  });

  // Mutation for changing password
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => userAPI.changePassword(data),
    onSuccess: (data) => {
      if (data.status) {
        setShowSuccessModal(true);
      } else {
        setErrorConfig({
          title: "Failed",
          message: data.message || "Failed to change password",
        });
        setShowErrorAlert(true);
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "An error occurred. Please try again.";
      setErrorConfig({
        title: "Error",
        message: message,
      });
      setShowErrorAlert(true);
    },
  });

  const handleSave = (values: any) => {
    const payload: ChangePasswordData = {
      requestType: "change_password",
      data: {
        old_password: values.old_password,
        new_password: values.new_password,
        new_password_confirm: values.new_password_confirm,
      },
    };
    changePasswordMutation.mutate(payload);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">
          Change Password
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-5 pt-8">
            <Text className="text-gray-500 font-NunitoMedium mb-6">
              Your new password must be different from previous used passwords.
            </Text>

            <Formik
              initialValues={{
                old_password: "",
                new_password: "",
                new_password_confirm: "",
              }}
              validationSchema={changePasswordSchema}
              onSubmit={handleSave}
            >
              {({ handleSubmit }) => (
                <View className="space-y-4">
                  <FormikInput
                    name="old_password"
                    label="Current Password"
                    placeholder="Enter current password"
                    secureTextEntry
                    type="password"
                    required
                  />

                  <FormikInput
                    name="new_password"
                    label="New Password"
                    placeholder="Enter new password"
                    secureTextEntry
                    type="password"
                    required
                    helperText="Must be at least 6 characters"
                  />

                  <FormikInput
                    name="new_password_confirm"
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    secureTextEntry
                    type="password"
                    required
                  />

                  <View className="mt-8">
                    <FormikButton
                      title={
                        changePasswordMutation.isPending
                          ? "Changing Password..."
                          : "Change Password"
                      }
                      onPress={handleSubmit}
                      loading={changePasswordMutation.isPending}
                      disabled={changePasswordMutation.isPending}
                      className="w-full"
                    />
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Password Changed!"
        message="Your password has been changed successfully."
        buttonText="Done"
      />

      {/* Error Alert */}
      <CustomAlert
        visible={showErrorAlert}
        title={errorConfig.title}
        message={errorConfig.message}
        onClose={() => setShowErrorAlert(false)}
        type="error"
        buttonText="Close"
      />
    </SafeAreaView>
  );
};

export default ChangePassword;
