import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { router, useLocalSearchParams } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormikInput from '@/components/forms/FormikInput'
import SelectField from '@/components/forms/SelectField'
import FormikButton from '@/components/forms/FormikButton'
import { sellerRoutes } from '@/constants/routes'
import { availabilityOptions, deliveryOptions } from '@/constants/data'

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

  const conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' },
    { label: 'Refurbished', value: 'refurbished' },
  ]

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Spare part name is required'),
    brand: Yup.string().required('Brand is required'),
    part_type: Yup.string().required('Part type is required'),
    compatible_vehicles: Yup.string(), // Optional field
    condition: Yup.string().required('Condition is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.string().required('Price is required'),
    currency: Yup.string().required('Currency is required'),
    stock: Yup.number().required('Stock is required').min(0),
    availability: Yup.string().required('Availability is required'),
    delivery_option: Yup.string().required('Delivery option is required'),
  })

  const initialValues = {
    name: parsedProductData?.name || '',
    brand: parsedProductData?.brand || '',
    part_type: parsedProductData?.part_type || '',
    compatible_vehicles: parsedProductData?.compatible_vehicles || '',
    condition: parsedProductData?.condition || 'new',
    description: parsedProductData?.description || '',
    price: parsedProductData?.price?.toString() || '',
    currency: parsedProductData?.currency || 'NGN',
    stock: parsedProductData?.stock?.toString() || '',
    availability: parsedProductData?.availability || 'in_stock',
    delivery_option: parsedProductData?.delivery_option || 'pickup',
  }

  const handleSubmit = (values: typeof initialValues) => {
    console.log('Upload spare part:', { ...values })
    // TODO: Implement API call here to create/update spare part
    
    // Navigate to success page with spare part-specific content
    router.push({
      pathname: sellerRoutes.successfulPage as any,
      params: {
        title: "Spare Part Uploaded Successfully!",
        message: `Your ${values.name?.toUpperCase()} has been uploaded successfully and is now available in your spare parts catalog. Customers can now view and purchase this spare part.`,
        route: sellerRoutes.products
      }
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-xl bg-gray-100"
          >
            <ArrowLeftIcon size={20} color="#374151" />
        </TouchableOpacity>
          <View className="items-center">
            <Text className="text-xl font-NunitoBold text-gray-900">
              {isEditMode ? 'Edit Spare Part' : 'Spare Part Details'}
            </Text>
            <Text className="text-xs text-gray-500 font-NunitoMedium">
              {isEditMode ? 'Update spare part information' : 'Enter spare part information'}
        </Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 100 : 50,
            flexGrow: 1
          }}
        >
        {/* Form Fields */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleSubmit: formikHandleSubmit, isValid, dirty, isSubmitting, setFieldValue }) => (
            <View className="space-y-6">
                {/* Basic Information */}
                <View className="bg-white rounded-2xl p-5 my-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">1</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Basic Information</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Tell us about the spare part
                      </Text>
                    </View>
                  </View>
                  
              {/* Name of spare part */}
              <FormikInput
                    name="name"
                    label="Part Name"
                    placeholder="e.g., Brake Pads, Oil Filter, Spark Plugs"
                type="text"
              />

                  {/* Brand */}
              <FormikInput
                    name="brand"
                    label="Brand / Manufacturer"
                    placeholder="e.g., Bosch, NGK, Brembo"
                type="text"
              />

              {/* Spare part type */}
              <SelectField
                    name="part_type"
                    label="Part Type"
                    placeholder="Select part type"
                options={sparePartTypeOptions}
                    value={values.part_type}
                    onValueChange={(value) => setFieldValue('part_type', value)}
                    error={errors.part_type as string}
                    touched={touched.part_type as boolean}
                  />

                  {/* Compatible Vehicles */}
                  <FormikInput
                    name="compatible_vehicles"
                    label="Compatible Vehicles (Optional)"
                    placeholder="e.g., Toyota Camry 2015-2020, Honda Accord 2016-2021, or leave blank if universal"
                    type="text"
                    multiline={true}
                    numberOfLines={2}
                  />

                  {/* Condition */}
                  <SelectField
                    name="condition"
                    label="Condition"
                    placeholder="Select condition"
                    options={conditionOptions}
                    value={values.condition}
                    onValueChange={(value) => setFieldValue('condition', value)}
                    error={errors.condition as string}
                    touched={touched.condition as boolean}
                  />
                </View>

                {/* Description */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-purple-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">2</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Description</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Provide details about the spare part
                      </Text>
                    </View>
                  </View>
                  
                  <FormikInput
                    name="description"
                    label="Description"
                    placeholder="e.g., High-quality OEM replacement part. Includes all necessary hardware for installation."
                    type="text"
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>

                {/* Pricing & Availability */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">3</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Pricing & Availability</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Set your price and stock
                      </Text>
                    </View>
                  </View>
                  
                  {/* Price and Currency */}
                  <View className="mb-4">
                    <Text className="text-base font-NunitoSemiBold text-gray-700 mb-3">
                      Price
                    </Text>
                    <View className="flex-row gap-3">
                      <View className="flex-1">
              <FormikInput
                          name="price"
                          label=""
                          placeholder="e.g., 25,000"
                keyboardType="numeric"
                type="text"
              />
                      </View>
                      <View className="w-32">
                        <Text className="text-sm font-NunitoMedium text-gray-600 mb-2">
                          Currency
                        </Text>
                        <View className="flex-row bg-gray-100 rounded-lg p-1">
                          <TouchableOpacity
                            onPress={() => setFieldValue('currency', 'NGN')}
                            className={`flex-1 py-2 px-3 rounded-md ${values.currency === 'NGN'
                              ? 'bg-white' 
                              : 'bg-transparent'
                            }`}
                          >
                            <Text className={`text-xs font-NunitoSemiBold text-center ${values.currency === 'NGN'
                              ? 'text-gray-900' 
                              : 'text-gray-500'
                            }`}>
                              ₦
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setFieldValue('currency', 'USD')}
                            className={`flex-1 py-2 px-3 rounded-md ${values.currency === 'USD'
                              ? 'bg-white' 
                              : 'bg-transparent'
                            }`}
                          >
                            <Text className={`text-xs font-NunitoSemiBold text-center ${values.currency === 'USD'
                              ? 'text-gray-900' 
                              : 'text-gray-500'
                            }`}>
                              $
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Stock */}
              <FormikInput
                    name="stock"
                    label="Stock Quantity"
                    placeholder="e.g., 10, 20, 50"
                keyboardType="numeric"
                type="text"
              />

                  {/* Availability */}
                  <SelectField
                    name="availability"
                    label="Availability"
                    placeholder="Select availability"
                    options={availabilityOptions}
                    value={values.availability}
                    onValueChange={(value) => setFieldValue('availability', value)}
                    error={errors.availability as string}
                    touched={touched.availability as boolean}
                  />

                  {/* Delivery option */}
                  <SelectField
                    name="delivery_option"
                    label="Delivery Option"
                    placeholder="Select delivery option"
                    options={deliveryOptions}
                    value={values.delivery_option}
                    onValueChange={(value) => setFieldValue('delivery_option', value)}
                    error={errors.delivery_option as string}
                    touched={touched.delivery_option as boolean}
                  />
                </View>

                {/* Submit Button */}
                <View className="bg-white rounded-2xl p-5 mb-2 border border-gray-200">
              <FormikButton
                    title={isEditMode ? "Update Spare Part" : "Upload Spare Part"}
                type="submit"
                onPress={formikHandleSubmit}
                disabled={!isValid || !dirty || isSubmitting}
                loading={isSubmitting}
                    loadingText="Processing..."
                    className="mb-3"
                  />
                  <Text className="text-xs text-gray-500 text-center font-NunitoMedium">
                    {isEditMode 
                      ? "Your spare part details will be updated" 
                      : "Your spare part will be available for purchase"
                    }
                  </Text>
                </View>
            </View>
          )}
        </Formik>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default UploadSparePart