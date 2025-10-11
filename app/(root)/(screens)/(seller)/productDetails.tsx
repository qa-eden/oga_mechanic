import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Linking, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, DocumentTextIcon, ChevronRightIcon, PhoneIcon } from 'react-native-heroicons/outline'
import { images, icons } from '@/constants'
import { router, useLocalSearchParams } from 'expo-router'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import { sellerRoutes } from '@/constants/routes'
import { productsAPI } from '@/lib/api/products'

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
  useEffect(() => {
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

    fetchProductDetails();
  }, [productId]);

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
    
    // Navigate to edit page based on product type with product data
    if (productData.is_rental) {
      router.push({
        pathname: '/uploadCarToRent' as any,
        params: {
          editMode: 'true',
          productId: productData.id,
          productData: JSON.stringify(productData)
        }
      });
    } else if (productData.category?.name?.toLowerCase().includes('car')) {
      router.push({
        pathname: sellerRoutes.uploadProducts,
        params: {
          editMode: 'true',
          isEditing: 'true',
          productId: productData.id,
          formData: JSON.stringify(productData)
        }
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    // In real app, call delete API here
    console.log('Deleting product:', productData?.id);
    
    // Navigate to success page
    setTimeout(() => {
      router.push({
        pathname: sellerRoutes.deleteSuccess as any,
        params: { itemType: productData?.category?.name?.toLowerCase().includes('car') ? 'car' : 'sparePart' }
      });
    }, 300);
  };

  const handleViewOrders = () => {
    // Navigate to orders page
    router.push('/(root)/(tabs)/(sellers)/orders' as any);
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

        {/* Loading Content */}
        <View className="flex-1 items-center justify-center">
          <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 font-NunitoMedium mt-4">Loading product details...</Text>
            <Text className="text-gray-400 text-sm mt-2">Please wait while we fetch the information</Text>
          </View>
        </View>
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
            {productData.category?.name?.toLowerCase().includes('spare') ? 'Spare part details' : 'Car details'}
          </Text>
        </View>
        <View className="w-6" />
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Name and Year */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="px-6 py-4"
        >
          <Text className="text-2xl font-NunitoBold text-gray-900 mb-1">
            {productData.name}
          </Text>
          {productData.year && (
            <Text className="text-lg text-gray-600">
              {productData.year}
            </Text>
          )}
        </Animated.View>

        {/* Hero Product Showcase */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}
          className="relative"
        >
          {/* Main Hero Image */}
          <View className="relative">
            <View 
              className="w-full bg-gray-100 overflow-hidden"
              style={{ height: screenWidth * 0.8 }}
            >
              {productData.images && productData.images.length > 0 && !imageErrors.has(selectedImageIndex) ? (
                <Image
                  source={{ uri: productData.images[selectedImageIndex].image }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                  onError={() => handleImageError(selectedImageIndex)}
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-50">
                  <icons.empty width={200} height={200} />
                  <Text className="text-sm text-gray-500 mt-2">No Image Available</Text>
                </View>
              )}
            </View>

            {/* Image Navigation Arrows */}
            {productData.images && productData.images.length > 1 && (
              <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex-row items-center space-x-4">
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  className="w-8 h-8 bg-white/80 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-700 text-lg">‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(Math.min(productData.images.length - 1, selectedImageIndex + 1))}
                  className="w-8 h-8 bg-white/80 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-700 text-lg">›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Dark Bottom Section - Seller Info & Features */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="bg-gray-900 rounded-t-3xl mt-8 flex-1"
        >
          <View className="p-6">
            {/* Seller Information */}
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mr-4">
                <Text className="text-white text-xl font-NunitoBold">
                  {productData.merchant?.first_name?.charAt(0).toUpperCase() || 'S'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-NunitoBold mb-1">
                  {productData.merchant?.first_name} {productData.merchant?.last_name}
                </Text>
                {productData.merchant?.phone_number && (
                  <View className="flex-row items-center">
                    <PhoneIcon size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm ml-2">
                      {productData.merchant.phone_number}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Overview and Pricing */}
            <View className="mb-6">
              <Text className="text-white text-lg font-NunitoBold mb-2">Overview</Text>
              <NairaCurrency
                value={parseFloat(productData.price)}
                className="text-2xl font-NunitoExtraBold text-white"
              />
              {productData.is_rental && (
                <Text className="text-gray-400 text-sm">/day</Text>
              )}
            </View>

            {/* Product Features Grid - Only show for cars */}
            {productData.category?.name?.toLowerCase().includes('car') && (
              <View className="mb-8">
                <View className="flex-row flex-wrap gap-4">
                  {productData.transmission && (
                    <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                      <Text className="text-gray-400 text-sm mb-1">Transmission</Text>
                      <Text className="text-white font-NunitoBold">{productData.transmission}</Text>
                    </View>
                  )}
                  {productData.fuel_type && (
                    <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                      <Text className="text-gray-400 text-sm mb-1">Fuel Type</Text>
                      <Text className="text-white font-NunitoBold">{productData.fuel_type}</Text>
                    </View>
                  )}
                  {productData.engine_size && (
                    <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                      <Text className="text-gray-400 text-sm mb-1">Engine Size</Text>
                      <Text className="text-white font-NunitoBold">{productData.engine_size}</Text>
                    </View>
                  )}
                  {productData.number_of_seats && (
                    <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                      <Text className="text-gray-400 text-sm mb-1">Seats</Text>
                      <Text className="text-white font-NunitoBold">{productData.number_of_seats} Seats</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Product Description */}
            {productData.description && (
              <View className="mb-8">
                <Text className="text-white text-lg font-NunitoBold mb-3">Description</Text>
                <Text className="text-gray-300 leading-6">
                  {productData.description}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 bg-red-500 rounded-xl py-4 items-center"
              >
                <Text className="text-white font-NunitoBold text-lg">Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleEdit}
                className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
              >
                <Text className="text-white font-NunitoBold text-lg">Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-20 pb-4" />
      </ScrollView>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            itemType={productData?.category?.name?.toLowerCase().includes('car') ? 'car' : 'sparePart'}
            itemName={productData?.name || ''}
          />
        </SafeAreaView>
      )
    }

    export default ProductDetails
