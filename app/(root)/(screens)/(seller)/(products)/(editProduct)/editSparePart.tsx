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
// import CustomButton from '@/components/CustomButton'

const PRIMARY = '#D30309';

const SectionCard = ({ children, title, subtitle, icon, accentColor }: any) => (
  <View
    className="bg-white rounded-[16px] p-5 mb-5 border border-gray-100"
    style={{ borderTopWidth: 3, borderTopColor: accentColor, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
  >
    <View className="flex-row items-center mb-5 gap-3">
      <View style={{ backgroundColor: `${accentColor}1A` }} className="w-10 h-10 rounded-xl items-center justify-center">
        <Text className="text-[20px]">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text style={{ color: '#111827' }} className="text-[15px] font-NunitoBold mb-0.5">{title}</Text>
        <Text className="text-[12px] text-gray-500 font-NunitoMedium">{subtitle}</Text>
      </View>
    </View>
    <View className="gap-4">
      {children}
    </View>
  </View>
);

const EditSparePart = () => {
  const [vehicleCompatibility, setVehicleCompatibility] = useState<VehicleCompatibility[]>([])
  const [showOtherCategory, setShowOtherCategory] = useState(false)

  const { productId, productData } = useLocalSearchParams<{
    productId?: string;
    productData?: string;
  }>();

  const parsedProductData = productData ? JSON.parse(productData) : null;

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

  // Initialize vehicle compatibility from parsed data
  useEffect(() => {
    if (!parsedProductData?.vehicle_compatibility) return;

    const vehicleCompat = parsedProductData.vehicle_compatibility;

    if (Array.isArray(vehicleCompat)) {
      const mapped = vehicleCompat.map((vc: any) => ({
        make: vc.make,
        models: vc.model || vc.models || []
      }));
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

      // Show success alert
      Alert.alert('Success', `${productName} updated successfully!`, [
        {
          text: 'Continue to Edit Images',
          onPress: () => router.push({
            pathname: sellerRoutes.editImage as any,
            params: {
              productId: productId,
              productData: JSON.stringify(responseData.data || parsedProductData),
              productType: 'spare-part',
            }
          })
        },
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    }
  }

  // Helper functions
  const addVehicleCompatibility = () => {
    setVehicleCompatibility([...vehicleCompatibility, { make: 0, models: [] }]);
  };

  const removeVehicleCompatibility = (index: number) => {
    setVehicleCompatibility(vehicleCompatibility.filter((_: any, i: number) => i !== index));
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
            onPress={() => router.push(sellerRoutes?.products)}
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


          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleSubmit: formikHandleSubmit, isValid, isSubmitting, setFieldValue }) => {


              return (
                <View className="space-y-6">


                  {/* Basic Information */}
                  <SectionCard accentColor={PRIMARY} icon="📋" title="Basic Information" subtitle="Update Product Details">

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
                  </SectionCard>

                  {/* Vehicle Compatibility */}
                  <SectionCard accentColor={PRIMARY} icon="🚗" title="Compatible Vehicles" subtitle="Select Makes and Models">
                    <View className="flex-row items-center justify-end mb-4">
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
                  </SectionCard>

                  {/* Description */}
                  <SectionCard accentColor={PRIMARY} icon="📝" title="Description" subtitle="Provide Details About the Product">

                    <FormikTextArea
                      name="description"
                      label="Description"
                      placeholder="e.g., High-quality brake pads compatible with multiple Toyota and Honda models."
                      numberOfLines={4}
                      maxLength={500}
                      helperText="Describe the spare part's features, compatibility, and condition"
                    />
                  </SectionCard>

                  {/* Pricing & Availability */}
                  <SectionCard accentColor={PRIMARY} icon="💰" title="Pricing & Availability" subtitle="Set your Price and Stock">
                    {/* Price */}
                    <FormikInput
                      name="price"
                      label="Price (₦)"
                      placeholder="e.g., 25000.00"
                      keyboardType="numeric"
                      type="text"
                    />

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
                  </SectionCard>

                  {/* Submit Button */}
                  <View className="bg-white rounded-[16px] p-5 mb-2 border border-gray-100 shadow-sm">
                    <FormikButton
                      title="Update Product Details"
                      type="submit"
                      onPress={formikHandleSubmit}
                      disabled={!isValid || isSubmitting}
                      loading={isSubmitting}
                      loadingText="Updating"
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