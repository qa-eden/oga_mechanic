import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { router } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormikInput from '@/components/forms/FormikInput'
import SelectField from '@/components/forms/SelectField'
import ImageUploadSection from '@/components/ImageUploadSection'

const UploadSparePart = () => {
  const [images, setImages] = useState<string[]>([])

  const sparePartTypeOptions = [
    { label: 'Engine Parts', value: 'engine' },
    { label: 'Brake System', value: 'brake' },
    { label: 'Suspension', value: 'suspension' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'Body Parts', value: 'body' },
    { label: 'Interior', value: 'interior' },
    { label: 'Exhaust System', value: 'exhaust' },
    { label: 'Transmission', value: 'transmission' },
    { label: 'Cooling System', value: 'cooling' },
    { label: 'Fuel System', value: 'fuel' },
  ]

  const validationSchema = Yup.object().shape({
    sparePartName: Yup.string().required('Spare part name is required'),
    carType: Yup.string().required('Car type is required'),
    sparePartType: Yup.string().required('Spare part type is required'),
    year: Yup.string().required('Year is required'),
    pricing: Yup.string().required('Pricing is required'),
  })

  const initialValues = {
    sparePartName: '',
    carType: '',
    sparePartType: '',
    year: '',
    pricing: ''
  }

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
  }

  const handleSubmit = (values: typeof initialValues) => {
    console.log('Upload spare part:', { ...values, images })
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
        <Text className="text-lg font-NunitoBold text-gray-900">Upload spare parts</Text>
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
              {/* Name of spare part */}
              <FormikInput
                name="sparePartName"
                label="Name of spare part"
                placeholder="Enter name of spare part"
                type="text"
              />

              {/* Car type */}
              <FormikInput
                name="carType"
                label="Car type"
                placeholder="Enter car type"
                type="text"
              />

              {/* Spare part type */}
              <SelectField
                name="sparePartType"
                label="Spare part type"
                placeholder="Select spare part type"
                options={sparePartTypeOptions}
                value={values.sparePartType}
                onValueChange={(value) => setFieldValue('sparePartType', value)}
                error={errors.sparePartType}
                touched={touched.sparePartType}
              />

              {/* Year */}
              <FormikInput
                name="year"
                label="Year"
                placeholder="Enter year of make"
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

export default UploadSparePart