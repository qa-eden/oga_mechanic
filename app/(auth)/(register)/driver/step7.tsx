import React, { useState } from 'react'
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import BackArrowBtn from '@/components/BackArrowBtn'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Ionicons } from '@expo/vector-icons'

const validationSchema = Yup.object().shape({
  // No validation needed for final step, just confirmation
})

const Step7 = () => {
  const router = useRouter()
  const [documentsUploaded, setDocumentsUploaded] = useState({
    driversLicense: false,
    insuranceCard: false,
    vehicleRegistration: false,
    profilePhoto: false,
  })

  const handleDocumentUpload = (documentType: string) => {
    // Simulate document upload
    setDocumentsUploaded(prev => ({
      ...prev,
      [documentType]: !prev[documentType as keyof typeof prev]
    }))
  }

  const handleSubmit = () => {
    const allUploaded = Object.values(documentsUploaded).every(uploaded => uploaded)
    
    if (!allUploaded) {
      Alert.alert(
        'Documents Required',
        'Please upload all required documents before proceeding.',
        [{ text: 'OK' }]
      )
      return
    }

    Alert.alert(
      'Registration Complete!',
      'Your driver registration has been submitted successfully. We will review your application and contact you within 24-48 hours.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/(login)/sign_in')
        }
      ]
    )
  }

  const DocumentUploadItem = ({ 
    title, 
    description, 
    type, 
    isUploaded 
  }: { 
    title: string
    description: string
    type: string
    isUploaded: boolean
  }) => (
    <TouchableOpacity
      onPress={() => handleDocumentUpload(type)}
      className={`p-4 border-2 rounded-xl mb-4 ${
        isUploaded 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </Text>
          <Text className="text-gray-600 text-sm">
            {description}
          </Text>
        </View>
        <View className="ml-4">
          {isUploaded ? (
            <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={24} color="white" />
            </View>
          ) : (
            <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center">
              <Ionicons name="add" size={24} color="gray" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />
      
      <BackArrowBtn text="Go back" className="ml-4 mt-4" />

      <ScrollView className="flex-1 px-6">
        <View className="mt-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Document Upload
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Upload required documents to complete your registration
          </Text>

          <View className="space-y-4">
            <DocumentUploadItem
              title="Driver's License"
              description="Upload a clear photo of your driver's license (front and back)"
              type="driversLicense"
              isUploaded={documentsUploaded.driversLicense}
            />

            <DocumentUploadItem
              title="Insurance Card"
              description="Upload your current auto insurance card"
              type="insuranceCard"
              isUploaded={documentsUploaded.insuranceCard}
            />

            <DocumentUploadItem
              title="Vehicle Registration"
              description="Upload your vehicle registration document"
              type="vehicleRegistration"
              isUploaded={documentsUploaded.vehicleRegistration}
            />

            <DocumentUploadItem
              title="Profile Photo"
              description="Upload a clear, professional headshot"
              type="profilePhoto"
              isUploaded={documentsUploaded.profilePhoto}
            />
          </View>

          <View className="mt-8 mb-8">
            <Text className="text-sm text-gray-500 text-center mb-4">
              By submitting this application, you agree to our terms of service and privacy policy.
            </Text>

            <CustomButton
              title="Submit Application"
              onPress={handleSubmit}
              className="py-5"
            />
          </View>
        </View>
      </ScrollView>
    </RNSafeAreaView>
  )
}

export default Step7
