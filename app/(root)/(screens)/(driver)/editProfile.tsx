import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import { CameraIcon, UserIcon, EnvelopeIcon } from "react-native-heroicons/outline";
import { usePrimaryUserProfile } from "@/hooks/useUserProfile";
import { userAPI } from "@/lib/api/user";
import { showToast } from "@/utils/toastUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import KeyboardAwareScrollView from "@/components/KeyboardAwareScrollView";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import AddressInput from "@/components/forms/AddressInput";
import { LinearGradient } from "expo-linear-gradient";

const editDriverProfileSchema = Yup.object().shape({
  first_name: Yup.string().min(2, "First name must be at least 2 characters").required("First name is required"),
  last_name: Yup.string().min(2, "Last name must be at least 2 characters").required("Last name is required"),
  phone_number: Yup.string().matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits").required("Phone number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  location: Yup.string().nullable(),
});

const EditDriverProfile = () => {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isLoadingProfile } = usePrimaryUserProfile();
  const userData = profileData?.data;

  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    location: "",
    profile_picture: "",
  });

  useEffect(() => {
    if (userData) {
      setInitialValues({
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        phone_number: userData?.phone_number || "",
        email: userData?.email || "",
        location: (userData as any)?.location || "",
        profile_picture: (userData as any)?.profile_picture || (userData as any)?.image || "",
      });
    }
  }, [userData]);

  const handleSave = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      const payload: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        location: values.location,
        profile_picture: values.profile_picture,
      };
      await userAPI.updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["primaryUserProfile"] });
      showToast.success("Profile updated successfully");
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      showToast.error(message);
      console.error("Driver profile update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagePick = async (setFieldValue: any) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast.error("Permission to access camera roll is required!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        if (result.assets[0].base64) {
          const base64Image = `data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`;
          setFieldValue("profile_picture", base64Image);
        } else {
          setFieldValue("profile_picture", result.assets[0].uri);
        }
      }
    } catch (error) {
      showToast.error("Failed to pick image");
    }
  };

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#D30309" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">Edit Profile</Text>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Formik initialValues={initialValues} validationSchema={editDriverProfileSchema} enableReinitialize onSubmit={handleSave}>
          {({ handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
            <View className="px-5 pt-6">
              <View className="items-center mb-8">
                <TouchableOpacity onPress={() => handleImagePick(setFieldValue)} className="relative">
                  <View className="w-28 h-28 rounded-2xl items-center justify-center border-4 border-white shadow-lg mb-3 overflow-hidden">
                    {values.profile_picture ? (
                      <Image source={{ uri: values.profile_picture }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <LinearGradient colors={["#D30309", "#B91C1C"]} className="w-full h-full items-center justify-center">
                        <Text className="text-4xl font-NunitoExtraBold text-white">
                          {values.first_name ? values.first_name.charAt(0).toUpperCase() : "D"}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View className="absolute bottom-3 right-0 bg-primary-500 w-9 h-9 rounded-full items-center justify-center border-3 border-white shadow-md">
                    <CameraIcon size={18} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-gray-500 font-NunitoMedium text-sm">Tap to change profile photo</Text>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary-50 rounded-lg items-center justify-center mr-2">
                    <UserIcon size={16} color="#D30309" />
                  </View>
                  <Text className="text-base font-NunitoBold text-gray-900">Personal Information</Text>
                </View>
                <View className="flex-row gap-4 mb-3">
                  <View className="flex-1">
                    <FormikInput name="first_name" label="First Name" placeholder="John" autoCapitalize="words" required />
                  </View>
                  <View className="flex-1">
                    <FormikInput name="last_name" label="Last Name" placeholder="Doe" autoCapitalize="words" required />
                  </View>
                </View>
                <View className="mb-3">
                  <FormikInput
                    name="email"
                    label="Email Address"
                    placeholder="email@example.com"
                    editable={false}
                    containerStyle="bg-gray-100 border-gray-200"
                    inputStyle="text-gray-500"
                    helperText="Email cannot be changed"
                  />
                </View>
                <FormikInput name="phone_number" label="Phone Number" placeholder="080 0000 0000" keyboardType="phone-pad" required />
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-2">
                    <EnvelopeIcon size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-base font-NunitoBold text-gray-900">Location</Text>
                </View>
                <AddressInput
                  label="Home Address"
                  value={values.location}
                  onChangeText={(text: string) => setFieldValue("location", text)}
                  onLocationSelect={(location: any) => setFieldValue("location", location?.address || location)}
                  placeholder="Enter your address"
                  error={errors.location as string}
                  touched={touched.location as boolean}
                />
              </View>

              <View className="mt-4">
                <FormikButton
                  title={isSubmitting ? "Saving Changes..." : "Save Changes"}
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EditDriverProfile;
