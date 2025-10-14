
import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { router, useLocalSearchParams } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormikInput from '@/components/forms/FormikInput'
import SelectField from '@/components/forms/SelectField'
import FormikButton from '@/components/forms/FormikButton'
import FeatureBadges from '@/components/forms/FeatureBadges'
import { sellerRoutes } from '@/constants/routes'
import { useCategories } from '@/hooks/useProducts'
import { useVehicleMakes } from '@/hooks/useVehicleMakes'
import {
  deliveryOptions,
  engineSizeOptions,
  bodyTypeOptions,
  fuelTypeOptions,
  conditionOptions,
  transmissionOptions,
  availabilityOptions,
  featureOptions
} from '@/constants/data'

const UploadCarToRent = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  // Get navigation parameters for edit mode
  const { editMode, productId, productData, formData, isEditing } = useLocalSearchParams<{
    editMode?: string;
    productId?: string;
    productData?: string;
    formData?: string;
    isEditing?: string;
  }>();

  const isEditMode = editMode === 'true';
  const isEditingMode = isEditing === 'true';
  const parsedProductData = productData ? JSON.parse(productData) : null;
  const parsedFormData = formData ? JSON.parse(formData) : null;

  // Fetch categories to get car category ID
  const { data: categories } = useCategories();
  const carCategory = categories?.find(cat => cat.name.toLowerCase().includes('car'));
  const carCategoryId = carCategory?.id || 0;

  // Fetch vehicle makes from API
  const { data: vehicleMakes, loading: vehicleMakesLoading, error: vehicleMakesError } = useVehicleMakes();

  // Convert vehicle makes to select options
  const makeOptions = vehicleMakes?.map(make => ({
    label: make.name,
    value: make.id.toString()
  })) || [];

  // Get models for selected make
  const getModelsForSelectedMake = (makeId: string) => {
    if (!makeId || !vehicleMakes) return [];
    const selectedMake = vehicleMakes.find(make => make.id.toString() === makeId);
    return selectedMake?.models || [];
  };

  // Initialize selected features for edit mode
  useEffect(() => {
    if (isEditMode && parsedProductData) {
      const features: string[] = [];

      if (parsedProductData.air_conditioning) features.push('Air Conditioning');
      if (parsedProductData.leather_seats) features.push('Leather Seats');
      if (parsedProductData.navigation_system) features.push('Navigation System');
      if (parsedProductData.bluetooth) features.push('Bluetooth');
      if (parsedProductData.parking_sensors) features.push('Parking Sensors');
      if (parsedProductData.cruise_control) features.push('Cruise Control');
      if (parsedProductData.keyless_entry) features.push('Keyless Entry');
      if (parsedProductData.sunroof) features.push('Sunroof');
      if (parsedProductData.alloy_wheels) features.push('Alloy Wheels');
      if (parsedProductData.airbags) features.push('Airbags');
      if (parsedProductData.abs) features.push('ABS');
      if (parsedProductData.traction_control) features.push('Traction Control');
      if (parsedProductData.lane_assist) features.push('Lane Assist');
      if (parsedProductData.blind_spot_monitor) features.push('Blind Spot Monitor');

      setSelectedFeatures(features);
    }
  }, [isEditMode, parsedProductData]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Car name is required'),
    make: Yup.number().required('Make is required'),
    model: Yup.number().required('Model is required'),
    year: Yup.number().required('Year is required').min(1900).max(new Date().getFullYear() + 1),
    condition: Yup.string().required('Condition is required'),
    body_type: Yup.string().required('Body type is required'),
    transmission: Yup.string().required('Transmission is required'),
    fuel_type: Yup.string().required('Fuel type is required'),
    exterior_color: Yup.string().required('Exterior color is required'),
    number_of_seats: Yup.number().required('Number of seats is required').min(1).max(20),
    description: Yup.string().optional(),
    price: Yup.string().required('Daily rent price is required'),
    currency: Yup.string().required('Currency is required'),
    stock: Yup.number().required('Stock is required').min(0),
    availability: Yup.string().required('Availability is required'),
    delivery_option: Yup.string().required('Delivery option is required'),
  })

  const initialValues = {
    name: isEditMode && parsedProductData ? parsedProductData.name || '' : '',
    make: isEditMode && parsedProductData ? parsedProductData.make?.toString() || '' : '',
    model: isEditMode && parsedProductData ? parsedProductData.model?.toString() || '' : '',
    year: isEditMode && parsedProductData ? parsedProductData.year?.toString() || '' : '',
    condition: isEditMode && parsedProductData ? parsedProductData.condition || 'new' : 'new',
    body_type: isEditMode && parsedProductData ? parsedProductData.body_type || '' : '',
    transmission: isEditMode && parsedProductData ? parsedProductData.transmission || 'automatic' : 'automatic',
    fuel_type: isEditMode && parsedProductData ? parsedProductData.fuel_type || '' : '',
    exterior_color: isEditMode && parsedProductData ? parsedProductData.exterior_color || '' : '',
    number_of_seats: isEditMode && parsedProductData ? parsedProductData.number_of_seats?.toString() || '' : '',
    description: isEditMode && parsedProductData ? parsedProductData.description || '' : '',
    price: isEditMode && parsedProductData ? parsedProductData.price || '' : '',
    currency: isEditMode && parsedProductData ? parsedProductData.currency || 'NGN' : 'NGN',
    stock: isEditMode && parsedProductData ? parsedProductData.stock?.toString() || '' : '',
    availability: isEditMode && parsedProductData ? parsedProductData.availability || 'in_stock' : 'in_stock',
    delivery_option: isEditMode && parsedProductData ? parsedProductData.delivery_option || 'pickup' : 'pickup',
    negotiable: isEditMode && parsedProductData ? parsedProductData.negotiable || false : false,
    is_rental: true, // Always true for rental cars
  }

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const isEditing = isEditMode || isEditingMode;

      // Create feature object from selected features
      const features = {
        air_conditioning: selectedFeatures.includes('Air Conditioning'),
        leather_seats: selectedFeatures.includes('Leather Seats'),
        navigation_system: selectedFeatures.includes('Navigation System'),
        bluetooth: selectedFeatures.includes('Bluetooth'),
        parking_sensors: selectedFeatures.includes('Parking Sensors'),
        cruise_control: selectedFeatures.includes('Cruise Control'),
        keyless_entry: selectedFeatures.includes('Keyless Entry'),
        sunroof: selectedFeatures.includes('Sunroof'),
        alloy_wheels: selectedFeatures.includes('Alloy Wheels'),
        airbags: selectedFeatures.includes('Airbags'),
        abs: selectedFeatures.includes('ABS'),
        traction_control: selectedFeatures.includes('Traction Control'),
        lane_assist: selectedFeatures.includes('Lane Assist'),
        blind_spot_monitor: selectedFeatures.includes('Blind Spot Monitor'),
      }

      const payload = {
        data: {
          category_id: carCategoryId,
          name: values.name,
          make: parseInt(values.make),
          model: parseInt(values.model),
          year: parseInt(values.year),
          condition: values.condition,
          body_type: values.body_type,
          transmission: values.transmission,
          fuel_type: values.fuel_type,
          exterior_color: values.exterior_color,
          number_of_seats: parseInt(values.number_of_seats),
          air_conditioning: features.air_conditioning,
          leather_seats: features.leather_seats,
          navigation_system: features.navigation_system,
          bluetooth: features.bluetooth,
          parking_sensors: features.parking_sensors,
          cruise_control: features.cruise_control,
          keyless_entry: features.keyless_entry,
          sunroof: features.sunroof,
          alloy_wheels: features.alloy_wheels,
          description: values.description,
          price: values.price,
          currency: values.currency,
          negotiable: values.negotiable || false,
          discount: "0",
          availability: values.availability,
          stock: parseInt(values.stock),
          is_rental: true, // Always true for rental cars
          airbags: features.airbags,
          abs: features.abs,
          traction_control: features.traction_control,
          lane_assist: features.lane_assist,
          blind_spot_monitor: features.blind_spot_monitor,
          delivery_option: values.delivery_option,
        },
        requestType: "inbound"
      }

      // Determine endpoint and method based on edit mode
      const finalProductId = productId || parsedProductData?.id;
      const endpoint = isEditing
        ? `${process.env.EXPO_PUBLIC_API_URL}/products/products/${finalProductId}/`
        : `${process.env.EXPO_PUBLIC_API_URL}/products/products/`;
      const method = isEditing ? 'PUT' : 'POST';

      // Call the products API endpoint
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`,
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const responseData = await response.json()

      // Get the product ID from response
      const updatedProductId = responseData.data?.id || finalProductId || '';

      if (isEditing) {
        // For editing, show success alert with options
        Alert.alert('Success', 'Rental car details updated successfully!', [
          {
            text: 'Continue to Edit Images',
            onPress: () => router.push({
              pathname: sellerRoutes.editImage as any,
              params: {
                productId: updatedProductId,
                productData: JSON.stringify(responseData.data || parsedProductData),
              }
            })
          },
          { text: 'Done', onPress: () => router.back() }
        ]);
      } else {
        // For creation, navigate to image upload page
    router.push({
          pathname: sellerRoutes.uploadCarImages as any,
      params: {
            formData: JSON.stringify(payload),
            productId: updatedProductId,
            productType: 'car'
          }
        })
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} rental car. Please try again.`)
    }
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
              {isEditMode ? 'Edit Rental Car' : 'Rental Car Details'}
            </Text>
            <Text className="text-xs text-gray-500 font-NunitoMedium">
              {isEditMode ? 'Update your Rental Car Information' : 'Enter your Rental Car Information'}
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
                        Tell us about your Rental Car
                      </Text>
                    </View>
                  </View>

              {/* Name of car */}
              <FormikInput
                    name="name"
                label="Name of Car"
                    placeholder="e.g., Toyota Camry LE"
                type="text"
              />

                  {/* Make */}
                  <SelectField
                    name="make"
                    label="Make"
                    placeholder={vehicleMakesLoading ? "Loading makes..." : "Select make"}
                    options={makeOptions}
                    value={values.make}
                    onValueChange={(value) => {
                      setFieldValue('make', value);
                      // Clear model when make changes
                      setFieldValue('model', '');
                    }}
                    error={errors.make as string}
                    touched={touched.make as boolean}
                  />

                  {/* Model */}
                  <SelectField
                    name="model"
                    label="Model"
                    placeholder={values.make ? "Select model" : "Select Make first"}
                    options={getModelsForSelectedMake(values.make).map(model => ({
                      label: model.name,
                      value: model.id.toString()
                    }))}
                    value={values.model}
                    onValueChange={(value) => setFieldValue('model', value)}
                    error={errors.model as string}
                    touched={touched.model as boolean}
              />

              {/* Year */}
              <FormikInput
                name="year"
                label="Year"
                    placeholder="e.g., 2023"
                keyboardType="numeric"
                type="text"
              />

                  {/* Condition */}
                  <SelectField
                    name="condition"
                    label="Condition"
                    placeholder="Select Condition"
                    options={conditionOptions}
                    value={values.condition}
                    onValueChange={(value) => setFieldValue('condition', value)}
                    error={errors.condition as string}
                    touched={touched.condition as boolean}
                  />
                </View>

                {/* Vehicle Details */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">2</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Vehicle Details</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Essential specifications
                      </Text>
                    </View>
                  </View>

                  {/* Body type */}
                  <SelectField
                    name="body_type"
                    label="Body Type"
                    placeholder="Select body type"
                    options={bodyTypeOptions}
                    value={values.body_type}
                    onValueChange={(value) => setFieldValue('body_type', value)}
                    error={errors.body_type as string}
                    touched={touched.body_type as boolean}
                  />

                  {/* Transmission */}
              <SelectField
                    name="transmission"
                    label="Transmission"
                    placeholder="Select transmission"
                    options={transmissionOptions}
                    value={values.transmission}
                    onValueChange={(value) => setFieldValue('transmission', value)}
                    error={errors.transmission as string}
                    touched={touched.transmission as boolean}
              />

              {/* Fuel type */}
              <SelectField
                    name="fuel_type"
                label="Fuel Type"
                    placeholder="Select fuel type"
                options={fuelTypeOptions}
                    value={values.fuel_type}
                    onValueChange={(value) => setFieldValue('fuel_type', value)}
                    error={errors.fuel_type as string}
                    touched={touched.fuel_type as boolean}
                  />

                  {/* Exterior color */}
              <FormikInput
                    name="exterior_color"
                    label="Exterior Color"
                    placeholder="e.g., Black, White, Silver, Red"
                type="text"
              />

                  {/* Number of seats */}
                  <FormikInput
                    name="number_of_seats"
                    label="Number of Seats"
                    placeholder="e.g., 4, 5, 7"
                    keyboardType="numeric"
                    type="text"
                  />
                </View>

                {/* Features */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-orange-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">3</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Features</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Car Amenities and Safety
                      </Text>
                    </View>
                  </View>

                  <FeatureBadges
                    features={featureOptions}
                    selectedFeatures={selectedFeatures}
                    onFeatureToggle={handleFeatureToggle}
                    label="Car Features"
                  />
                </View>

                {/* Description */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-indigo-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">4</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Description</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Tell customers about your rental car
                      </Text>
                    </View>
                  </View>

                  <FormikInput
                    name="description"
                    label="Description"
                    placeholder="e.g., Well maintained car perfect for daily commuting. Excellent fuel economy and comfortable for long trips."
                    type="text"
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>

                {/* Pricing & Availability */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">5</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Pricing & Availability</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Set your daily rental price
                      </Text>
                    </View>
                  </View>

                  {/* Price and Currency */}
                  <View className="mb-4">
                    <Text className="text-base font-NunitoSemiBold text-gray-700 mb-3">
                      Daily Rental Price
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
                    label="Available Units"
                    placeholder="e.g., 1, 2, 5"
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

                {/* Continue Button */}
                <View className="bg-white rounded-2xl p-5 mb-2 border border-gray-200">
              <FormikButton
                    title={isEditMode ? "Update Rental Car" : "Continue to Images"}
                type="submit"
                onPress={formikHandleSubmit}
                disabled={!isValid || !dirty || isSubmitting}
                loading={isSubmitting}
                    loadingText="Processing..."
                    className="mb-3"
                  />
                  <Text className="text-xs text-gray-500 text-center font-NunitoMedium">
                    {isEditMode
                      ? "Your rental car details will be updated"
                      : "Next: Upload car images to complete your rental listing"
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

export default UploadCarToRent  