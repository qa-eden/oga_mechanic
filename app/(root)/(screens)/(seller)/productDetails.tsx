import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Linking } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, DocumentTextIcon, ChevronRightIcon, PhoneIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'
import { router, useLocalSearchParams } from 'expo-router'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import { sellerRoutes } from '@/constants/routes'

const { width: screenWidth } = Dimensions.get("window");

const ProductDetails = () => {
  const { productType, productId } = useLocalSearchParams<{
    productType: 'sparePart' | 'car' | 'rentedCar';
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
    name: productType === 'rentedCar' ? "BMW 328" : productType === 'car' ? "Escalade (2024)" : "Toyota Corolla 2015 Back Tyre (Pair)",
    year: productType === 'rentedCar' ? "2019" : productType === 'car' ? "2024" : "2015",
    price: productType === 'rentedCar' ? 400000 : productType === 'car' ? 105000000 : 7000,
    rating: 5.0,
    reviewCount: 30,
    stock: 12,
    images: [
      { id: 1, image: productType === 'rentedCar' ? images.car1 : productType === 'car' ? images.car1 : images.sparePart },
      { id: 2, image: productType === 'rentedCar' ? images.benz : productType === 'car' ? images.benz : images.carEngine },
      { id: 3, image: productType === 'rentedCar' ? images.car1 : productType === 'car' ? images.car1 : images.sparePart }
    ],
    description: productType === 'rentedCar' 
      ? "Premium BMW 328 available for daily rental. Well-maintained vehicle with automatic transmission, perfect for business trips or special occasions. Includes full insurance coverage and 24/7 roadside assistance."
      : productType === 'car' 
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
      first_name: "Micheal",
      last_name: "Adenuga",
      email: "micheal@mechanic.com",
      phone_number: "08056432765"
    },
    category: {
      name: productType === 'rentedCar' ? "Car Rental" : productType === 'car' ? "Cars" : "Spare Parts"
    },
    condition: "New",
    warranty: "1 Year",
    created_at: "2024-01-15",
    is_rental: productType === 'rentedCar',
    purchased_count: 15,
    views: 245,
    likes: 12,
    status: "Active",
    // Car rental specific features
    features: productType === 'rentedCar' ? {
      speed: "350km/hr",
      transmission: "Automatic",
      fuel: "Fuel",
      seats: "4 Seats"
    } : productType === 'car' ? {
      speed: "250km/hr",
      transmission: "Automatic", 
      fuel: "Premium",
      seats: "7 Seats"
    } : null
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
    if (productData.type === 'rentedCar') {
      router.push({
        pathname: '/uploadCarToRent' as any,
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

  const handleCallSeller = () => {
    if (productData.merchant.phone_number) {
      Linking.openURL(`tel:${productData.merchant.phone_number}`);
    }
  };

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
            {productData.type === 'sparePart' ? 'Spare part details' : productData.type === 'rentedCar' ? 'Car details' : 'Car details'}
          </Text>
        </View>
        <View className="w-6" />
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Car Name and Year */}
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
          <Text className="text-lg text-gray-600">
            {productData.year}
          </Text>
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
                  {productData.merchant.first_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-NunitoBold mb-1">
                  {productData.merchant.first_name} {productData.merchant.last_name}
                </Text>
                <View className="flex-row items-center">
                  <PhoneIcon size={16} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">
                    {productData.merchant.phone_number}
                  </Text>
                </View>
              </View>
            </View>

            {/* Overview and Pricing */}
            <View className="mb-6">
              <Text className="text-white text-lg font-NunitoBold mb-2">Overview</Text>
              <NairaCurrency
                value={productData.price}
                className="text-2xl font-NunitoExtraBold text-white"
              />
              {productData.is_rental && (
                <Text className="text-gray-400 text-sm">/day</Text>
              )}
            </View>

            {/* Car Features Grid */}
            {productData.features && (
              <View className="mb-8">
                <View className="flex-row flex-wrap gap-4">
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm mb-1">Speed</Text>
                    <Text className="text-white font-NunitoBold">{productData.features.speed}</Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm mb-1">Transmission</Text>
                    <Text className="text-white font-NunitoBold">{productData.features.transmission}</Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm mb-1">Fuel</Text>
                    <Text className="text-white font-NunitoBold">{productData.features.fuel}</Text>
                  </View>
                  <View className="bg-gray-800 rounded-xl p-4 flex-1 min-w-[45%]">
                    <Text className="text-gray-400 text-sm mb-1">Seats</Text>
                    <Text className="text-white font-NunitoBold">{productData.features.seats}</Text>
                  </View>
                </View>
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
            itemType={productData.type}
            itemName={productData.name}
          />
        </SafeAreaView>
      )
    }

    export default ProductDetails
