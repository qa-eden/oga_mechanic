"use client";

import {
  View,
  Text,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import { useState, useEffect } from "react";
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

const Step2 = () => {
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [vehicleColor, setVehicleColor] = useState<string | null>(null);

  const handleStep2Submit = (values: any, { setSubmitting }: any) => {
    console.log("Step 2 values:", values);
    setSubmitting(false);
    router.push(routes?.userStep3);
  };

  const handleSkip = () => {
    router.push(routes?.userStep3);
  };

  // Handle vehicle found callback
  const handleVehicleFound = (vehicleInfo: any) => {
    console.log('🚗 Vehicle found:', vehicleInfo);
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
          <UserAuthHeader />

          <View className="py-4">
            <ProgressBar step={2} totalSteps={3} />
          </View>

          <HeaderAndDescTextCenter
            header="Add your car details"
            text1="Kindly input your car details to continue"
            containerStyle="!px-0 !py-2"
          />

          <View className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" style={{ borderRadius: 10 }}>
            <Text className="text-sm text-blue-800 font-NunitoMedium mb-2">
              💡 <Text className="font-NunitoBold">Quick Tip:</Text> Enter
              your 17-character VIN to automatically populate vehicle details!
            </Text>
            <Text className="text-xs text-blue-600 font-NunitoMedium">
              The VIN can be found on your vehicle registration, insurance
              card, or on the driver's side dashboard.
            </Text>
          </View>

          <Formik
            initialValues={{
              vin: "",
              model: "",
              modelYear: "",
              vehicleType: "",
              engineType: "",
              transmission: "",
              bodyStyle: "",
              color: "",
            }}
            onSubmit={handleStep2Submit}
          >
            {({ setFieldValue, values }) => {
              // Watch for VIN changes and trigger lookup when it reaches 17 characters
              useEffect(() => {
                const vin = values.vin || "";
                
                // Reset processed VIN if user clears the field
                if (vin.length === 0) {
                  return;
                }

                // Auto-lookup when VIN reaches 17 characters
                if (vin.length === 17) {
                  // Add debounce to prevent multiple rapid calls
                  const timeoutId = setTimeout(() => {
                    handleVINLookup(vin, setFieldValue);
                  }, 1500); // 1.5 second delay

                  return () => clearTimeout(timeoutId);
                }
              }, [values.vin]);

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
                      model: vehicleInfo.model || "",
                      modelYear: vehicleInfo.modelYear || "",
                      vehicleType: vehicleInfo.vehicleType || "",
                      engineType: vehicleInfo.engineType || "",
                      transmission: vehicleInfo.transmission || "",
                      bodyStyle: vehicleInfo.bodyStyle || "",
                      color: vehicleInfo.color || vehicleInfo.exteriorColor || "",
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
                    required
                    onChangeText={(text) => {
                      // setCurrentVIN(text)
                      // Trigger VIN lookup when it reaches 17 characters
                      if (text.length === 17) {
                        setTimeout(() => {
                          handleVINLookup(text, setFieldValue)
                        }, 1500)
                      }
                    }}
                  />

                  {/* Vehicle Image and Color Display */}
                  {(vehicleImage || vehicleColor) && (
                    <View className="mb-4" style={{ minHeight: 120 }}>
                      <View className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Text className="text-sm font-NunitoBold text-gray-700 mb-3">
                          🚗 Vehicle Preview
                        </Text>

                        <View className="flex-row items-center">
                          {vehicleImage && (
                            <View className="mr-4">
                              <Image
                                source={{ uri: vehicleImage }}
                                className="w-20 h-16 rounded-lg"
                                resizeMode="cover"
                              />
                            </View>
                          )}

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
                    name="model"
                    label="Make & Model"
                    placeholder="Enter your make & model"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="modelYear"
                    label="Model Year"
                    placeholder="Enter your model year"
                    labelStyle="mt-2"
                    type="number"
                    keyboardType="numeric"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="vehicleType"
                    label="Vehicle Type"
                    placeholder="Enter your vehicle type"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="engineType"
                    label="Engine Type"
                    placeholder="Enter your engine type"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="transmission"
                    label="Transmission"
                    placeholder="Enter your transmission"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="bodyStyle"
                    label="Body Style"
                    placeholder="Enter your body style"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <FormikInput
                    name="color"
                    label="Vehicle Color"
                    placeholder="Enter your vehicle color"
                    labelStyle="mt-2"
                    type="text"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  <View style={{ height: 40 }} />

                  <FormikButton title="Proceed" className="py-4 mb-2" />

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

export default Step2;
