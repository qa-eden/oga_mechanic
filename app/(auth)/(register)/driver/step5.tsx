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
    
    try {
      console.log('🔍 Starting VIN lookup for:', vin);
      
      // Simple VIN lookup without complex error handling
      let vehicleInfo = null;
      try {
        vehicleInfo = await decodeVINWithImage(vin);
      } catch (decodeError) {
        console.error('❌ VIN decode error:', decodeError);
        vehicleInfo = null;
      }

      if (vehicleInfo && isMounted) {
        console.log('✅ Vehicle info received:', vehicleInfo);
        
        // Simple field mapping
        const fieldMappings = {
          make: vehicleInfo.make || "",
          vehicleName: vehicleInfo.model || "",
          vehiclePlateNumber: "",
          carModel: vehicleInfo.model || "",
          carColor: vehicleInfo.color || vehicleInfo.exteriorColor || "Unknown",
          modelYear: vehicleInfo.modelYear || "",
          vehicleType: vehicleInfo.vehicleType || "",
          engineType: vehicleInfo.engineType || "Unknown",
          transmission: vehicleInfo.transmission || "Unknown",
          bodyStyle: vehicleInfo.bodyStyle || "",
        };

        // Apply field updates
        Object.entries(fieldMappings).forEach(([field, value]) => {
          if (isMounted && setFieldValue) {
            try {
              setFieldValue(field, value);
            } catch (fieldError) {
              console.error(`❌ Error setting field ${field}:`, fieldError);
            }
          }
        });

        // Show success message
        if (isMounted) {
          Alert.alert(
            "Vehicle Found!",
            `Successfully loaded details for ${vehicleInfo.make || 'Unknown'} ${vehicleInfo.model || 'Vehicle'}`,
            [{ text: "OK" }]
          );
        }
      } else {
        // Show info message if no vehicle found
        if (isMounted) {
          Alert.alert(
            "VIN Lookup",
            "Vehicle information not found for this VIN. You can still fill in the details manually.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error: any) {
      console.error('❌ VIN lookup error:', error);
      if (isMounted) {
        Alert.alert(
          "VIN Lookup",
          "There was an issue looking up the VIN. You can continue filling in the form manually.",
          [{ text: "OK" }]
        );
      }
    } finally {
      if (isMounted) {
        setIsVINLoading(false);
      }
    }
  }, [isMounted, isVINLoading]);

  const handleSubmit = (values: any) => {
    try {
      if (!isMounted) return

      console.log('Vehicle Information:', {
        ...values,
        frontSideImage,
        backSideImage,
        rightSideImage,
        leftSideImage
      })
      
      // Safe navigation
      if (router && driverRoutes.step6) {
        router.push(driverRoutes.step6)
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      // Don't crash - just log the error
    }
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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && isMounted) {
        const imageUri = result.assets[0].uri;

        // Simple state update
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
      }
    } catch (error) {
      console.error('❌ Error in image upload:', error);
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
              const isFormValid = !!(
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
              );

              return (
                <View className="space-y-6">
                  {/* VIN */}
                  <View className='mb-4'>
                    <VINInput
                      name="vin"
                      placeholder="Enter VIN"
                      label="VIN"
                      showLookupButton={false}
                      onChangeText={(text) => {
                        setCurrentVIN(text)
                        // Auto-trigger VIN lookup when it reaches 17 characters
                        if (text.length === 17) {
                          console.log('🔄 VIN ready for lookup:', text);
                          // Simple lookup without complex timeout
                          handleVINLookup(text, setFieldValue);
                        }
                      }}
                      onVINLookup={handleVINLookup}
                    />
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
                        onPress={() => { 
                          router.push(driverRoutes.step6)
                          handleSubmit(); 
                        }}
                        disabled={!isFormValid}
                        className="py-5"
                      />
                    </View>

                    {/* Sign In Link */}
                    <View className="my-4">
                      <AuthNavigateLink
                        onPress={() => {
                          router.push(routes.signIn)
                        }}
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
