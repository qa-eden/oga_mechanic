"use client";

import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import { useState } from "react";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import CustomButton from "@/components/CustomButton";
import VINInput from "@/components/VINInput";
import { router } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { routes } from "@/constants/routes";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { decodeVINWithImage } from "@/utils/vinDecoder";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRegisterVehicle } from "@/hooks/useRegistration";

const Step3 = () => {
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [vehicleColor, setVehicleColor] = useState<string | null>(null);
  const { isStepByStepMode } = useRegistrationStore();
  const registerVehicleMutation = useRegisterVehicle();

  const handleStep2Submit = async (values: any, { setSubmitting }: any) => {

    if (isStepByStepMode) {
      // Use TanStack Query mutation for vehicle registration
      registerVehicleMutation.mutate({
        has_car: true,
        car_make: values.car_make || '',
        car_model: values.car_model || '',
        car_year: values.car_year ? parseInt(values.car_year) : undefined,
        license_plate: values.license_plate || ''
      }, {
        onSuccess: () => {
          setSubmitting(false);
          router.push(routes?.userStep4);
        },
        onError: (error: any) => {
          setSubmitting(false);
          
          // Extract error message from API response
          let errorMessage = 'Vehicle registration failed. Please try again.';
          
          if (error?.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (errors.message) {
              errorMessage = errors.message;
            }
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          // Show error alert
          Alert.alert(
            'Vehicle Registration Error',
            errorMessage,
            [{ text: 'OK' }]
          );
          
          // Don't navigate on error - let user fix the issue
        }
      });
    } else {
      setSubmitting(false);
      router.push(routes?.userStep4);
    }
  };

  const handleSkip = () => {
    if (isStepByStepMode) {
      // Use TanStack Query mutation for skip (no car)
      registerVehicleMutation.mutate({
        has_car: false
      }, {
        onSuccess: () => {
          router.push(routes?.userStep4);
        },
        onError: (error: any) => {
          
          // Extract error message from API response
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error?.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (errors.message) {
              errorMessage = errors.message;
            }
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          // Show error alert
          Alert.alert(
            'Registration Error',
            errorMessage,
            [{ text: 'OK' }]
          );
          
          // Don't navigate on error - let user try again
        }
      });
    } else {
      router.push(routes?.userStep4);
    }
  };

  // Handle vehicle found callback
  const handleVehicleFound = (vehicleInfo: any) => {
    // Update UI state
    setVehicleImage(vehicleInfo.imageUrl || null);
    setVehicleColor(vehicleInfo.color || vehicleInfo.exteriorColor || null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={80}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <UserAuthHeader>
            <TouchableOpacity
              onPress={handleSkip}
              className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2 items-center justify-center shadow-sm active:bg-gray-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-gray-600 text-sm font-NunitoSemiBold">Skip for now</Text>
            </TouchableOpacity>
          </UserAuthHeader>

          <View className="py-4">
            <ProgressBar step={3} totalSteps={4} />
          </View>

          <HeaderAndDescTextCenter
            header="Add your car details"
            text1="Kindly input your car details to continue"
            containerStyle="!px-0 !pt-2 !pb-6"
            textStyle="!py-0"
          />

          <Formik
            initialValues={{
              vin: "",
              car_make: "",
              car_model: "",
              car_year: "",
              license_plate: "",
            }}
            onSubmit={handleStep2Submit}
          >
            {({ setFieldValue, values }) => {

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

                    // Update UI state
                    setVehicleImage(vehicleInfo.imageUrl || null);
                    setVehicleColor(vehicleInfo.color || vehicleInfo.exteriorColor || null);

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
                <View style={{ minHeight: 600 }}>
                  <VINInput
                    name="vin"
                    label="VIN-Vehicle Identification Number"
                    placeholder="Enter your VIN (17 characters)"
                    showLookupButton={true}
                    onVINLookup={handleVINLookup}
                  />

                  {/* Vehicle Image and Color Display */}
                  {(vehicleImage || vehicleColor) && (
                    <View className="mb-4" style={{ minHeight: 120 }}>
                      <View className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Text className="text-sm font-NunitoBold text-gray-700 mb-3">
                          🚗 Vehicle Preview
                        </Text>

                        <View className="flex-row items-center">
                          {/* {vehicleImage && (
                            <View className="mr-4">
                              <Image
                                source={{ uri: vehicleImage }}
                                className="w-20 h-16 rounded-lg"
                                resizeMode="cover"
                              />
                            </View>
                          )} */}

                          <View className="flex-1">
                            {vehicleColor && (
                              <View className="flex-row items-center mb-2">
                                <View
                                  className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                  style={{
                                    backgroundColor: vehicleColor,
                                  }}
                                />
                                <Text className="text-sm font-NunitoMedium text-gray-600">
                                  Color: {vehicleColor}
                                </Text>
                              </View>
                            )}

                            <Text className="text-xs text-gray-500 font-NunitoMedium">
                              Vehicle details loaded successfully
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  <FormikInput
                    name="car_make"
                    label="Car Make"
                    placeholder="Enter your car make (e.g., Toyota)"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="car_model"
                    label="Car Model"
                    placeholder="Enter your car model (e.g., Corolla)"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="car_year"
                    label="Car Year"
                    placeholder="Enter your car year (e.g., 2020)"
                    labelStyle="mt-2"
                    type="number"
                    keyboardType="numeric"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="license_plate"
                    label="License Plate"
                    placeholder="Enter your license plate (e.g., ABC123)"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />

                  <View style={{ height: 40 }} />

                  <FormikButton
                    title="Proceed"
                    className="py-4 mb-2"
                    loading={registerVehicleMutation.isPending}
                  />

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
              );
            }}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Step3;