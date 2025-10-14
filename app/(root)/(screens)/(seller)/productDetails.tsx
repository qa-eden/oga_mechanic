import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Linking, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, DocumentTextIcon, ChevronRightIcon, PhoneIcon } from 'react-native-heroicons/outline'
import { images, icons } from '@/constants'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import { sellerRoutes } from '@/constants/routes'
import { productsAPI } from '@/lib/api/products'
import CustomButton from '@/components/CustomButton'

const { width: screenWidth } = Dimensions.get("window");

const ProductDetails = () => {
  const { productType, productId } = useLocalSearchParams<{
    productType: 'sparePart' | 'car' | 'rentedCar';
    productId: string;
  }>();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Fetch product details from API
  const fetchProductDetails = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getProductById(productId);
      setProductData(response.data);
      console.log('Fetched product details:', response.data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  // Refetch function to reload data after successful operations
  const refetchProductDetails = async () => {
    console.log('🔄 Refetching product details after successful operation...');
    await fetchProductDetails();
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refetch data when screen comes into focus (e.g., returning from edit screens)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 ProductDetails screen focused - checking for updates...');
      // Only refetch if this is NOT the initial load
      if (!isInitialLoad) {
        console.log('🔄 Refetching data after returning from edit...');
        refetchProductDetails();
      } else {
        console.log('⏭️ Skipping refetch on initial load');
        setIsInitialLoad(false);
      }
    }, [isInitialLoad])
  );

  // Animation effects - only start when data is loaded
  useEffect(() => {
    if (productData && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [productData, loading]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} className="text-yellow-400 text-lg">★</Text>)
    }

    if (hasHalfStar) {
      stars.push(<Text key="half" className="text-yellow-400 text-lg">★</Text>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Text key={`empty-${i}`} className="text-gray-300 text-lg">★</Text>)
    }

    return stars
  }

  const handleEdit = () => {
    if (!productData) return;

      // Navigate to rental car edit page
      router.push({
        pathname: sellerRoutes?.editCarToRent,
        params: {
          editMode: 'true',
          isEditing: 'true',
          productId: productData.id,
          productData: JSON.stringify(productData)
        }
      });
  
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);

    if (!productData?.id) return;

    try {
      setLoading(true);
      console.log('🗑️ Deleting product:', productData.id);

      // Call delete API
      await productsAPI.deleteProduct(productData.id);
      console.log('✅ Product deleted successfully');

      // Determine item type for success page
      let itemType = 'sparePart';
      if (productData?.is_rental) {
        itemType = 'rentedCar';
      } else if (productData?.category?.name?.toLowerCase().includes('car')) {
        itemType = 'car';
      }

      // Navigate to success page after successful deletion
      setTimeout(() => {
        router.push({
          pathname: sellerRoutes.deleteSuccess as any,
          params: { itemType }
        });
      }, 300);

    } catch (error) {
      console.error('❌ Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
      // Optionally show an alert or toast
    } finally {
      setLoading(false);
    }
  };

  const handleCallSeller = () => {
    if (productData?.merchant?.phone_number) {
      Linking.openURL(`tel:${productData.merchant.phone_number}`);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row items-center justify-between bg-white px-6 py-5 shadow-sm">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-NunitoBold text-gray-900">Product Details</Text>
          </View>
          <View className="w-6" />
        </View>

        <LoadingSpinner
          message="Loading Product Details..."
          subMessage="Please wait while we fetch the product information"
          size="medium"
          logoSize={32}
        />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row items-center justify-between bg-white px-6 py-5 shadow-sm">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-NunitoBold text-gray-900">Product Details</Text>
          </View>
          <View className="w-6" />
        </View>

        {/* Error Content */}
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-red-50 rounded-3xl p-8 items-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Text className="text-red-500 text-2xl">⚠️</Text>
            </View>
            <Text className="text-red-700 font-NunitoBold text-lg mb-2">Error Loading Product</Text>
            <Text className="text-red-600 text-center mb-4">{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setLoading(true);
                // Retry fetch
                const fetchProductDetails = async () => {
                  if (!productId) return;

                  try {
                    const response = await productsAPI.getProductById(productId);
                    setProductData(response.data);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch product details');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchProductDetails();
              }}
              className="bg-red-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-NunitoMedium">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show content if no product data
  if (!productData) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row items-center justify-between bg-white px-6 py-5 shadow-sm">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeftIcon size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-NunitoBold text-gray-900">Product Details</Text>
          </View>
          <View className="w-6" />
        </View>

        {/* No Data Content */}
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-50 rounded-3xl p-8 items-center">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-6">
              <icons.empty width={40} height={40} />
            </View>
            <Text className="text-gray-700 font-NunitoBold text-lg mb-2">Product Not Found</Text>
            <Text className="text-gray-500 text-center mb-6">
              The product you're looking for doesn't exist or has been removed.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-primary-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-NunitoMedium">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="flex-row items-center justify-between bg-white px-6 py-5 shadow-sm"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-NunitoBold text-gray-900">
            {productData.is_rental ? 'Rental Car Details' :
              productData.category?.name?.toLowerCase().includes('spare') ? 'Spare Part Details' : 'Car Details'}
          </Text>
        </View>
        <View className="w-6" />
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Product Image */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}
          className="relative"
        >
          <View className="relative">
            <View
              className="w-full bg-black overflow-hidden"
              style={{ height: screenWidth * 0.8 }}
            >
              {productData.images && productData.images.length > 0 && !imageErrors.has(selectedImageIndex) ? (
                <Image
                  source={{ uri: productData.images[selectedImageIndex].image }}
                  className="w-full h-full"
                  style={{
                    resizeMode: 'contain',
                    backgroundColor: '#000000'
                  }}
                  onError={() => handleImageError(selectedImageIndex)}
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-50">
                  <icons.empty width={120} height={120} />
                  <Text className="text-sm text-gray-500 mt-3 font-NunitoMedium">No Image Available</Text>
                </View>
              )}
            </View>

            {/* Image Navigation Dots */}
            {productData.images && productData.images.length > 1 && (
              <View className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex-row items-center space-x-2">
                {productData.images.map((_: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${index === selectedImageIndex ? 'bg-primary-500' : 'bg-primary-500/50'
                      }`}
                  />
                ))}
              </View>
            )}

            {/* Image Navigation Arrows */}
            {productData.images && productData.images.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg"
                  style={{ opacity: selectedImageIndex > 0 ? 1 : 0.5 }}
                >
                  <Text className="text-gray-800 text-xl font-bold">‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(Math.min(productData.images.length - 1, selectedImageIndex + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg"
                  style={{ opacity: selectedImageIndex < productData.images.length - 1 ? 1 : 0.5 }}
                >
                  <Text className="text-gray-800 text-xl font-bold">›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>

        {/* Product Information Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="bg-white mx-4 -mt-6 rounded-2xl shadow-lg border border-gray-100"
        >
          {/* Product Header */}
          <View className="p-6 border-b border-gray-100">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-2xl font-NunitoBold text-gray-900 mb-2">
                  {productData.name}
                </Text>
                <View className="flex-row items-center flex-wrap gap-2 mb-3">
                  {productData.year && (
                    <View className="bg-gray-100 px-3 py-1 rounded-full">
                      <Text className="text-gray-700 font-NunitoMedium text-sm">{productData.year}</Text>
                    </View>
                  )}
                  {productData.condition && (
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="text-blue-700 font-NunitoMedium text-sm capitalize">{productData.condition}</Text>
                    </View>
                  )}
                  {productData.body_type && (
                    <View className="bg-purple-100 px-3 py-1 rounded-full">
                      <Text className="text-purple-700 font-NunitoMedium text-sm capitalize">{productData.body_type}</Text>
                    </View>
                  )}
                </View>

              </View>
            </View>

            {/* Pricing */}
            <View className="bg-gradient-to-r from-primary-50 to-primary-100 px-2 rounded-xl">
              <Text className="text-primary-600 font-NunitoMedium text-md mb-1">
                {productData.is_rental ? 'Rental Price' : 'Price'}
              </Text>
              <View className="flex-row items-baseline">
                <Text className="text-primary-900 text-3xl font-NunitoExtraBold">
                  {productData.currency === 'NGN' ? '₦' : '$'}{parseFloat(productData.price).toLocaleString()}
                </Text>
                {productData.is_rental && (
                  <Text className="text-primary-600 text-lg font-NunitoMedium ml-1">/day</Text>
                )}
              </View>
              {productData.is_rental && productData.stock && (
                <View className="bg-green-100 px-4 mt-2 py-2 rounded-full self-start">
                  <Text className="text-green-800 font-NunitoBold text-sm">
                    {productData.stock} {productData.stock === 1 ? 'car' : 'cars'} available
                  </Text>
                </View>
              )}
              {productData.negotiable && (
                <View className="mt-2 bg-yellow-100 px-3 py-1 rounded-full self-start">
                  <Text className="text-yellow-700 text-sm font-NunitoBold">Negotiable</Text>
                </View>
              )}
            </View>
          </View>
          {/* Car Specifications */}
          {productData.category?.name?.toLowerCase().includes('car') && (
            <View className="p-6 border-b border-gray-100">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-4">Specifications</Text>
              <View className="flex-row flex-wrap gap-3">
                {productData.transmission && (
                  <View className="bg-gray-50 rounded-xl p-4 flex-1 min-w-[45%] border border-gray-100">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-1 uppercase tracking-wide">Transmission</Text>
                    <Text className="text-gray-900 font-NunitoBold capitalize">{productData.transmission}</Text>
                  </View>
                )}
                {productData.fuel_type && (
                  <View className="bg-gray-50 rounded-xl p-4 flex-1 min-w-[45%] border border-gray-100">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-1 uppercase tracking-wide">Fuel Type</Text>
                    <Text className="text-gray-900 font-NunitoBold capitalize">{productData.fuel_type}</Text>
                  </View>
                )}
                {productData.engine_size && (
                  <View className="bg-gray-50 rounded-xl p-4 flex-1 min-w-[45%] border border-gray-100">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-1 uppercase tracking-wide">Engine Size</Text>
                    <Text className="text-gray-900 font-NunitoBold">{productData.engine_size}</Text>
                  </View>
                )}
                {productData.number_of_seats && (
                  <View className="bg-gray-50 rounded-xl p-4 flex-1 min-w-[45%] border border-gray-100">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-1 uppercase tracking-wide">Seats</Text>
                    <Text className="text-gray-900 font-NunitoBold">{productData.number_of_seats} Seats</Text>
                  </View>
                )}
                {productData.exterior_color && (
                  <View className="bg-gray-50 rounded-xl p-4 flex-1 min-w-[45%] border border-gray-100">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-1 uppercase tracking-wide">Color</Text>
                    <Text className="text-gray-900 font-NunitoBold">{productData.exterior_color}</Text>
                  </View>
                )}
                {productData.availability && (
                  <View className="bg-gray-50 rounded-xl p-4 flex-1 min-w-[45%] border border-gray-100">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-1 uppercase tracking-wide">Availability</Text>
                    <Text className="text-gray-900 font-NunitoBold capitalize">{productData.availability.replace('_', ' ')}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Car Features */}
          {productData.category?.name?.toLowerCase().includes('car') && (
            <View className="p-6 border-b border-gray-100">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-4">Features</Text>
              <View className="flex-row flex-wrap gap-2">
                {productData.air_conditioning && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Air Conditioning</Text>
                  </View>
                )}
                {productData.leather_seats && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Leather Seats</Text>
                  </View>
                )}
                {productData.navigation_system && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Navigation</Text>
                  </View>
                )}
                {productData.bluetooth && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Bluetooth</Text>
                  </View>
                )}
                {productData.parking_sensors && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Parking Sensors</Text>
                  </View>
                )}
                {productData.cruise_control && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Cruise Control</Text>
                  </View>
                )}
                {productData.keyless_entry && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Keyless Entry</Text>
                  </View>
                )}
                {productData.sunroof && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Sunroof</Text>
                  </View>
                )}
                {productData.alloy_wheels && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Text className="text-green-700 text-sm font-NunitoMedium">Alloy Wheels</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Safety Features */}
          {productData.category?.name?.toLowerCase().includes('car') && (
            <View className="p-6 border-b border-gray-100">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-4">Safety Features</Text>
              <View className="flex-row flex-wrap gap-2">
                {productData.airbags && (
                  <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Text className="text-blue-700 text-sm font-NunitoMedium">Airbags</Text>
                  </View>
                )}
                {productData.abs && (
                  <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Text className="text-blue-700 text-sm font-NunitoMedium">ABS</Text>
                  </View>
                )}
                {productData.traction_control && (
                  <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Text className="text-blue-700 text-sm font-NunitoMedium">Traction Control</Text>
                  </View>
                )}
                {productData.lane_assist && (
                  <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Text className="text-blue-700 text-sm font-NunitoMedium">Lane Assist</Text>
                  </View>
                )}
                {productData.blind_spot_monitor && (
                  <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <Text className="text-blue-700 text-sm font-NunitoMedium">Blind Spot Monitor</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Product Description */}
          {productData.description && (
            <View className="p-6 border-b border-gray-100">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-3">Description</Text>
              <Text className="text-gray-600 leading-6 font-NunitoRegular">
                {productData.description}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="p-6">
            <View className="space-y-3">

              <CustomButton
                title="Edit Images" 
                bgVariant='outline'
                textVariant='outline'
                className='mb-2'
                onPress={() => {
                  router.push({
                    pathname: sellerRoutes.editImage as any,
                    params: {
                      productId: productData.id,
                      productData: JSON.stringify(productData),
                    }
                  });
                }}
              />

              {/* Edit and Delete Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-1 bg-red-500 rounded-xl py-4 items-center shadow-sm"
                >
                  <Text className="text-white font-NunitoBold text-lg">Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleEdit}
                  className="flex-1 bg-primary-500 rounded-xl py-4 items-center shadow-sm"
                >
                  <Text className="text-white font-NunitoBold text-lg">Edit Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemType={
          productData?.is_rental ? 'rentedCar' :
            productData?.category?.name?.toLowerCase().includes('car') ? 'car' : 'sparePart'
        }
        itemName={productData?.name || ''}
      />
    </SafeAreaView>
  )
}

export default ProductDetails
