
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

const UploadCarToRent = () => {
  const [images, setImages] = useState<string[]>([])
  const { editMode, productId, productData } = useLocalSearchParams<{
    editMode?: string;
    productId?: string;
    productData?: string;
  }>();

  const isEditMode = editMode === 'true';
  const parsedProductData = productData ? JSON.parse(productData) : null;

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
    year: Yup.string().required('Year is required'),
    horsePower: Yup.string().required('Horse power is required'),
    modem: Yup.string().required('Modem is required'),
    carType: Yup.string().required('Car type is required'),
    fuelType: Yup.string().required('Fuel type is required'),
    seats: Yup.string().required('Number of seats is required'),
    rentCost: Yup.string().required('Rent cost is required'),
  })

  const initialValues = {
    carName: parsedProductData?.name || '',
    year: parsedProductData?.year || '',
    horsePower: parsedProductData?.horsePower || '',
    modem: parsedProductData?.modem || '',
    carType: parsedProductData?.carType || '',
    fuelType: parsedProductData?.fuelType || '',
    seats: parsedProductData?.seats || '',
    rentCost: parsedProductData?.price?.toString() || ''
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
    console.log('Upload car for rent:', { ...values, images })
    // Handle form submission
    
    // Navigate to success page with car rental-specific content
    router.push({
      pathname: sellerRoutes.successfulPage as any,
      params: {
        title: "Car Listed for Rent Successfully!",
        message: `Your ${values.carName} has been listed for rent successfully. Customers can now view and rent your car at ₦${values.rentCost} per day.`,
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
          {isEditMode ? 'Edit Rental Car' : 'Rent out Cars'}
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
              {/* Name of car */}
              <FormikInput
                name="carName"
                label="Name of Car"
                placeholder="Enter name of Car"
                type="text"
              />

              {/* Year */}
              <FormikInput
                name="year"
                label="Year"
                placeholder="Enter Year of Make"
                keyboardType="numeric"
                type="text"
              />

              {/* Horse power */}
              <FormikInput
                name="horsePower"
                label="Horse Power"
                placeholder="Enter Horse Power"
                keyboardType="numeric"
                type="text"
              />

              {/* Modem */}
              <FormikInput
                name="modem"
                label="Modem"
                placeholder="Enter Modem"
                type="text"
              />

              {/* Car type */}
              <SelectField
                name="carType"
                label="Car Type"
                placeholder="Select Car Type"
                options={carTypeOptions}
                value={values.carType}
                onValueChange={(value) => setFieldValue('carType', value)}
                error={errors.carType}
                touched={touched.carType}
              />

              {/* Fuel type */}
              <SelectField
                name="fuelType"
                label="Fuel Type"
                placeholder="Select Fuel Type"
                options={fuelTypeOptions}
                value={values.fuelType}
                onValueChange={(value) => setFieldValue('fuelType', value)}
                error={errors.fuelType}
                touched={touched.fuelType}
              />

              {/* No of seats */}
              <FormikInput
                name="seats"
                keyboardType="numeric"
                label="No of Seats"
                placeholder="Enter No of Seats"
                type="text"
              />

              {/* Rent cost */}
              <FormikInput
                name="rentCost"
                keyboardType="numeric"
                label="Rent Cost"
                placeholder="Enter Cost per Day"
                type="text"
              />

              {/* Upload Button */}
              <FormikButton
                title={isEditMode ? "Update Rental" : "List for Rent"}
                type="submit"
                onPress={formikHandleSubmit}
                disabled={!isValid || !dirty || isSubmitting}
                loading={isSubmitting}
                loadingText="Uploading"
                className="mb-8 mt-4"
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  )
}

export default UploadCarToRent  