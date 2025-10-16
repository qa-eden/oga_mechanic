import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native'
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
import MultiSelectBottomSheet from '@/components/forms/MultiSelectBottomSheet'
import FormikButton from '@/components/forms/FormikButton'
import { sellerRoutes } from '@/constants/routes'
import { availabilityOptions, deliveryOptions, conditionOptions } from '@/constants/data'
import { useVehicleMakes } from '@/hooks/useVehicleMakes'
import { useCategories } from '@/hooks/useProducts'

interface VehicleCompatibility {
  make: number;
  models: number[];
}

const EditSparePart = () => {
  const [vehicleCompatibility, setVehicleCompatibility] = useState<VehicleCompatibility[]>([])
  const [showOtherCategory, setShowOtherCategory] = useState(false)
 
  const { productId, productData } = useLocalSearchParams<{
    productId?: string;
    productData?: string;
  }>();

  const parsedProductData = productData ? JSON.parse(productData) : null;

  // Debug logging
  useEffect(() => {
    console.log('🔧 EditSparePart - Product ID:', productId);
    console.log('🔧 EditSparePart - Parsed Data:', parsedProductData);
    console.log('🔧 EditSparePart - Category ID:', parsedProductData?.category_id || parsedProductData?.category?.id);
    console.log('🔧 EditSparePart - Vehicle Compatibility:', parsedProductData?.vehicle_compatibility);
  }, [productId, parsedProductData]);

  // Fetch categories from API
  const { data: categories, isLoading: categoriesLoading } = useCategories();
 
  // Fetch vehicle makes and models
  const { data: vehicleMakes, loading: makesLoading } = useVehicleMakes();

  // Get spare parts category ID (used when "Other" is selected)
  const sparePartsCategory = categories?.find(cat => cat.name.toLowerCase().includes('spare'));
  const sparePartsCategoryId = sparePartsCategory?.id || 2;

  // Convert categories to options, excluding "Car"
  const categoryOptionsFiltered = categories?.filter(cat =>
    !cat.name.toLowerCase().includes('car')
  ).map(category => ({
    label: category.name,
    value: category.id.toString()
  })) || [];

  // Add "Other" option
  const categoryOptions = [
    ...categoryOptionsFiltered,
    { label: 'Other (Custom)', value: 'other' }
  ];

  const validationSchema = Yup.object().shape({
    category: Yup.string().required('Category is required'),
    custom_category_name: Yup.string().when('category', {
      is: 'other',
      then: (schema) => schema.required('Please specify the category name'),
      otherwise: (schema) => schema.notRequired(),
    }),
    condition: Yup.string().required('Condition is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.string().required('Price is required'),
    currency: Yup.string().required('Currency is required'),
    stock: Yup.number().required('Stock is required').min(0),
    availability: Yup.string().required('Availability is required'),
    delivery_option: Yup.string().required('Delivery option is required'),
  })

  // Determine if category is "other" and get initial values
  const getCategoryValue = () => {
    if (!parsedProductData) return '';
 
    const categoryId = parsedProductData.category_id || parsedProductData.category?.id;
    if (!categoryId) return '';
 
    const categoryExists = categories?.some(cat =>
      cat.id === categoryId && !cat.name.toLowerCase().includes('car')
    );
 
    return categoryExists ? categoryId.toString() : 'other';
  };

  const getCustomCategoryName = () => {
    if (!parsedProductData) return '';
 
    const categoryId = parsedProductData.category_id || parsedProductData.category?.id;
    const categoryExists = categories?.some(cat =>
      cat.id === categoryId && !cat.name.toLowerCase().includes('car')
    );
 
    return !categoryExists ? parsedProductData.name || '' : '';
  };

  const initialValues = {
    category: getCategoryValue(),
    custom_category_name: getCustomCategoryName(),
    condition: parsedProductData?.condition || 'new',
    description: parsedProductData?.description || '',
    price: parsedProductData?.price?.toString() || '',
    currency: parsedProductData?.currency || 'NGN',
    stock: parsedProductData?.stock?.toString() || '',
    availability: parsedProductData?.availability || 'in_stock',
    delivery_option: parsedProductData?.delivery_option || 'nationwide',
  }

  // Debug initial values
  useEffect(() => {
    console.log('📝 EditSparePart - Initial Values:', initialValues);
    console.log('📝 EditSparePart - Category Value:', getCategoryValue());
    console.log('📝 EditSparePart - Custom Name:', getCustomCategoryName());
  }, [categories, parsedProductData]);

  // Initialize vehicle compatibility from parsed data
  useEffect(() => {
    if (!parsedProductData?.vehicle_compatibility) return;
    
    const vehicleCompat = parsedProductData.vehicle_compatibility;
    console.log('🚗 EditSparePart - Vehicle Compat from API:', vehicleCompat);
    
    if (Array.isArray(vehicleCompat)) {
      const mapped = vehicleCompat.map((vc: any) => ({
        make: vc.make,
        models: vc.model || vc.models || []
      }));
      console.log('🚗 EditSparePart - Mapped Vehicle Compat:', mapped);
      setVehicleCompatibility(mapped);
    }
  }, [parsedProductData?.vehicle_compatibility])

  // Check if initial category is "other" and show custom input
  useEffect(() => {
    if (!parsedProductData || !categories) return;
 
    const categoryId = parsedProductData.category_id || parsedProductData.category?.id;
    if (!categoryId) return;
 
    const isOtherCategory = !categories.some(cat =>
      cat.id === categoryId && !cat.name.toLowerCase().includes('car')
    );
 
    setShowOtherCategory(isOtherCategory);
  }, [categories, parsedProductData])

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      // Determine category_id and name based on selection
      let categoryId: number;
      let productName: string;

      if (values.category === 'other') {
        categoryId = sparePartsCategoryId;
        productName = values.custom_category_name;
      } else {
        categoryId = parseInt(values.category);
        const selectedCategory = categories?.find(cat => cat.id.toString() === values.category);
        productName = selectedCategory?.name || '';
      }

      // Format payload
      const payload = {
        data: {
          category_id: categoryId,
          name: productName,
          description: values.description,
          price: parseFloat(values.price),
          currency: values.currency,
          stock: parseInt(values.stock),
          availability: values.availability,
          condition: values.condition,
          delivery_option: values.delivery_option,
          vehicle_compatibility: vehicleCompatibility.map(vc => ({
            make: vc.make,
            model: vc.models
          }))
        },
        requestType: "inbound"
      };

      console.log('📤 Edit Product Payload:', JSON.stringify(payload, null, 2));

      const endpoint = `${process.env.EXPO_PUBLIC_API_URL}/products/products/${productId}/`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`,
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const responseData = await response.json();
      console.log('Product updated successfully:', responseData);

      // Show success alert
      Alert.alert('Success', `${productName} updated successfully!`, [
        {
          text: 'Continue to Edit Images',
          onPress: () => router.push({
            pathname: sellerRoutes.editImage as any,
            params: {
              productId: productId,
              productData: JSON.stringify(responseData.data || parsedProductData),
            }
          })
        },
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    }
  }

  // Helper functions
  const addVehicleCompatibility = () => {
    setVehicleCompatibility([...vehicleCompatibility, { make: 0, models: [] }]);
  };

  const removeVehicleCompatibility = (index: number) => {
    setVehicleCompatibility(vehicleCompatibility.filter((_, i) => i !== index));
  };

  const updateVehicleMake = (index: number, makeId: number) => {
    const updated = [...vehicleCompatibility];
    updated[index] = { make: makeId, models: [] };
    setVehicleCompatibility(updated);
  };

  const updateVehicleModels = (index: number, modelIds: (string | number)[]) => {
    const updated = [...vehicleCompatibility];
    updated[index].models = modelIds.map(id => typeof id === 'string' ? parseInt(id) : id);
    setVehicleCompatibility(updated);
  };

  const getSelectedMake = (index: number) => {
    const makeId = vehicleCompatibility[index]?.make;
    return vehicleMakes.find(make => make.id === makeId);
  };

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
              Edit Product
            </Text>
            <Text className="text-xs text-gray-500 font-NunitoMedium">
              Update Product Information
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
            paddingBottom: Platform.OS === 'ios' ? 50 : 40,
            flexGrow: 1
          }}
        >
          {/* Debug Info */}
          <View className="bg-yellow-50 rounded-xl p-4 my-4 border border-yellow-200">
            <Text className="text-xs font-NunitoBold text-gray-900 mb-2">Debug Info:</Text>
            <Text className="text-xs text-gray-700">Product ID: {productId || 'N/A'}</Text>
            <Text className="text-xs text-gray-700">Product Name: {parsedProductData?.name || 'N/A'}</Text>
            <Text className="text-xs text-gray-700">Category ID: {parsedProductData?.category_id || parsedProductData?.category?.id || 'N/A'}</Text>
            <Text className="text-xs text-gray-700">Category Name: {parsedProductData?.category?.name || 'N/A'}</Text>
            <Text className="text-xs text-gray-700">Vehicle Compat: {vehicleCompatibility.length} items</Text>
            <Text className="text-xs text-gray-700">Price: {parsedProductData?.price || 'N/A'}</Text>
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleSubmit: formikHandleSubmit, isValid, isSubmitting, setFieldValue }) => {
              // Debug current form values
              console.log('📋 EditSparePart - Current Form Values:', values);
              
              return (
              <View className="space-y-6">
                {/* Form Values Debug */}
                <View className="bg-blue-50 rounded-xl p-3 my-2 border border-blue-200">
                  <Text className="text-xs font-NunitoBold text-gray-900 mb-1">Current Form Values:</Text>
                  <Text className="text-xs text-gray-700">Category: {values.category || 'Empty'}</Text>
                  <Text className="text-xs text-gray-700">Custom Name: {values.custom_category_name || 'Empty'}</Text>
                  <Text className="text-xs text-gray-700">Price: {values.price || 'Empty'}</Text>
                  <Text className="text-xs text-gray-700">Stock: {values.stock || 'Empty'}</Text>
                </View>

                {/* Basic Information */}
                <View className="bg-white rounded-2xl p-5 my-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">1</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Basic Information</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Update Product Details
                      </Text>
                    </View>
                  </View>
 
                  {/* Category */}
                  <SelectField
                    name="category"
                    label="Category"
                    placeholder={categoriesLoading ? "Loading..." : "Select category"}
                    options={categoryOptions}
                    value={values.category}
                    onValueChange={(value) => {
                      setFieldValue('category', value);
                      setShowOtherCategory(value === 'other');
                      if (value !== 'other') {
                        setFieldValue('custom_category_name', '');
                      }
                    }}
                    error={errors.category as string}
                    touched={touched.category as boolean}
                  />

                  {/* Custom Category Name */}
                  {showOtherCategory && (
                    <FormikInput
                      name="custom_category_name"
                      label="Specify Category Name"
                      placeholder="e.g., Custom Exhaust System, Special Engine Component"
                      type="text"
                    />
                  )}

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

                {/* Vehicle Compatibility */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View className="w-8 h-8 bg-primary-500 rounded-lg items-center justify-center mr-3">
                        <Text className="text-white font-NunitoBold text-sm">2</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-NunitoBold text-gray-900">Compatible Vehicles</Text>
                        <Text className="text-xs text-gray-500 font-NunitoMedium">
                          Select Makes and Models
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={addVehicleCompatibility}
                      disabled={makesLoading}
                      className="bg-primary-500 px-4 py-2 rounded-[.4rem]"
                      style={{ opacity: makesLoading ? 0.5 : 1 }}
                    >
                      <Text className="text-white text-sm font-NunitoBold">+ Add</Text>
                    </TouchableOpacity>
                  </View>

                  {makesLoading ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator size="large" color="#D30309" />
                      <Text className="text-sm text-gray-500 mt-2">Loading...</Text>
                    </View>
                  ) : vehicleCompatibility.length === 0 ? (
                    <View className="py-6 items-center bg-gray-50 rounded-xl">
                      <Text className="text-sm text-gray-600 mb-2">No Vehicles Added</Text>
                      <Text className="text-xs text-gray-400 text-center px-4">
                        Tap "Add" to select Compatible Vehicles
                      </Text>
                    </View>
                  ) : (
                    <View className="space-y-3">
                      {vehicleCompatibility.map((vc, index) => {
                        const selectedMake = getSelectedMake(index);

                        return (
                          <View key={index} className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
                            <View className="mb-3">
                              <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm font-NunitoMedium text-gray-700">Make</Text>
                                <TouchableOpacity onPress={() => removeVehicleCompatibility(index)}>
                                  <Text className="text-red-500 text-sm font-NunitoMedium">Remove</Text>
                                </TouchableOpacity>
                              </View>

                              <SelectField
                                name={`vehicle_make_${index}`}
                                label=""
                                placeholder="Select make"
                                options={vehicleMakes.map(make => ({
                                  label: make.name,
                                  value: make.id.toString()
                                }))}
                                value={vc.make.toString()}
                                onValueChange={(value) => updateVehicleMake(index, parseInt(value))}
                                error=""
                                touched={false}
                              />
                            </View>

                            {selectedMake && selectedMake.models && selectedMake.models.length > 0 && (
                              <MultiSelectBottomSheet
                                label={`Select Models for ${selectedMake.name}`}
                                placeholder="Select models..."
                                options={selectedMake.models.map(model => ({
                                  label: model.name,
                                  value: model.id
                                }))}
                                selectedValues={vc.models || []}
                                onValuesChange={(values) => updateVehicleModels(index, values)}
                              />
                            )}
                          </View>
                        );
                      })}

                      <TouchableOpacity
                        onPress={addVehicleCompatibility}
                        className="border border-dashed border-gray-500 rounded-xl p-3 bg-white"
                      >
                        <Text className="text-md text-primary-500 font-NunitoMedium text-center">
                          + Add Another Make
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-purple-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">3</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Description</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Provide Details About the Product
                      </Text>
                    </View>
                  </View>

                  <FormikTextArea
                    name="description"
                    label="Description"
                    placeholder="e.g., High-quality brake pads compatible with multiple Toyota and Honda models."
                    numberOfLines={4}
                    maxLength={500}
                    helperText="Describe the spare part's features, compatibility, and condition"
                  />
                </View>

                {/* Pricing & Availability */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white font-NunitoBold text-sm">4</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-NunitoBold text-gray-900">Pricing & Availability</Text>
                      <Text className="text-xs text-gray-500 font-NunitoMedium">
                        Set your Price and Stock
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
                          placeholder="e.g., 25000.00"
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
                            className={`flex-1 py-2 px-3 rounded-md ${values.currency === 'NGN' ? 'bg-white' : 'bg-transparent'}`}
                          >
                            <Text className={`text-xs font-NunitoSemiBold text-center ${values.currency === 'NGN' ? 'text-gray-900' : 'text-gray-500'}`}>
                              ₦
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setFieldValue('currency', 'USD')}
                            className={`flex-1 py-2 px-3 rounded-md ${values.currency === 'USD' ? 'bg-white' : 'bg-transparent'}`}
                          >
                            <Text className={`text-xs font-NunitoSemiBold text-center ${values.currency === 'USD' ? 'text-gray-900' : 'text-gray-500'}`}>
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
                    placeholder="e.g., 100"
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
                    title="Update Product Details"
                    type="submit"
                    onPress={formikHandleSubmit}
                    disabled={!isValid || isSubmitting}
                    loading={isSubmitting}
                    loadingText="Updating..."
                    className="mb-3"
                  />
                  <Text className="text-xs text-gray-500 text-center font-NunitoMedium">
                    Your Product Details will be Updated
                  </Text>
                </View>
    </View>
              );
            }}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default EditSparePart