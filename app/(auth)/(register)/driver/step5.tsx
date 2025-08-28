import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import CustomButton from '@/components/CustomButton'
import FormikInput from '@/components/forms/FormikInput'
import VINInput from '@/components/VINInput'
import { Formik } from 'formik'
import * as Yup from 'yup'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import ImageUpload from '@/components/ImageUpload'
import AuthNavigateLink from '@/components/AuthNavigateLink'
import { driverRoutes, routes } from '@/constants/routes'
import { decodeVINWithImage } from '@/utils/vinDecoder'

const validationSchema = Yup.object().shape({
  vin: Yup.string(), // VIN is now optional
  make: Yup.string().required('Vehicle make is required'),
  vehicleName: Yup.string().required('Vehicle name is required'),
  vehiclePlateNumber: Yup.string().required('Vehicle plate number is required'),
  carModel: Yup.string().required('Car model is required'),
  carColor: Yup.string().required('Car color is required'),
  modelYear: Yup.string().required('Model year is required'),
  vehicleType: Yup.string().required('Vehicle type is required'),
  engineType: Yup.string().required('Engine type is required'),
  transmission: Yup.string().required('Transmission is required'),
  bodyStyle: Yup.string().required('Body style is required'),
  frontSideImage: Yup.string().required('Front side image is required'),
  backSideImage: Yup.string().required('Back side image is required'),
  rightSideImage: Yup.string().required('Right side image is required'),
  leftSideImage: Yup.string().required('Left side image is required'),
})

const Step5 = () => {
  const router = useRouter()
  const [frontSideImage, setFrontSideImage] = useState('')
  const [backSideImage, setBackSideImage] = useState('')
  const [rightSideImage, setRightSideImage] = useState('')
  const [leftSideImage, setLeftSideImage] = useState('')
  const [isMounted, setIsMounted] = useState(true)
  const [currentVIN, setCurrentVIN] = useState('')
  const [isVINLoading, setIsVINLoading] = useState(false)

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

  // Handle VIN lookup
  const handleVINLookup = useCallback(async (vin: string, setFieldValue: any) => {
    if (!vin || vin.length < 17 || !isMounted || isVINLoading) {
      return;
    }

    setIsVINLoading(true);
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsVINLoading(false);
        try {
          Alert.alert(
            "VIN Lookup Timeout",
            "The VIN lookup is taking too long. You can continue filling in the form manually.",
            [{ text: "OK" }]
          );
        } catch (alertError) {
          console.error('❌ Error showing timeout alert:', alertError);
        }
      }
    }, 30000); // 30 second timeout
    
    try {
      console.log('🔍 Starting VIN lookup for:', vin);
      
      // Wrap the entire VIN lookup in a try-catch to prevent any crashes
      let vehicleInfo = null;
      try {
        vehicleInfo = await decodeVINWithImage(vin);
      } catch (decodeError) {
        console.error('❌ VIN decode error:', decodeError);
        // Don't throw - just continue with empty data
        vehicleInfo = null;
      }

      if (vehicleInfo && isMounted) {
        console.log('✅ Vehicle info received:', vehicleInfo);
        console.log('🔍 Available fields:', Object.keys(vehicleInfo));
        
        // Map all fields correctly to match the form structure
        const fieldMappings = {
          make: vehicleInfo.make || "",
          vehicleName: vehicleInfo.model || "",
          vehiclePlateNumber: "", // Leave empty for user to fill
          carModel: vehicleInfo.model || "",
          carColor: vehicleInfo.color || vehicleInfo.exteriorColor || "Unknown", // Fallback to "Unknown"
          modelYear: vehicleInfo.modelYear || "",
          vehicleType: vehicleInfo.vehicleType || "",
          engineType: vehicleInfo.engineType || "Unknown", // Fallback to "Unknown"
          transmission: vehicleInfo.transmission || "Unknown", // Fallback to "Unknown"
          bodyStyle: vehicleInfo.bodyStyle || "",
        };

        console.log('🔄 Field mappings:', fieldMappings);

        // Apply all updates safely with individual try-catch blocks
        Object.entries(fieldMappings).forEach(([field, value]) => {
          if (isMounted && setFieldValue) {
            try {
              setFieldValue(field, value);
              console.log(`✅ Set ${field} to: ${value}`);
            } catch (fieldError) {
              console.error(`❌ Error setting field ${field}:`, fieldError);
              // Continue with other fields even if one fails
            }
          }
        });

        if (isMounted) {
          try {
            Alert.alert(
              "Vehicle Found!",
              `Successfully loaded details for ${vehicleInfo.make || 'Unknown'} ${vehicleInfo.model || 'Vehicle'}`,
              [{ text: "OK" }]
            );
          } catch (alertError) {
            console.error('❌ Error showing success alert:', alertError);
          }
        }
      } else {
        // VIN lookup failed but didn't crash - show user-friendly message
        if (isMounted) {
          try {
            Alert.alert(
              "VIN Lookup",
              "Vehicle information not found for this VIN. You can still fill in the details manually.",
              [{ text: "OK" }]
            );
          } catch (alertError) {
            console.error('❌ Error showing info alert:', alertError);
          }
        }
      }
    } catch (error: any) {
      console.error('❌ VIN lookup error:', error);
      // Show user-friendly error message without crashing
      if (isMounted) {
        try {
          Alert.alert(
            "VIN Lookup",
            "There was an issue looking up the VIN. You can continue filling in the form manually.",
            [{ text: "OK" }]
          );
        } catch (alertError) {
          console.error('❌ Error showing error alert:', alertError);
        }
      }
    } finally {
      clearTimeout(timeoutId); // Clear the timeout
      if (isMounted) {
        setIsVINLoading(false);
      }
    }
  }, [isMounted, isVINLoading]);

  // Watch for VIN changes and trigger lookup when it reaches 17 characters
  useEffect(() => {
    if (!currentVIN || currentVIN.length !== 17) {
      return;
    }

    // Add debounce to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      // We'll need to pass setFieldValue from Formik context
      if (isMounted) {
      }
    }, 1500); // 1.5 second delay

    return () => clearTimeout(timeoutId);
  }, [currentVIN, isMounted]);

  const handleSubmit = (values: any) => {
    if (!isMounted) return

    console.log('Vehicle Information:', {
      ...values,
      frontSideImage,
      backSideImage,
      rightSideImage,
      leftSideImage
    })
    router.push(driverRoutes.step6)
  }

  const handleImageUpload = async (side: 'front' | 'back' | 'right' | 'left') => {
    if (!isMounted) return

    try {

      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && isMounted) {
        const imageUri = result.assets[0].uri;

        switch (side) {
          case 'front':
            setFrontSideImage(imageUri);
            break;
          case 'back':
            setBackSideImage(imageUri);
            break;
          case 'right':
            setRightSideImage(imageUri);
            break;
          case 'left':
            setLeftSideImage(imageUri);
            break;
        }
      } else {
      }
    } catch (error) {
      if (isMounted) {
        Alert.alert(
          'Error',
          'Failed to pick image. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }

  return (
    <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />

      <ScrollView className="flex-1 px-4">
        {/* Header with Logo and Progress */}
        <View className="w-full">
          <UserAuthHeader />

          <View className="pt-4 pb-2">
            <ProgressBar step={4} totalSteps={6} />
          </View>
        </View>

        {/* Vehicle Information Form */}
        <View className="mt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Vehicle Information
          </Text>
          <Text className="text-lg text-gray-600 mb-6">
            Enter your vehicle details
          </Text>

          <Formik
            initialValues={{
              vin: '',
              make: '',
              vehicleName: '',
              vehiclePlateNumber: '',
              carModel: '',
              carColor: '',
              modelYear: '',
              vehicleType: '',
              engineType: '',
              transmission: '',
              bodyStyle: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, isValid, values, setFieldValue }) => {
              // Check if all required fields are filled including local state
              const isFormValid = values.vin &&
                values.make &&
                values.vehicleName &&
                values.vehiclePlateNumber &&
                values.carModel &&
                values.carColor &&
                values.modelYear &&
                values.vehicleType &&
                values.engineType &&
                values.transmission &&
                values.bodyStyle &&
                frontSideImage &&
                backSideImage &&
                rightSideImage &&
                leftSideImage

              // Handle vehicle found callback
              const handleVehicleFound = (vehicleInfo: any) => {
                console.log('🚗 Vehicle found:', vehicleInfo)
                // Additional logic can be added here if needed
              }

              return (
                <View className="space-y-6">
                  {/* VIN */}
                  <View className='mb-4'>
                    <VINInput
                      name="vin"
                      placeholder="Enter VIN"
                      label="VIN"
                      onChangeText={(text) => {
                        try {
                          setCurrentVIN(text)
                          // Only trigger VIN lookup if we have a valid VIN and setFieldValue
                          if (text.length === 17) {
                            console.log('🔄 VIN ready for lookup:', text);
                            // Use a safer timeout approach
                            setTimeout(() => {
                              try {
                                if (isMounted && text === currentVIN) {
                                  handleVINLookup(text, setFieldValue);
                                }
                              } catch (error) {
                                console.error('❌ Error in VIN lookup timeout:', error);
                                // Don't crash - just log the error
                              }
                            }, 1500);
                          }
                        } catch (error) {
                          console.error('❌ Error in VIN onChangeText:', error);
                          // Don't crash - just log the error
                        }
                      }}
                    />
                    
                    {/* Manual VIN Lookup Button */}
                    {currentVIN.length === 17 && (
                      <View className="mt-2">
                        <CustomButton
                          title={isVINLoading ? "🔍 Looking up..." : "🔍 Lookup Vehicle Details"}
                          onPress={() => {
                            try {
                              handleVINLookup(currentVIN, setFieldValue);
                            } catch (error) {
                              console.error('❌ Error in manual VIN lookup:', error);
                              // Don't crash - show user-friendly message
                              try {
                                Alert.alert(
                                  "Lookup Error",
                                  "There was an error looking up the VIN. You can continue filling in the form manually.",
                                  [{ text: "OK" }]
                                );
                              } catch (alertError) {
                                console.error('❌ Error showing error alert:', alertError);
                              }
                            }
                          }}
                          disabled={isVINLoading}
                          className="py-2"
                        />
                      </View>
                    )}
                  </View>

                  {/* Vehicle Make */}
                  <FormikInput
                    name="make"
                    placeholder="Vehicle make"
                    label="Vehicle Make"
                    required
                  />

                  {/* Vehicle Name */}
                  <FormikInput
                    name="vehicleName"
                    placeholder="Enter vehicle name"
                    label="Vehicle Name"
                    required
                  />

                  {/* Vehicle Plate Number */}
                  <FormikInput
                    name="vehiclePlateNumber"
                    placeholder="Enter plate number"
                    label="Vehicle Plate Number"
                    required
                  />

                  {/* Car Model */}
                  <FormikInput
                    name="carModel"
                    placeholder="Enter car model"
                    label="Car Model"
                    required
                  />

                  {/* Car Color */}
                  <FormikInput
                    name="carColor"
                    placeholder="Enter car color"
                    label="Car Color"
                    required
                  />

                  {/* Model Year */}
                  <FormikInput
                    name="modelYear"
                    placeholder="Enter model year"
                    label="Model Year"
                    required
                    keyboardType="numeric"
                  />

                  {/* Vehicle Type */}
                  <FormikInput
                    name="vehicleType"
                    placeholder="Enter vehicle type"
                    label="Vehicle Type"
                    required
                  />

                  {/* Engine Type */}
                  <FormikInput
                    name="engineType"
                    placeholder="Enter engine type"
                    label="Engine Type"
                    required
                  />

                  {/* Transmission */}
                  <FormikInput
                    name="transmission"
                    placeholder="Enter transmission"
                    label="Transmission"
                    required
                  />

                  {/* Body Style */}
                  <FormikInput
                    name="bodyStyle"
                    placeholder="Enter body style"
                    label="Body Style"
                    required
                  />

                  {/* Required Imagery Section */}
                  <View className="bg-gray-50 rounded-xl">
                    <Text className="text-lg font-semibold text-gray-900 mb-4 bg-gray-200 p-2 text-center">
                      Required Imagery <Text className="text-red-500 text-lg">*</Text>
                    </Text>

                    {/* 2x2 Grid for Car Images */}
                    <View className="space-y-4 gap-2">
                      {/* Top Row */}
                      <View className="flex-row space-x-4 gap-2">
                        {/* Front Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Front Side of Car"
                            required
                            isUploaded={!!frontSideImage}
                            onPress={() => handleImageUpload('front')}
                            uploadedText="Front Side Uploaded"
                            imageUri={frontSideImage}
                            carSide="front"
                          />
                        </View>

                        {/* Back Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Back Side of Car"
                            required
                            isUploaded={!!backSideImage}
                            onPress={() => handleImageUpload('back')}
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
                            label="Right Side of Car"
                            required
                            isUploaded={!!rightSideImage}
                            onPress={() => handleImageUpload('right')}
                            uploadedText="Right Side Uploaded"
                            imageUri={rightSideImage}
                            carSide="right"
                          />
                        </View>

                        {/* Left Side */}
                        <View className="flex-1">
                          <ImageUpload
                            label="Left Side of Car"
                            required
                            isUploaded={!!leftSideImage}
                            onPress={() => handleImageUpload('left')}
                            uploadedText="Left Side Uploaded"
                            imageUri={leftSideImage}
                            carSide="left"
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Proceed Button */}
                  <View className="mt-8">
                    <CustomButton
                      title="Proceed"
                      onPress={() => { handleSubmit(); router.push(driverRoutes.step6) }}
                      disabled={!isFormValid}
                      className="py-5"
                    />
                  </View>

                  {/* Sign In Link */}
                  <View className="my-4">
                    <AuthNavigateLink
                      onPress={() => router?.push(routes?.signIn)}
                      text="Already have an account?"
                      textLink="Sign In"
                      containerClassName="mb-6"
                    />
                  </View>
                </View>
              )
            }}
          </Formik>
        </View>
      </ScrollView>
    </RNSafeAreaView>
  )
}

export default Step5
