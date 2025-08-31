import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import CustomButton from '@/components/CustomButton'
import FormikInput from '@/components/forms/FormikInput'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { CalendarIcon } from 'react-native-heroicons/outline'
import DatePicker from '@/components/DatePicker'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import ImageUpload from '@/components/ImageUpload'
import AuthNavigateLink from '@/components/AuthNavigateLink'
import { driverRoutes, routes } from '@/constants/routes'

const validationSchema = Yup.object().shape({
  drivingLicenseNumber: Yup.string().required('Driving license number is required'),
  issueDate: Yup.string().required('Issue date is required'),
  expiryDate: Yup.string().required('Expiry date is required'),
  frontSideImage: Yup.string().required('Front side image is required'),
  backSideImage: Yup.string().required('Back side image is required'),
})

const Step4 = () => {
  const router = useRouter()
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false)
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false)
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [frontSideImage, setFrontSideImage] = useState('')
  const [backSideImage, setBackSideImage] = useState('')

  const handleSubmit = (values: any) => {
    console.log('Driving License Info:', {
      ...values,
      issueDate,
      expiryDate,
      frontSideImage,
      backSideImage
    })
    router.push('/(auth)/(register)/driver/step5')
  }

  const handleImageUpload = async (side: 'front' | 'back') => {
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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (side === 'front') {
          setFrontSideImage(result.assets[0].uri);
        } else {
          setBackSideImage(result.assets[0].uri);
        }
        console.log(`${side} side image uploaded:`, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />

      <ScrollView className="flex-1 px-4">
        {/* Header with Logo and Progress */}
        <View className=" w-full ">
          <UserAuthHeader />

          <View className="pt-4 pb-2">
            <ProgressBar step={3} totalSteps={6} />
          </View>
        </View>

        {/* Driving License Form */}
        <View className="mt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Driving License Details
          </Text>
          <Text className="text-lg text-gray-600 mb-4">
            Enter your license information and upload images
          </Text>

          <Formik
            initialValues={{
              drivingLicenseNumber: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, isValid, values }) => {
              // Check if all required fields are filled including local state
              const isFormValid = values.drivingLicenseNumber &&
                issueDate &&
                expiryDate &&
                frontSideImage &&
                backSideImage

              return (
                <View className="space-y-6">
                  {/* Driving License Number */}
                  <FormikInput
                    name="drivingLicenseNumber"
                    placeholder="Enter driving license number"
                    label="Driving License Number"
                    required
                  />

                  {/* Issue Date and Expiry Date Row */}
                  <View className="flex-row space-x-4 gap-4">
                    {/* Issue Date */}
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700 mb-2">Issue Date <Text className="text-red-500 text-lg">*</Text></Text>
                      <TouchableOpacity
                        className="bg-gray-50 border border-gray-400 rounded-xl px-4 py-4 flex-row items-center justify-between"
                        onPress={() => setShowIssueDatePicker(true)}
                      >
                        <Text className="text-gray-900">{issueDate || 'DD/MM/YYYY'}</Text>
                        <CalendarIcon size={20} color="gray" />
                      </TouchableOpacity>
                    </View>

                    {/* Expiry Date */}
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700 mb-2">Expiry Date <Text className="text-red-500 text-lg">*</Text></Text>
                      <TouchableOpacity
                        className="bg-gray-50 border border-gray-400 rounded-xl px-4 py-4 flex-row items-center justify-between"
                        onPress={() => setShowExpiryDatePicker(true)}
                      >
                        <Text className="text-gray-900">{expiryDate || 'DD/MM/YYYY'}</Text>
                        <CalendarIcon size={20} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Front Side of Card Upload */}
                  <View className='my-4'>
                    <ImageUpload
                      label="Front Side of Card"
                      required
                      isUploaded={!!frontSideImage}
                      onPress={() => handleImageUpload('front')}
                      uploadedText="Front Side Uploaded"
                      imageUri={frontSideImage}
                    />
                  </View>

                  {/* Back Side of Card Upload */}
                  <ImageUpload
                    label="Back Side of Card"
                    required
                    isUploaded={!!backSideImage}
                    onPress={() => handleImageUpload('back')}
                    uploadedText="Back Side Uploaded"
                    imageUri={backSideImage}
                  />

                  {/* Proceed Button */}
                  <View className="mt-8">
                    <CustomButton
                      title="Proceed"
                      onPress={() => { handleSubmit(); router.push(driverRoutes.step5) }}
                      disabled={!isFormValid}
                      className="py-5"
                    />
                  </View>

                  {/* Sign In Link */}
                <View className='my-4'>
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

      {/* Date Pickers */}
      <DatePicker
        visible={showIssueDatePicker}
        onClose={() => setShowIssueDatePicker(false)}
        onDateSelect={(date) => setIssueDate(date)}
        selectedDate={issueDate}
        title="Select Issue Date"
      />

      <DatePicker
        visible={showExpiryDatePicker}
        onClose={() => setShowExpiryDatePicker(false)}
        onDateSelect={(date) => setExpiryDate(date)}
        selectedDate={expiryDate}
        title="Select Expiry Date"
      />
    </RNSafeAreaView>
  )
}

export default Step4
