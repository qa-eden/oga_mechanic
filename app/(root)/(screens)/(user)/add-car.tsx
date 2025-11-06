"use client";

import {
  View,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import VINInput from "@/components/VINInput";
import ImageUpload from "@/components/ImageUpload";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { decodeVINWithImage } from "@/utils/vinDecoder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "@/lib/api/user";
import BackArrowBtn from "@/components/BackArrowBtn";

const AddCar = () => {
  const queryClient = useQueryClient();
  const [frontSideImage, setFrontSideImage] = useState("");
  const [backSideImage, setBackSideImage] = useState("");
  const [rightSideImage, setRightSideImage] = useState("");
  const [leftSideImage, setLeftSideImage] = useState("");

  const addCarMutation = useMutation({
    mutationFn: userAPI.addCar,
    onSuccess: () => {
      // Invalidate and refetch cars list
      queryClient.invalidateQueries({ queryKey: ["userCars"] });
      Alert.alert(
        "Success!",
        "Your car has been added successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      // Extract error message from API response
      let errorMessage = "Failed to add car. Please try again.";

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.message) {
          errorMessage = errors.message;
        } else if (typeof errors === "object") {
          // Handle field-specific errors
          const errorMessages = Object.values(errors).flat();
          errorMessage = errorMessages.join(", ");
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    },
  });

  const handleImageUpload = async (side: "front" | "back" | "right" | "left") => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images.",
          [{ text: "OK" }]
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // Update the appropriate state
        switch (side) {
          case "front":
            setFrontSideImage(imageUri);
            break;
          case "back":
            setBackSideImage(imageUri);
            break;
          case "right":
            setRightSideImage(imageUri);
            break;
          case "left":
            setLeftSideImage(imageUri);
            break;
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await addCarMutation.mutateAsync({
        vin: values.vin || "",
        car_make: values.car_make || "",
        car_model: values.car_model || "",
        car_year: values.car_year ? parseInt(values.car_year) : undefined,
        license_plate: values.license_plate || "",
        // Include images if needed by API
        front_image: frontSideImage || undefined,
        back_image: backSideImage || undefined,
        right_image: rightSideImage || undefined,
        left_image: leftSideImage || undefined,
      });
    } catch (error) {
      // Error is handled in onError callback
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Simple Header */}
      <View className="flex-row items-center px-5 py-4 bg-white">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900 ml-4">
          Add Car
        </Text>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-4">

          <Formik
            initialValues={{
              vin: "",
              car_make: "",
              car_model: "",
              car_year: "",
              license_plate: "",
            }}
            onSubmit={handleSubmit}
            validate={(values) => {
              const errors: any = {};

              if (!values.car_make || values.car_make.trim() === "") {
                errors.car_make = "Car make is required";
              }

              if (!values.car_model || values.car_model.trim() === "") {
                errors.car_model = "Car model is required";
              }

              if (!values.car_year || values.car_year.trim() === "") {
                errors.car_year = "Car year is required";
              } else {
                const year = parseInt(values.car_year);
                const currentYear = new Date().getFullYear();
                if (isNaN(year) || year < 1900 || year > currentYear + 1) {
                  errors.car_year = "Please enter a valid year";
                }
              }

              return errors;
            }}
          >
            {({ setFieldValue, values, errors, touched }) => {
              // Handle VIN lookup
              const handleVINLookup = async (vin: string, setFieldValue: any) => {
                if (!vin || vin.length < 17) {
                  return;
                }

                try {
                  const vehicleInfo = await decodeVINWithImage(vin);

                  if (vehicleInfo) {
                    // Batch all field updates to prevent multiple re-renders
                    const updates = {
                      car_make: vehicleInfo.make || "",
                      car_model: vehicleInfo.model || "",
                      car_year: vehicleInfo.modelYear || "",
                    };

                    // Apply all updates at once
                    Object.entries(updates).forEach(([field, value]) => {
                      setFieldValue(field, value);
                    });

                    Alert.alert(
                      "Vehicle Found!",
                      `Successfully loaded details for ${vehicleInfo.make} ${vehicleInfo.model}`,
                      [{ text: "OK" }]
                    );
                  }
                } catch (error: any) {
                  Alert.alert(
                    "VIN Lookup Failed",
                    error.message ||
                      "Unable to find vehicle information for this VIN. Please check the VIN and try again.",
                    [{ text: "OK" }]
                  );
                }
              };

              return (
                <View>
                  <VINInput
                    name="vin"
                    label="VIN (Optional)"
                    placeholder="Enter VIN to auto-fill details"
                    showLookupButton={true}
                    onVINLookup={handleVINLookup}
                  />

                  <FormikInput
                    name="car_make"
                    label="Car Make"
                    placeholder="e.g., Toyota"
                    labelStyle="mt-4"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                    required
                  />

                  <FormikInput
                    name="car_model"
                    label="Car Model"
                    placeholder="e.g., Corolla"
                    labelStyle="mt-4"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                    required
                  />

                  <FormikInput
                    name="car_year"
                    label="Year"
                    placeholder="e.g., 2020"
                    labelStyle="mt-4"
                    type="number"
                    keyboardType="numeric"
                    autoCorrect={false}
                    required
                  />

                  <FormikInput
                    name="license_plate"
                    label="License Plate (Optional)"
                    placeholder="e.g., ABC123"
                    labelStyle="mt-4"
                    type="text"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />

                  {/* Car Images Section */}
                  <View className="mt-6">
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4">
                      Car Images (Optional)
                    </Text>
                    
                    {/* 2x2 Grid for Car Images */}
                    <View className="space-y-4">
                      {/* Top Row */}
                      <View className="flex-row space-x-4 gap-2">
                        {/* Front Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Front Side"
                            isUploaded={!!frontSideImage}
                            onPress={() => handleImageUpload("front")}
                            uploadedText="Front Side Uploaded"
                            imageUri={frontSideImage}
                            carSide="front"
                          />
                        </View>

                        {/* Back Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Back Side"
                            isUploaded={!!backSideImage}
                            onPress={() => handleImageUpload("back")}
                            uploadedText="Back Side Uploaded"
                            imageUri={backSideImage}
                            carSide="back"
                          />
                        </View>
                      </View>

                      {/* Bottom Row */}
                      <View className="flex-row space-x-4 gap-2">
                        {/* Right Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Right Side"
                            isUploaded={!!rightSideImage}
                            onPress={() => handleImageUpload("right")}
                            uploadedText="Right Side Uploaded"
                            imageUri={rightSideImage}
                            carSide="right"
                          />
                        </View>

                        {/* Left Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Left Side"
                            isUploaded={!!leftSideImage}
                            onPress={() => handleImageUpload("left")}
                            uploadedText="Left Side Uploaded"
                            imageUri={leftSideImage}
                            carSide="left"
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="mt-6">
                    <FormikButton
                      title="Add Car"
                      className="py-4"
                      loading={addCarMutation.isPending}
                    />
                  </View>
                </View>
              );
            }}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddCar;

