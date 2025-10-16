import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import EditSuccessDrawer from '@/components/modals/EditSuccessDrawer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { router, useLocalSearchParams } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import FormikInput from '@/components/forms/FormikInput'
import FormikTextArea from '@/components/forms/FormikTextArea'
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
import CustomButton from '@/components/CustomButton'

// Dedicated edit page for updating existing car products
// This page only handles editing - no creation logic
const EditProduct = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successDrawerVisible, setSuccessDrawerVisible] = useState(false)
  const [updatedProductData, setUpdatedProductData] = useState<any>(null)
  const featuresInitialized = useRef(false)

  const { productId, productData: productDataParam } = useLocalSearchParams<{
    productId?: string;
    productData?: string;
  }>();

  // Parse the product data passed from navigation
  const productData = productDataParam ? JSON.parse(productDataParam) : null;

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


  const validationSchema = Yup.object().shape({
    name: Yup.string(),
    make: Yup.string(),
    model: Yup.string(),
    year: Yup.string(),
    condition: Yup.string(),
    body_type: Yup.string(),
    mileage: Yup.string(),
    mileage_unit: Yup.string(),
    transmission: Yup.string(),
    fuel_type: Yup.string(),
    engine_size: Yup.string(),
    exterior_color: Yup.string(),
    interior_color: Yup.string(),
    number_of_doors: Yup.string(),
    number_of_seats: Yup.string(),
    description: Yup.string(),
    price: Yup.string(),
    currency: Yup.string(),
    stock: Yup.string(),
    availability: Yup.string(),
    delivery_option: Yup.string(),
  })

  // Initialize selected features based on product data
  useEffect(() => {
    if (productData && productData.id && !featuresInitialized.current) {
      const features: string[] = [];

      if (productData.air_conditioning) features.push('Air Conditioning');
      if (productData.leather_seats) features.push('Leather Seats');
      if (productData.navigation_system) features.push('Navigation System');
      if (productData.bluetooth) features.push('Bluetooth');
      if (productData.parking_sensors) features.push('Parking Sensors');
      if (productData.cruise_control) features.push('Cruise Control');
      if (productData.keyless_entry) features.push('Keyless Entry');
      if (productData.sunroof) features.push('Sunroof');
      if (productData.alloy_wheels) features.push('Alloy Wheels');
      if (productData.airbags) features.push('Airbags');
      if (productData.abs) features.push('ABS');
      if (productData.traction_control) features.push('Traction Control');
      if (productData.lane_assist) features.push('Lane Assist');
      if (productData.blind_spot_monitor) features.push('Blind Spot Monitor');

      setSelectedFeatures(features);
      featuresInitialized.current = true;
    }
  }, [productData?.id]); // Only depend on the product ID, not the entire productData object

  const handleContinueToImages = () => {
    router.push({
      pathname: sellerRoutes.editImage as any,
      params: {
        productId: productId,
        productData: JSON.stringify(updatedProductData),
      }
    });
  };

  const handleDone = () => {
    router.back();
  };

  const handleCloseDrawer = () => {
    setSuccessDrawerVisible(false);
    setUpdatedProductData(null);
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleSubmit = async (values: any) => {

    if (!productId || !productData) {
      return;
    }

    try {
      setIsSubmitting(true);

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
          mileage: parseInt(values.mileage),
          mileage_unit: values.mileage_unit,
          transmission: values.transmission,
          fuel_type: values.fuel_type,
          engine_size: values.engine_size,
          exterior_color: values.exterior_color,
          interior_color: values.interior_color,
          number_of_doors: parseInt(values.number_of_doors),
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
          is_rental: values.is_rental || false,
          airbags: features.airbags,
          abs: features.abs,
          traction_control: features.traction_control,
          lane_assist: features.lane_assist,
          blind_spot_monitor: features.blind_spot_monitor,
          delivery_option: values.delivery_option,
        },
        requestType: "inbound"
      }

      // Call the products API endpoint for update
      const endpoint = `${process.env.EXPO_PUBLIC_API_URL}/products/products/${productId}/`;
    

      const response = await fetch(endpoint, {
        method: 'PUT',
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

      // Store updated product data and show success drawer
      setUpdatedProductData(responseData.data || productData);
      setSuccessDrawerVisible(true);

    } catch (error) {
      Alert.alert('Error', 'Failed to update car details. Please try again.')
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show error state if no product data
  if (!productData || !productId) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-lg font-NunitoMedium text-gray-600 text-center mb-4">
            Car data not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoSemiBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initialValues = {
    name: productData.name || '',
    make: productData.make?.toString() || '',
    model: productData.model?.toString() || '',
    year: productData.year?.toString() || '',
    condition: productData.condition || 'new',
    body_type: productData.body_type || '',
    mileage: productData.mileage?.toString() || '',
    mileage_unit: productData.mileage_unit || 'km',
    transmission: productData.transmission || 'automatic',
    fuel_type: productData.fuel_type || '',
    engine_size: productData.engine_size || '',
    exterior_color: productData.exterior_color || '',
    interior_color: productData.interior_color || '',
    number_of_doors: productData.number_of_doors?.toString() || '',
    number_of_seats: productData.number_of_seats?.toString() || '',
    description: productData.description || '',
    price: productData.price?.toString() || '',
    currency: productData.currency || 'NGN',
    stock: productData.stock?.toString() || '',
    availability: productData.availability || 'in_stock',
    delivery_option: productData.delivery_option || 'pickup',
    negotiable: productData.negotiable || false,
    is_rental: productData.is_rental || false,
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
              Edit Car Details
            </Text>
            <Text className="text-xs text-gray-500 font-NunitoMedium">
              Update your Car Details
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
            paddingBottom: Platform.OS === 'ios' ? 60 : 40,
            flexGrow: 1
          }}
        >
          {/* Form Fields */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleSubmit: formikHandleSubmit, isValid, dirty, isSubmitting: formikIsSubmitting, setFieldValue }) => {
             
              return (
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
                          Update only the fields you want to change
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
                      placeholder={values.make ? "Select model" : "Select make first"}
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
                      placeholder="Select condition"
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
                          All fields optional - update what you need
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

                    {/* Mileage */}
                    <View className="mb-4">
                      <Text className="text-base font-NunitoSemiBold text-gray-700 mb-3">
                        Mileage
                      </Text>
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <FormikInput
                            name="mileage"
                            label=""
                            placeholder="e.g., 50,000"
                            keyboardType="numeric"
                            type="text"
                          />
                        </View>
                        <View className="w-32">
                          <Text className="text-sm font-NunitoMedium text-gray-600 mb-2">
                            Unit
                          </Text>
                          <View className="flex-row bg-gray-100 rounded-lg p-1">
                            <TouchableOpacity
                              onPress={() => setFieldValue('mileage_unit', 'km')}
                              className={`flex-1 py-2 px-3 rounded-md ${values.mileage_unit === 'km'
                                ? 'bg-white'
                                : 'bg-transparent'
                                }`}
                            >
                              <Text className={`text-xs font-NunitoSemiBold text-center ${values.mileage_unit === 'km'
                                ? 'text-gray-900'
                                : 'text-gray-500'
                                }`}>
                                km
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setFieldValue('mileage_unit', 'miles')}
                              className={`flex-1 py-2 px-3 rounded-md ${values.mileage_unit === 'miles'
                                ? 'bg-white'
                                : 'bg-transparent'
                                }`}
                            >
                              <Text className={`text-xs font-NunitoSemiBold text-center ${values.mileage_unit === 'miles'
                                ? 'text-gray-900'
                                : 'text-gray-500'
                                }`}>
                                miles
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>

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

                    {/* Engine size */}
                    <SelectField
                      name="engine_size"
                      label="Engine Size"
                      placeholder="Select engine size"
                      options={engineSizeOptions}
                      value={values.engine_size}
                      onValueChange={(value) => setFieldValue('engine_size', value)}
                      error={errors.engine_size as string}
                      touched={touched.engine_size as boolean}
                    />
                  </View>

                  {/* Appearance */}
                  <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                    <View className="flex-row items-center mb-4">
                      <View className="w-8 h-8 bg-purple-500 rounded-lg items-center justify-center mr-3">
                        <Text className="text-white font-NunitoBold text-sm">3</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-NunitoBold text-gray-900">Appearance</Text>
                        <Text className="text-xs text-gray-500 font-NunitoMedium">
                          Colors and styling (all optional)
                        </Text>
                      </View>
                    </View>

                    {/* Exterior color */}
                    <FormikInput
                      name="exterior_color"
                      label="Exterior Color"
                      placeholder="e.g., Black, White, Silver, Red"
                      type="text"
                    />

                    {/* Interior color */}
                    <FormikInput
                      name="interior_color"
                      label="Interior Color"
                      placeholder="e.g., Black, Beige, Brown, Gray"
                      type="text"
                    />

                    {/* Number of doors and seats */}
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <FormikInput
                          name="number_of_doors"
                          label="Number of Doors"
                          placeholder="e.g., 2, 4, 5"
                          keyboardType="numeric"
                          type="text"
                        />
                      </View>
                      <View className="flex-1">
                        <FormikInput
                          name="number_of_seats"
                          label="Number of Seats"
                          placeholder="e.g., 4, 5, 7"
                          keyboardType="numeric"
                          type="text"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Features */}
                  <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                    <View className="flex-row items-center mb-4">
                      <View className="w-8 h-8 bg-orange-500 rounded-lg items-center justify-center mr-3">
                        <Text className="text-white font-NunitoBold text-sm">4</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-NunitoBold text-gray-900">Features</Text>
                        <Text className="text-xs text-gray-500 font-NunitoMedium">
                          Select/deselect features (optional)
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
                        <Text className="text-white font-NunitoBold text-sm">5</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-NunitoBold text-gray-900">Description</Text>
                        <Text className="text-xs text-gray-500 font-NunitoMedium">
                          Update description (optional)
                        </Text>
                      </View>
                    </View>

                    <FormikTextArea
                      name="description"
                      label="Description"
                      placeholder="e.g., Well maintained car with regular service history. Perfect for daily commuting with excellent fuel economy."
                      numberOfLines={4}
                      maxLength={500}
                      helperText="Describe your car's condition, features, and what makes it special"
                    />
                  </View>

                  {/* Pricing & Availability */}
                  <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                    <View className="flex-row items-center mb-4">
                      <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-3">
                        <Text className="text-white font-NunitoBold text-sm">6</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-NunitoBold text-gray-900">Pricing & Availability</Text>
                        <Text className="text-xs text-gray-500 font-NunitoMedium">
                          Update price and availability (all optional)
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
                            placeholder="e.g., 2,500,000"
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

                  {/* Action Buttons */}
                  <View className="bg-white rounded-2xl p-5 mb-2 border border-gray-200">
                    <FormikButton
                      title="Update Car Details"
                      type="submit"
                      onPress={() => {
                        formikHandleSubmit();
                      }}
                      disabled={isSubmitting || formikIsSubmitting}
                      loading={isSubmitting || formikIsSubmitting}
                      loadingText="Updating..."
                      className="mb-3"
                    />

                    <CustomButton title='Edit Images' bgVariant='outline' textVariant='outline' onPress={() => {
                      router.push({
                        pathname: sellerRoutes.editImage as any,
                        params: {
                          productId: productId,
                          productData: JSON.stringify(productData),
                        }
                      });
                    }} />

                    <Text className="text-xs text-gray-500 text-center font-NunitoMedium mt-2">
                      All fields are optional - only update what you want to change
                    </Text>
                    <Text className="text-xs text-gray-500 text-center font-NunitoMedium">
                      Or manage images separately
                    </Text>
                  </View>
                </View>
              );
            }}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Drawer */}
      <EditSuccessDrawer
        visible={successDrawerVisible}
        onClose={handleCloseDrawer}
        onContinueToImages={handleContinueToImages}
        onDone={handleDone}
        carName={updatedProductData?.name}
      />
    </SafeAreaView>
  )
}

export default EditProduct
