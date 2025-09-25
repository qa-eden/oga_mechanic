import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Animated } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, DocumentTextIcon, ChevronRightIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'
import { router, useLocalSearchParams } from 'expo-router'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import { sellerRoutes } from '@/constants/routes'

const { width: screenWidth } = Dimensions.get("window");

const ProductDetailsDetailed = () => {
  const { productType, productId } = useLocalSearchParams<{
    productType: 'sparePart' | 'car';
    productId: string;
  }>();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Sample product data - in real app, this would come from API based on productId
  const productData = {
    id: productId || "1",
    name: productType === 'car' ? "Escalade (2024)" : "Toyota Corolla 2015 Back Tyre (Pair)",
    year: productType === 'car' ? "2024" : "2015",
    price: productType === 'car' ? 105000000 : 7000,
    rating: 5.0,
    reviewCount: 30,
    stock: 12,
    images: [
      { id: 1, image: productType === 'car' ? images.car1 : images.sparePart },
      { id: 2, image: productType === 'car' ? images.benz : images.carEngine },
      { id: 3, image: productType === 'car' ? images.car1 : images.sparePart }
    ],
    description: productType === 'car' 
      ? "Luxury Escalade 2024 in excellent condition. Perfect for family trips or business use. Features include leather seats, premium sound system, and advanced safety features."
      : "I'm a certified auto mechanic with over 10 years of hands-on experience fixing cars of all kinds — from compact rides to heavy-duty SUVs. I specialize in engine repair, brake systems, and vehicle diagnostics.",
    sellerRating: 5.0,
    sellerReviewCount: 30,
    shippingSpeed: "Excellent",
    estimatedDelivery: "2-3 days",
    shippingFeeWithin: 700,
    shippingFeeOutside: 7000,
    totalOrders: 2,
    type: productType || 'sparePart',
    merchant: {
      first_name: "John",
      last_name: "Mechanic",
      email: "john@mechanic.com",
      phone_number: "08056432765"
    },
    category: {
      name: productType === 'car' ? "Cars" : "Spare Parts"
    },
    condition: "New",
    warranty: "1 Year",
    created_at: "2024-01-15",
    is_rental: false,
    purchased_count: 15,
    views: 245,
    likes: 12,
    status: "Active"
  };

  // Animation effects
  useEffect(() => {
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
  }, []);

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
    // Navigate to edit page based on product type with product data
    if (productData.type === 'sparePart') {
      router.push({
        pathname: '/upload-sparePart' as any,
        params: {
          editMode: 'true',
          productId: productData.id,
          productData: JSON.stringify(productData)
        }
      });
    } else if (productData.type === 'car') {
      router.push({
        pathname: '/uploadProducts' as any,
        params: {
          editMode: 'true',
          productId: productData.id,
          productData: JSON.stringify(productData)
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
    console.log('Deleting product:', productData.id);
    
    // Navigate to success page
    setTimeout(() => {
      router.push({
        pathname: sellerRoutes.deleteSuccess as any,
        params: { itemType: productData.type }
      });
    }, 300);
  };

  const handleViewOrders = () => {
    // Navigate to orders page
    router.push('/(root)/(tabs)/(sellers)/orders' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
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
            {productData.type === 'sparePart' ? 'Spare part details' : 'Car details'}
          </Text>
        </View>
        <View className="w-6" />
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                typeof productData.images[selectedImageIndex].image === 'function' ? (
                  <View className="w-full h-full items-center justify-center bg-gray-50">
                    {React.createElement(productData.images[selectedImageIndex].image, { width: 250, height: 250 })}
                  </View>
                ) : (
                  <Image
                    source={{ uri: productData.images[selectedImageIndex].image }}
                    className="w-full h-full"
                    style={{ resizeMode: 'cover' }}
                    onError={() => handleImageError(selectedImageIndex)}
                  />
                )
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-50">
                  <images.ProductImg width={200} height={200} />
                  {imageErrors.has(selectedImageIndex) && (
                    <Text className="text-sm text-gray-500 mt-2">Image failed to load</Text>
                  )}
                </View>
              )}
            </View>

            {/* Image Navigation Dots */}
            {productData.images && productData.images.length > 1 && (
              <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex-row space-x-2">
                {productData.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === selectedImageIndex ? 'bg-primary-500' : 'bg-white/50'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Thumbnail Images */}
          {productData.images && productData.images.length > 1 && (
            <View className="flex-row justify-center mt-3 space-x-2 px-4">
              {productData.images.map((imageItem, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden ${
                    selectedImageIndex === index ? 'border-2 border-primary-500' : 'border border-gray-300'
                  }`}
                >
                  {typeof imageItem.image === 'function' ? (
                    <View className="w-full h-full items-center justify-center bg-gray-100">
                      {React.createElement(imageItem.image, { width: 30, height: 30 })}
                    </View>
                  ) : (
                    <Image 
                      source={{ uri: imageItem.image }} 
                      className="w-full h-full"
                      style={{ resizeMode: 'cover' }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Spacing after main image */}
          <View className="h-4" />
        </Animated.View>

        {/* Premium Product Information */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: -8 }, 
            shadowOpacity: 0.15, 
            shadowRadius: 24, 
            elevation: 16 
          }}
          className="bg-white mx-4 rounded-2xl relative z-10 shadow-2xl mb-4"
        >
          <View className="p-6">
            {/* Product Title */}
            <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-2 leading-8">
              {productData.name}
            </Text>

            {/* Price and Stock Status */}
            <View className="flex-row items-center justify-between my-4">
              <NairaCurrency
                value={productData.price}
                className="text-3xl font-NunitoExtraBold text-primary-500"
              />
              <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-sm text-green-700 font-NunitoBold">
                  {productData.stock > 0 ? "In Stock" : "Out of Stock"}
                </Text>
              </View>
            </View>

            {/* Key Features */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-NunitoMedium text-gray-700">Premium Quality</Text>
              </View>
              <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-NunitoMedium text-gray-700">Fast Shipping</Text>
              </View>
              <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-NunitoMedium text-gray-700">Warranty Included</Text>
              </View>
            </View>

            {/* Product Analytics */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Views:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{productData.views}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Likes:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{productData.likes}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Sold:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{productData.purchased_count}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="mx-4 mb-4"
        >
          <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.05, 
              shadowRadius: 10, 
              elevation: 5 
            }}>
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
              Description
            </Text>
            <Text className="text-base text-gray-700 leading-7">
              {productData.description}
            </Text>
          </View>
        </Animated.View>

        {/* Product Performance */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="mx-4 mb-4"
        >
          <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.05, 
              shadowRadius: 10, 
              elevation: 5 
            }}>
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
              Product performance
            </Text>
            <View className="flex-row items-center mb-3">
              {renderStars(productData.rating)}
              <Text className="text-gray-600 ml-2 font-NunitoMedium">
                {productData.rating} ({productData.reviewCount} reviews)
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Status:</Text>
                <View className={`ml-2 px-2 py-1 rounded-full ${
                  productData.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Text className={`text-xs font-NunitoBold ${
                    productData.status === 'Active' ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {productData.status}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Stock:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{productData.stock} units</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Product Details */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="mx-4 mb-4"
        >
          <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.05, 
              shadowRadius: 10, 
              elevation: 5 
            }}>
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
              Product details
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Category</Text>
                <Text className="text-sm font-NunitoBold text-primary-600">{productData.category.name}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Condition</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{productData.condition}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Warranty</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{productData.warranty}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Listed on</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {new Date(productData.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Delivery time</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{productData.estimatedDelivery}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Product Orders */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="mx-4 mb-6"
        >
          <TouchableOpacity
            onPress={handleViewOrders}
            className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 flex-row items-center justify-between"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.05, 
              shadowRadius: 10, 
              elevation: 5 
            }}
          >
            <View className="flex-row items-center">
              <DocumentTextIcon size={24} color="#6B7280" />
              <View className="ml-3">
                <Text className="text-gray-900 font-NunitoMedium">
                  Orders for this product
                </Text>
                <Text className="text-gray-500 text-sm">
                  {productData.totalOrders} orders placed
                </Text>
              </View>
            </View>
            <ChevronRightIcon size={20} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom spacing for fixed buttons */}
        <View className="h-32 pb-4" />
      </ScrollView>

      {/* Premium Floating Action Bar */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -8 }, 
          shadowOpacity: 0.2, 
          shadowRadius: 24, 
          elevation: 20 
        }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        
        {/* Action Buttons */}
        <View className="px-2 py-4 flex-row gap-2 space-x-3">
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-1 bg-gray-500 rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white text-lg font-NunitoBold">Delete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-1 bg-primary-600 rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-white text-lg font-NunitoBold">Edit info</Text>
          </TouchableOpacity>
        </View>

        {/* Safe Area Bottom */}
        <View className="h-8 bg-white" />
      </Animated.View>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemType={productData.type}
        itemName={productData.name}
      />
    </SafeAreaView>
  )
}

export default ProductDetailsDetailed
