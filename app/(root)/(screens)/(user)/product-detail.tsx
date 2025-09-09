"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Linking,
  Animated,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons, images } from "@/constants";
import Rating from "@/components/Rating";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import CustomButton from "@/components/CustomButton";
import React from "react";
import CartIconBtn from "@/components/CartIconBtn";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";
import { useCart } from "@/contexts/CartContext";
import AddToCartButton from "@/components/AddToCartButton";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { useProductDetail } from "@/hooks/useProducts";
import { getErrorMessage } from "@/utils/errorMessages";
import { useAddToCart, useRemoveFromCart, useUpdateCartItemQuantity } from "@/hooks/useCart";

const { width: screenWidth } = Dimensions.get("window");

const ProductDetail = () => {
  const params = useLocalSearchParams() as { id?: string; productId?: string };
  const productId = params?.id || params?.productId;
  
  console.log('🔍 Product Detail - Params:', params);
  console.log('🔍 Product Detail - Product ID:', productId);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  // Cart API hooks
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantity();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // Fetch product detail from API
  const { data: product, isLoading, error, refetch } = useProductDetail(productId || '');

  // Animation effects
  useEffect(() => {
    if (product) {
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
  }, [product]);

  // Sync quantity with cart when product loads
  useEffect(() => {
    if (product && (product as any).is_in_cart) {
      // Get quantity from cart context if available
      const cartQuantity = getItemQuantity(product.id);
      if (cartQuantity > 0) {
        setQuantity(cartQuantity);
      }
    }
  }, [product, getItemQuantity]);

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Handle missing product ID - moved after all hooks
  if (!productId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center text-lg mb-4">
            Product ID not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state with skeleton
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-row items-center justify-between px-6 py-5 bg-white shadow-sm">
          <BackArrowBtn />
          <View className="flex-1 items-center">
            <View className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse" />
          </View>
          <CartIconBtn />
        </View>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Image Skeleton */}
          <View className="px-6 pt-6">
            <View className="w-full h-80 bg-gray-200 rounded-3xl animate-pulse" />
          </View>
          
          {/* Cards Skeleton */}
          {[1, 2, 3].map((i) => (
            <View key={i} className="mx-6 mb-6">
              <View className="bg-white rounded-3xl p-6 shadow-lg">
                <View className="flex-row items-center mb-4">
                  <View className="w-5 h-5 bg-gray-200 rounded-full mr-3 animate-pulse" />
                  <View className="w-40 h-5 bg-gray-200 rounded-lg animate-pulse" />
                </View>
                <View className="space-y-3">
                  <View className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  <View className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                  <View className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                </View>
              </View>
        </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-[1.3rem] font-NunitoBold text-gray-900">
            Product Detail
          </Text>
          <CartIconBtn />
        </View>
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-lg font-NunitoMedium text-red-600 text-center">
            {getErrorMessage(error, 'products')}
          </Text>
          <Text className="text-gray-500 text-center mt-2 text-sm">
            Go back and try again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No product data
  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-[1.3rem] font-NunitoBold text-gray-900">
            Product Detail
          </Text>
          <CartIconBtn />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-NunitoMedium text-gray-600">
            Product not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // const handleCall = () => {
  //   if (typeof product.merchant === 'object' && product.merchant?.phone_number) {
  //     // Use the phone number from merchant object
  //     console.log("Calling seller:", product.merchant.phone_number);
  //     // You can implement actual calling logic here
  //   } else {
  //     console.log("Call seller - phone not available in API");
  //   }
  // };

  const cartItem = {
    id: product.id, // Convert string ID to number
    name: product.name,
    price: parseFloat(product.price),
    stock: (product as any).stock || 10,
    image: product.images?.[0]?.image || "sparePart",
    originalPrice: parseFloat(product.price),
    discount: 15,
  };

  const handleAddToCart = async () => {
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: quantity
      });
      // Refetch product detail to update is_in_cart status
      await refetch();
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      await removeFromCartMutation.mutateAsync(product.id);
      // Refetch product detail to update is_in_cart status
      await refetch();
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  };

  const handleIncrementQuantity = async () => {
    if (quantity < ((product as any).stock || 10)) {
      try {
        await updateCartItemQuantityMutation.mutateAsync({
          productId: product.id,
          action: "increment"
        });
        setQuantity(prev => prev + 1);
        // Refetch product detail to ensure UI stays in sync
        await refetch();
      } catch (error) {
        console.error('Increment quantity error:', error);
      }
    }
  };

  const handleDecrementQuantity = async () => {
    if (quantity > 1) {
      try {
        await updateCartItemQuantityMutation.mutateAsync({
          productId: product.id,
          action: "decrement"
        });
        setQuantity(prev => prev - 1);
        // Refetch product detail to ensure UI stays in sync
        await refetch();
      } catch (error) {
        console.error('Decrement quantity error:', error);
      }
    }
  };

  const handleChatSeller = () => {
    // Chat seller logic
    console.log("Chat seller");
    router.push(routes?.chatSeller);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const renderImageThumbnail = ({
    item,
    index,
  }: {
    item: { id: number; image: string };
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedImageIndex(index)}
      className={`w-16 h-16 rounded-xl overflow-hidden mr-2 ${
        selectedImageIndex === index
          ? "border-2 border-white shadow-lg"
          : "border border-white/30"
      }`}
      style={selectedImageIndex === index ? { 
        shadowColor: '#fff', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.5, 
        shadowRadius: 4, 
        elevation: 4 
      } : {}}
    >
      {imageErrors.has(index) ? (
        <View className="w-full h-full bg-gray-200 items-center justify-center rounded-xl">
          <Text className="text-xs text-gray-500">Failed</Text>
        </View>
      ) : (
      <Image
        source={{ uri: item.image }}
          className="w-full h-full object-cover rounded-xl"
          onError={() => handleImageError(index)}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      {/* Header */}
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="flex-row items-center justify-between bg-red-400 px-6 py-5 bg-white shadow-sm"
      >
        <BackArrowBtn />
        <View className="flex-1 items-center">
          <Text className="text-lg font-NunitoBold text-gray-900">
            Product Details
        </Text>
        </View>
        <CartIconBtn />
      </Animated.View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#D30309']} // Android
            tintColor="#D30309" // iOS
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
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
            <TouchableOpacity 
              onPress={() => setIsImageModalVisible(true)}
              className="w-full bg-white"
              style={{ height: screenWidth * 1.1 }}
            >
              {product.images && product.images.length > 0 && !imageErrors.has(selectedImageIndex) ? (
              <Image
                source={{ uri: product.images[selectedImageIndex]?.image }}
                  className="w-full h-full"
                  style={{ resizeMode: 'contain' }}
                  onError={() => handleImageError(selectedImageIndex)}
              />
            ) : (
                <View className="w-full h-full items-center justify-center bg-gray-50">
              <images.ProductImg
                    className="w-full h-full"
                  />
                  {imageErrors.has(selectedImageIndex) && (
                    <Text className="text-sm text-gray-500 mt-2">Image failed to load</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Image Counter Badge */}
            {/* {product.images && product.images.length > 1 && (
              <View className="absolute top-12 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-NunitoMedium">
                  {selectedImageIndex + 1} of {product.images.length}
                </Text>
              </View>
            )} */}

            {/* Zoom Indicator */}
            <View className="absolute bottom-6 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg">
              <Text className="text-gray-700 text-lg">🔍</Text>
            </View>

            {/* Image Navigation Dots */}
            {product.images && product.images.length > 1 && (
              <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex-row space-x-2">
                {product.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-4">
              <FlatList
                data={product.images}
                renderItem={renderImageThumbnail}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                className="max-h-16"
              />
            </View>
          )}
          
          {/* Spacing after main image */}
          <View className="h-4" />
        </Animated.View>

        {/* Premium Seller Profile */}
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
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-md font-NunitoBold text-gray-900">
                Sold by
              </Text>
              <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                <Text className="text-xs text-green-700 font-NunitoMedium">
                  Verified
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl overflow-hidden mr-4 bg-gradient-to-br from-primary-100 to-primary-200 items-center justify-center">
                <Text className="text-xl font-NunitoBold text-primary-700">
                  {typeof product.merchant === 'string' 
                    ? product.merchant.charAt(0).toUpperCase() 
                    : product.merchant?.first_name?.charAt(0)?.toUpperCase() || 'M'}
                </Text>
              </View>
              
            <View className="flex-1">
                <Text className="text-base font-NunitoBold text-gray-900 mb-1">
                  {typeof product.merchant === 'string' 
                    ? 'Merchant Store' 
                    : `${product.merchant?.first_name || ''} ${product.merchant?.last_name || ''}`.trim() || 'Merchant Store'}
              </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  {typeof product.merchant === 'string' 
                    ? `Store ID: ${product.merchant.slice(0, 8)}...` 
                    : `Contact: ${product.merchant?.email || 'N/A'}`}
                </Text>
                
                <View className="flex-row items-center gap-2 space-x-4">
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 mr-1">Rating:</Text>
                    <Text className="text-xs font-NunitoBold text-gray-900">4.8</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 mr-1">Sales:</Text>
                    <Text className="text-xs font-NunitoBold text-gray-900">{(product as any).purchased_count || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
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
            {product.name}
          </Text>

            {/* Price and Stock Status */}
            <View className="flex-row items-center justify-between my-4">
          <NairaCurrency
            value={parseFloat(product.price)}
                className="text-3xl font-NunitoExtraBold text-primary-500"
              />
              <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-sm text-green-700 font-NunitoBold">
                  {(product as any).stock > 0 ? "In Stock" : "Out of Stock"}
            </Text>
              </View>
          </View>

            {/* Rating and Reviews */}
            {/* <View className="flex-row items-center mb-6">
              <Rating rating={(product as any).rating || 0} size={18} />
              <Text className="text-sm font-NunitoMedium text-gray-600 ml-2">
                {(product as any).rating || 0} ({(product as any).reviews?.length || 0} reviews)
              </Text>
              <View className="ml-4 flex-row items-center">
                <Text className="text-sm text-gray-500">Category:</Text>
                <Text className="text-sm font-NunitoBold text-primary-600 ml-1">
                  {product.category?.name || 'N/A'}
          </Text>
        </View>
            </View> */}

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

            {/* Stock Information */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Available:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{(product as any).stock} units</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Sold:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{(product as any).purchased_count || 'N/A'}</Text>
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
            {product.description || 'No description available for this product.'}
          </Text>
        </View>
        </Animated.View>

        {/* Product Specifications */}
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
              Specifications
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Product ID</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).id.slice(-12)}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Category</Text>
                <Text className="text-sm font-NunitoBold text-primary-600">{product.category?.name || 'N/A'}</Text>
          </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Rental Option</Text>
                <View className={`px-2 py-1 rounded-full ${(product as any).is_rental ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text className={`text-xs font-NunitoBold ${(product as any).is_rental ? 'text-green-700' : 'text-gray-600'}`}>
                    {product.is_rental ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Condition</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).condition || 'N/A'}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Warranty</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).warranty || 'N/A'}</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Listed</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {new Date((product as any).created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
            </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Product Reviews Section */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
          className="mx-4 mb-6"
        >
          <View className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.05, 
              shadowRadius: 10, 
              elevation: 5 
            }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Customer Reviews
            </Text>
              <TouchableOpacity>
                <Text className="text-sm text-primary-600 font-NunitoMedium">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center mr-4">
                <Text className="text-3xl font-NunitoExtraBold text-gray-900 mr-2">{(product as any).rating || 0}</Text>
                <Rating rating={(product as any).rating || 0} size={16} />
              </View>
              <Text className="text-sm text-gray-600">Based on {(product as any).reviews?.length || 0 } reviews</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-sm text-gray-600 text-center">
                No reviews yet. Be the first to review this product!
            </Text>
            </View>
          </View>
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
        
        {/* Quantity Selector */}
        {/* <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-NunitoMedium text-gray-700">Quantity</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl">
              <TouchableOpacity className="p-3">
                <Text className="text-lg font-NunitoBold text-gray-600">-</Text>
              </TouchableOpacity>
              <View className="px-4 py-3">
                <Text className="text-base font-NunitoBold text-gray-900">1</Text>
              </View>
              <TouchableOpacity className="p-3">
                <Text className="text-lg font-NunitoBold text-gray-600">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> */}

        {/* Action Buttons */}
        <View className="px-2 py-4 flex-row gap-2 space-x-3">
          <TouchableOpacity
            onPress={handleChatSeller}
            className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center"
          >
            <Text className="text-lg">💬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center">
            <Text className="text-lg">❤️</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            {(product as any).is_in_cart ? (
              // Cart item controls
              <View className="flex-row gap-2 items-center justify-between bg-gray-100 rounded-2xl px-2 py-2">
                <TouchableOpacity
                  onPress={handleRemoveFromCart}
                  disabled={removeFromCartMutation.isPending}
                  className="bg-primary-500 px-4 py-3 rounded-xl items-center justify-center"
                >
                  {removeFromCartMutation.isPending ? (
                    <Text className="text-white text-sm font-NunitoMedium">Removing...</Text>
                  ) : (
                    <Text className="text-white text-sm font-NunitoMedium">Remove from cart</Text>
                  )}
                </TouchableOpacity>
                
                <View className="flex-row items-center bg-white rounded-xl px-2">
                  <TouchableOpacity
                    onPress={handleDecrementQuantity}
                    disabled={updateCartItemQuantityMutation.isPending || quantity <= 1}
                    className="w-8 h-8 items-center justify-center"
                  >
                    {updateCartItemQuantityMutation.isPending ? (
                      <Text className="text-gray-400 text-sm">...</Text>
                    ) : (
                      <Text className="text-gray-600 text-4xl">-</Text>
                    )}
                  </TouchableOpacity>
                  
                  <View className="px-3 py-2">
                    <Text className="text-base font-NunitoBold text-gray-900">
                      {quantity}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={handleIncrementQuantity}
                    disabled={updateCartItemQuantityMutation.isPending || quantity >= ((product as any).stock)}
                    className="w-8 h-8 items-center justify-center"
                  >
                    {updateCartItemQuantityMutation.isPending ? (
                      <Text className="text-gray-400 text-sm">...</Text>
                    ) : (
                      <Text className="text-gray-600 text-4xl">+</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Add to cart button
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="bg-primary-600 py-4 px-6 rounded-2xl items-center justify-center"
              >
                {addToCartMutation.isPending ? (
                  <Text className="text-white text-lg font-NunitoBold">
                    Adding...
                  </Text>
                ) : (
                  <Text className="text-white text-lg font-NunitoBold">
                    Add to Cart
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Safe Area Bottom */}
        <View className="h-8 bg-white" />
      </Animated.View>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={isImageModalVisible}
        onClose={() => setIsImageModalVisible(false)}
        images={product.images || []}
        selectedIndex={selectedImageIndex}
        onImageSelect={setSelectedImageIndex}
        imageErrors={imageErrors}
        onImageError={handleImageError}
      />
    </SafeAreaView>
  );
};

export default ProductDetail;
