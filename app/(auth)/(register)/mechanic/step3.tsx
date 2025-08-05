"use client";

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import ProgressBar from "@/components/ProgressBar";
import { mechanicRoutes, routes } from "@/constants/routes";
import SelectField from "@/components/forms/SelectField";
import UserAuthHeader from "@/components/UserAuthHeader";

const validationSchema = Yup.object().shape({
  idType: Yup.string().required("Please select an ID type"),
  nationalId: Yup.string()
    .min(11, "National ID must be at least 11 characters")
    .required("National Identification Number is required"),
});

interface FormValues {
  idType: string;
  nationalId: string;
}

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const MechanicStep3 = () => {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [frontIdCard, setFrontIdCard] = useState<DocumentFile | null>(null);
  const [backIdCard, setBackIdCard] = useState<DocumentFile | null>(null);

  const idTypes = [
    { label: "National ID Card (NIN)", value: "nin" },
    { label: "Driver's License", value: "drivers_license" },
    { label: "Voter's Card", value: "voters_card" },
    { label: "International Passport", value: "passport" },
    { label: "Permanent Voter's Card (PVC)", value: "pvc" },
  ];

  const pickDocument = async (type: "front" | "back") => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload documents."
        );
        return;
      }

      // Show action sheet for image source
      Alert.alert(
        "Select Image",
        "Choose how you want to select your ID card image",
        [
          {
            text: "Camera",
            onPress: () => takePhoto(type),
          },
          {
            text: "Photo Library",
            onPress: () => pickFromLibrary(type),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document. Please try again.");
    }
  };

  const takePhoto = async (type: "front" | "back") => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: DocumentFile = {
          uri: asset.uri,
          name: `id_card_${type}_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize || 0,
        };

        if (type === "front") {
          setFrontIdCard(file);
        } else {
          setBackIdCard(file);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickFromLibrary = async (type: "front" | "back") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: DocumentFile = {
          uri: asset.uri,
          name: `id_card_${type}_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize || 0,
        };

        // Check file size (15MB limit)
        const maxSize = 15 * 1024 * 1024; // 15MB in bytes
        if (file.size > maxSize) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 15MB."
          );
          return;
        }

        if (type === "front") {
          setFrontIdCard(file);
        } else {
          setBackIdCard(file);
        }
      }
    } catch (error) {
      console.error("Error picking from library:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleSubmit = async (values: FormValues) => {
    // Validate required documents
    if (!frontIdCard) {
      Alert.alert(
        "Missing Document",
        "Please upload the front side of your ID card."
      );
      return;
    }

    // Only require back image for non-passport documents
    if (values.idType !== "passport" && !backIdCard) {
      Alert.alert(
        "Missing Document",
        "Please upload the back side of your ID card."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for document upload and verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to step 3 with all data
      router.push({
        pathname: mechanicRoutes.step4,
        params: {
          ...params,
          idType: values.idType,
          nationalId: values.nationalId,
          documentsUploaded: "true",
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to submit documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push(routes.signIn);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5">
          <UserAuthHeader />
          {/* Progress Bar */}
          <View className="my-6">
            <ProgressBar step={2} totalSteps={3} />
          </View>

          <Formik
            initialValues={{
              idType: "",
              nationalId: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              isValid,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <View>
                {/* ID Type Select */}
                <SelectField
                  label="Government ID Type"
                  placeholder="Select your ID type"
                  options={idTypes}
                  value={values.idType}
                  onSelect={(value) => setFieldValue("idType", value)}
                  error={errors.idType}
                  touched={touched.idType}
                  labelStyle="mb-4 mt-2"
                  required={true}
                />

                {/* National ID Input */}
                <FormikInput
                  name="nationalId"
                  label={`National Identification Number (${
                    values.idType === "nin"
                      ? "NIN"
                      : values.idType === "drivers_license"
                      ? "License No."
                      : values.idType === "voters_card"
                      ? "VIN"
                      : values.idType === "passport"
                      ? "Passport No."
                      : values.idType === "pvc"
                      ? "PVC No."
                      : "ID No."
                  })`}
                  placeholder={`Enter ${
                    values.idType === "nin"
                      ? "NIN"
                      : values.idType === "drivers_license"
                      ? "License Number"
                      : values.idType === "voters_card"
                      ? "VIN"
                      : values.idType === "passport"
                      ? "Passport Number"
                      : values.idType === "pvc"
                      ? "PVC Number"
                      : "ID Number"
                  }`}
                  keyboardType="numeric"
                  maxLength={11}
                  required
                />

                {/* Front ID Card Upload */}
                <View className="mb-6">
                  <Text className="text-base font-NunitoBold text-gray-900 mb-3">
                    Upload Front National ID Card
                    <Text className="text-red-500"> *</Text>
                  </Text>

                  <TouchableOpacity
                    onPress={() => pickDocument("front")}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                      <View className="w-8 h-8 bg-red-600 rounded items-center justify-center">
                        <Text className="text-white font-bold text-lg">📄</Text>
                      </View>
                    </View>

                    <Text className="text-red-600 font-NunitoBold text-base text-center mb-2">
                      {frontIdCard
                        ? "Change Front Side of Card"
                        : "Click to Upload Front Side of Card"}
                    </Text>

                    <Text className="text-gray-500 font-NunitoMedium text-sm text-center">
                      (Max. File size: 15 MB)
                    </Text>

                    {frontIdCard && (
                      <Text className="text-green-600 font-NunitoMedium text-sm mt-2">
                        ✓ {frontIdCard.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Back ID Card Upload - Only show for non-passport documents */}
                {values.idType !== "passport" && (
                  <View className="mb-8">
                    <Text className="text-base font-NunitoBold text-gray-900 mb-3">
                      Upload Back National ID Card
                      <Text className="text-red-500"> *</Text>
                    </Text>

                    <TouchableOpacity
                      onPress={() => pickDocument("back")}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center bg-gray-50"
                      activeOpacity={0.7}
                    >
                      <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                        <View className="w-8 h-8 bg-red-600 rounded items-center justify-center">
                          <Text className="text-white font-bold text-lg">📄</Text>
                        </View>
                      </View>

                      <Text className="text-red-600 font-NunitoBold text-base text-center mb-2">
                        {backIdCard
                          ? "Change Back Side of Card"
                          : "Click to Upload Back Side of Card"}
                      </Text>

                      <Text className="text-gray-500 font-NunitoMedium text-sm text-center">
                        (Max. File size: 15 MB)
                      </Text>

                      {backIdCard && (
                        <Text className="text-green-600 font-NunitoMedium text-sm mt-2">
                          ✓ {backIdCard.name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Proceed Button */}
                <View className="mb-6">
                  <FormikButton
                    title="Proceed"
                    onPress={handleSubmit}
                    disabled={!isValid || !frontIdCard || (values.idType !== "passport" && !backIdCard)}
                    loading={isLoading}
                  />
                </View>

                {/* Sign In Link */}
                <View className="items-center mb-8">
                  <Text className="text-gray-600 font-NunitoMedium">
                    Already have an account?{" "}
                    <Text
                      className="text-red-600 font-NunitoBold"
                      onPress={handleSignIn}
                    >
                      Sign in
                    </Text>
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MechanicStep3;
