import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { router, useLocalSearchParams } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormikInput from '@/components/forms/FormikInput'
import SelectField from '@/components/forms/SelectField'
import ImageUploadSection from '@/components/ImageUploadSection'
import FormikButton from '@/components/forms/FormikButton'
import { sellerRoutes } from '@/constants/routes'

const UploadSparePart = () => {
  const [images, setImages] = useState<string[]>([])
  const { editMode, productId, productData } = useLocalSearchParams<{
    editMode?: string;
    productId?: string;
    productData?: string;
  }>();

  const isEditMode = editMode === 'true';
  const parsedProductData = productData ? JSON.parse(productData) : null;

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
    sparePartName: parsedProductData?.name || '',
    carType: parsedProductData?.carType || '',
    sparePartType: parsedProductData?.sparePartType || '',
    year: parsedProductData?.year || '',
    pricing: parsedProductData?.price?.toString() || ''
  }

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
  }

  // Set images when in edit mode
  useEffect(() => {
    if (isEditMode && parsedProductData?.images) {
      const imageUris = parsedProductData.images.map((img: any) => {
        if (typeof img.image === 'string') {
          return img.image;
        } else if (img.image && typeof img.image === 'object') {
          // Handle function components or other object types
          return img.image.toString();
        } else if (img.image) {
          return img.image.toString();
        }
        return '';
      }).filter(uri => uri); // Filter out empty strings
      setImages(imageUris);
    }
  }, [isEditMode, parsedProductData]);

  const handleSubmit = (values: typeof initialValues) => {
    console.log('Upload spare part:', { ...values, images })
    // Handle form submission
    
    // Navigate to success page with spare part-specific content
    router.push({
      pathname: sellerRoutes.successfulPage as any,
      params: {
        title: "Spare Part Uploaded Successfully!",
        message: `Your ${values.sparePartName && values.sparePartName?.toUpperCase()} has been Uploaded Successfully and is now Available in your Spare Parts Catalog. Customers can now View and Purchase this Spare Part.`,
        route: sellerRoutes.products
      }
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-NunitoBold text-gray-900">
          {isEditMode ? 'Edit Spare Part' : 'Upload Spare Parts'}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Upload Image Section */}
        <ImageUploadSection
          images={images}
          onImagesChange={handleImagesChange}
          maxImages={3}
          layout="large-small"
          title="Upload Image"
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
                label="Name of Spare Part"
                placeholder="Enter name of Spare Part"
                type="text"
              />

              {/* Car type */}
              <FormikInput
                name="carType"
                label="Car Type"
                placeholder="Enter Car Type"
                type="text"
              />

              {/* Spare part type */}
              <SelectField
                name="sparePartType"
                label="Spare Part Type"
                placeholder="Select Spare Part Type"
                options={sparePartTypeOptions}
                value={values.sparePartType}
                onValueChange={(value) => setFieldValue('sparePartType', value)}
                error={errors.sparePartType}
                touched={touched.sparePartType}
              />

              {/* Year */}
              <FormikInput
                name="year"
                keyboardType="numeric"
                label="Year"
                placeholder="Enter Year of Make"
                type="text"
              />

              {/* Pricing */}
              <FormikInput
                name="pricing"
                label="Pricing"
                keyboardType="numeric"
                placeholder="Enter Pricing"
                type="text"
              />

              {/* Upload Button */}
              {/* <TouchableOpacity 
                onPress={() => formikHandleSubmit()}
                disabled={!isValid || !dirty || isSubmitting}
                className={`rounded-xl py-4 mb-8 ${!isValid || !dirty ? 'bg-gray-400' : 'bg-red-600'}`}
              >
                <Text className="text-white text-center text-lg font-NunitoBold">
                  {isSubmitting ? 'Uploading...' : 'Upload'}
                </Text>
              </TouchableOpacity> */}
              <FormikButton
                title={isEditMode ? "Update Spare Part" : "Upload"}
                type="submit"
                onPress={formikHandleSubmit}
                disabled={!isValid || !dirty || isSubmitting}
                loading={isSubmitting}
                loadingText="Uploading"
                className="mb-8  mt-4"
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  )
}

export default UploadSparePart