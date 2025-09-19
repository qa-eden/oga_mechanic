import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon, ChevronDownIcon } from 'react-native-heroicons/outline'
import { router } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormikInput from '@/components/forms/FormikInput'
import SelectField from '@/components/forms/SelectField'
import ImageUploadSection from '@/components/ImageUploadSection'

const UploadProducts = () => {
  const [images, setImages] = useState<string[]>([])

  const carTypeOptions = [
    { label: 'Sedan', value: 'sedan' },
    { label: 'SUV', value: 'suv' },
    { label: 'Hatchback', value: 'hatchback' },
    { label: 'Coupe', value: 'coupe' },
    { label: 'Convertible', value: 'convertible' },
    { label: 'Truck', value: 'truck' },
    { label: 'Van', value: 'van' },
  ]

  const fuelTypeOptions = [
    { label: 'Petrol', value: 'petrol' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Electric', value: 'electric' },
    { label: 'LPG', value: 'lpg' },
    { label: 'CNG', value: 'cng' },
  ]

  const validationSchema = Yup.object().shape({
    carName: Yup.string().required('Car name is required'),
    yearModel: Yup.string().required('Year model is required'),
    make: Yup.string().required('Make is required'),
    mileage: Yup.string().required('Mileage is required'),
    carType: Yup.string().required('Car type is required'),
    fuelType: Yup.string().required('Fuel type is required'),
    seats: Yup.string().required('Number of seats is required'),
    pricing: Yup.string().required('Pricing is required'),
  })

  const initialValues = {
    carName: '',
    yearModel: '',
    make: '',
    mileage: '',
    carType: '',
    fuelType: '',
    seats: '',
    pricing: ''
  }

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
  }

  const handleSubmit = (values: typeof initialValues) => {
    console.log('Upload car:', { ...values, images })
    // Handle form submission
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-NunitoBold text-gray-900">Upload cars</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Upload Image Section */}
        <ImageUploadSection
          images={images}
          onImagesChange={handleImagesChange}
          maxImages={3}
          layout="large-small"
          title="Upload image"
        />

        {/* Form Fields */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleSubmit: formikHandleSubmit, isValid, dirty, isSubmitting, setFieldValue }) => (
            <View className="space-y-6">
              {/* Name of car */}
              <FormikInput
                name="carName"
                label="Name of car"
                placeholder="Enter name of car"
                type="text"
              />

              {/* Year model */}
              <FormikInput
                name="yearModel"
                label="Year model"
                placeholder="Enter year model"
                type="text"
              />

              {/* Make */}
              <FormikInput
                name="make"
                label="Make"
                placeholder="Enter car make"
                type="text"
              />

              {/* Mileage */}
              <FormikInput
                name="mileage"
                label="Mileage"
                placeholder="Enter km/mileage"
                type="text"
              />

              {/* Car type */}
              <SelectField
                name="carType"
                label="Car type"
                placeholder="Select car type"
                options={carTypeOptions}
                value={values.carType}
                onValueChange={(value) => setFieldValue('carType', value)}
                error={errors.carType}
                touched={touched.carType}
              />

              {/* Fuel type */}
              <SelectField
                name="fuelType"
                label="Fuel type"
                placeholder="Select fuel type"
                options={fuelTypeOptions}
                value={values.fuelType}
                onValueChange={(value) => setFieldValue('fuelType', value)}
                error={errors.fuelType}
                touched={touched.fuelType}
              />

              {/* No of seats */}
              <FormikInput
                name="seats"
                label="No of seats"
                placeholder="Enter no of seats"
                type="text"
              />

              {/* Pricing */}
              <FormikInput
                name="pricing"
                label="Pricing"
                placeholder="Enter pricing"
                type="text"
              />

              {/* Upload Button */}
              <TouchableOpacity 
                onPress={() => formikHandleSubmit()}
                disabled={!isValid || !dirty || isSubmitting}
                className={`rounded-xl py-4 mb-8 ${!isValid || !dirty ? 'bg-gray-400' : 'bg-red-600'}`}
              >
                <Text className="text-white text-center text-lg font-NunitoBold">
                  {isSubmitting ? 'Uploading...' : 'Upload'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  )
}

export default UploadProducts