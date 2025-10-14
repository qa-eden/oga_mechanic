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
  ActivityIndicator,
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
import { useCart as useCartContext } from "@/contexts/CartContext";
import AddToCartButton from "@/components/AddToCartButton";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import { useProductDetail, useToggleFavorite } from "@/hooks/useProducts";
import { showToast } from "@/utils/toastUtils";
import { getErrorMessage } from "@/utils/errorMessages";
import { useCart, useAddToCart, useRemoveFromCart, useUpdateCartItemQuantity } from "@/hooks/useCart";
import { PhotoIcon } from "react-native-heroicons/outline";

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
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showFavoriteSuccess, setShowFavoriteSuccess] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, isInCart, getItemQuantity } = useCartContext();
  
  // Cart API hooks - fetches and mutations
  const { data: cartData, isLoading: isCartLoading, refetch: refetchCart } = useCart();
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantity();

  // Log cart data for debugging
  console.log('🛒 Cart Data:', cartData);
  
  // Favorite API hook
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Fetch product detail from API
  const { data: product, isLoading, error, refetch } = useProductDetail(productId || '');
  
  // Debug: Log the API response
  console.log('🔍 Product Detail Debug:');
  console.log('  productId:', productId);
  console.log('  isLoading:', isLoading);
  console.log('  error:', error);
  console.log('  product:', product);

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

  // Reset image loading state when selected image changes
  useEffect(() => {
    setImageLoading(true);
    // Set a timeout to hide loading spinner after 5 seconds
    const timeout = setTimeout(() => {
      setImageLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [selectedImageIndex, product?.images]);

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
            {error ? 'Error loading product' : 'Product not found'}
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
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    stock: (product as any).stock || 0,
    image: product.images?.[0]?.image || null,
  };

  const handleAddToCart = async () => {
    try {
      console.log('🛒 Adding to cart...');
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: quantity
      });
      // Refetch cart data and product detail
      await Promise.all([refetchCart(), refetch()]);
      console.log('✅ Cart updated successfully');
    } catch (error) {
      console.error('❌ Add to cart error:', error);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      console.log('🛒 Removing from cart...');
      await removeFromCartMutation.mutateAsync(product.id);
      // Refetch cart data and product detail
      await Promise.all([refetchCart(), refetch()]);
      console.log('✅ Cart updated successfully');
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
    }
  };

  const handleIncrementQuantity = async () => {
    if (quantity < ((product as any).stock || 10)) {
      try {
        console.log('🛒 Incrementing quantity...');
        await updateCartItemQuantityMutation.mutateAsync({
          productId: product.id,
          action: "increment"
        });
        setQuantity(prev => prev + 1);
        // Refetch cart data and product detail
        await Promise.all([refetchCart(), refetch()]);
        console.log('✅ Cart updated successfully');
      } catch (error) {
        console.error('❌ Increment quantity error:', error);
      }
    }
  };

  const handleDecrementQuantity = async () => {
    if (quantity > 1) {
      try {
        console.log('🛒 Decrementing quantity...');
        await updateCartItemQuantityMutation.mutateAsync({
          productId: product.id,
          action: "decrement"
        });
        setQuantity(prev => prev - 1);
        // Refetch cart data and product detail
        await Promise.all([refetchCart(), refetch()]);
        console.log('✅ Cart updated successfully');
      } catch (error) {
        console.error('❌ Decrement quantity error:', error);
      }
    }
  };

  const handleChatSeller = () => {
    // Chat seller logic
    console.log("Chat seller");
    router.push(routes?.chatSeller);
  };

  const handleToggleFavorite = async () => {
    console.log('❤️ Favorite button clicked!');
    console.log('❤️ Product ID:', product.id);
    console.log('❤️ Current favorite status:', (product as any).is_in_favorite_list);
    
    const isCurrentlyFavorited = (product as any).is_in_favorite_list || false;
    
    try {
      console.log('❤️ Calling toggleFavorite API...');
      const result = await toggleFavoriteMutation.mutateAsync({
        productId: product.id,
        isCurrentlyFavorited
      });
      console.log('❤️ Toggle favorite API result:', result);
      
      // Show success toast
      if (isCurrentlyFavorited) {
        showToast.success('Removed from favorites');
      } else {
        showToast.success('Added to favorites');
      }
      
      // Show success feedback
      setShowFavoriteSuccess(true);
      
      // Refetch product detail to update favorite status
      console.log('❤️ Refetching product detail...');
      await refetch();
      console.log('❤️ Product detail refetched successfully');
      
      // Hide success feedback after 2 seconds
      setTimeout(() => {
        setShowFavoriteSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Toggle favorite error:', error);
      setShowFavoriteSuccess(false);
      
      // Show error toast
      showToast.error('Failed to update favorites. Please try again.');
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const handleImageExpand = () => {
    if (isImageExpanded) {
      // Collapse image
      Animated.timing(imageScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsImageExpanded(false);
      });
    } else {
      // Expand image
      setIsImageExpanded(true);
      Animated.timing(imageScaleAnim, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
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
          <PhotoIcon size={24} color="#9CA3AF" />
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
            <Animated.View
              className="w-full bg-white"
              style={{ 
                height: screenWidth * 1.1,
                transform: [{ scale: imageScaleAnim }]
              }}
            >
              <TouchableOpacity 
                onPress={handleImageExpand}
                className="w-full h-full"
                activeOpacity={0.9}
                disabled={!product.images || product.images.length === 0}
              >
                {product.images && product.images.length > 0 && !imageErrors.has(selectedImageIndex) ? (
                  <>
                    {imageLoading && (
                      <View className="absolute w-full h-full items-center justify-center bg-gray-50 z-10">
                        <ActivityIndicator size="large" color="#D30309" />
                        <Text className="text-sm text-gray-500 mt-4">Loading image...</Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: product.images[selectedImageIndex]?.image }}
                      className="w-full h-full"
                      style={{ resizeMode: 'contain' }}
                      onError={() => {
                        setImageLoading(false);
                        handleImageError(selectedImageIndex);
                      }}
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                      onLoad={() => setImageLoading(false)}
                    />
                  </>
                ) : (
                  <View className="w-full h-full items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                    <View className="items-center justify-center">
                      <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                        <PhotoIcon size={64} color="#9CA3AF" />
                      </View>
                      <Text className="text-lg font-NunitoBold text-gray-700 mb-2">
                        {imageErrors.has(selectedImageIndex) ? 'Image failed to load' : 'No image available'}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Product image not found
                      </Text>
                    </View>
                </View>
              )}
            </TouchableOpacity>
            </Animated.View>

            {/* Image Counter Badge */}
            {/* {product.images && product.images.length > 1 && (
              <View className="absolute top-12 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-NunitoMedium">
                  {selectedImageIndex + 1} of {product.images.length}
                </Text>
              </View>
            )} */}

            {/* Search/Zoom Button */}
            {/* <TouchableOpacity 
              onPress={handleImageExpand}
              className="absolute bottom-6 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 text-lg">
                {isImageExpanded ? '✕' : '🔍'}
              </Text>
            </TouchableOpacity> */}

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
            
            <TouchableOpacity 
              className="flex-row items-center" 
              onPress={() => router.push({
                pathname: routes.merchantProfile as any,
                params: {
                  merchantId: typeof product.merchant === 'string' 
                    ? product.merchant 
                    : product.merchant?.id
                }
              })}
              activeOpacity={0.7}
            >
              <View className="w-14 h-14 rounded-2xl overflow-hidden mr-4 bg-gray-200 items-center justify-center">
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
                {/* <Text className="text-sm text-gray-500 mb-2">
                  {typeof product.merchant === 'string' 
                    ? `Store ID: ${product.merchant.slice(0, 8)}...` 
                    : `Contact: ${product.merchant?.email || 'N/A'}`}
                </Text> */}
                
                <View className="flex-row items-center gap-2 space-x-4">
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 mr-1">Rating:</Text>
                    <Text className="text-xs font-NunitoBold text-gray-900">
                      {(product as any).merchant_rating ? (product as any).merchant_rating.toFixed(1) : 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 mr-1">Sales:</Text>
                    <Text className="text-xs font-NunitoBold text-gray-900">{(product as any).purchased_count || '0'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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


            {/* Stock Information */}
            <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Available:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{(product as any).stock || 0} units</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Sold:</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-2">{(product as any).purchased_count || 0}</Text>
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
              {/* Product ID */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Product ID</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).id.slice(-12)}</Text>
              </View>

              {/* Category */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Category</Text>
                <Text className="text-sm font-NunitoBold text-primary-600">{product.category?.name || 'N/A'}</Text>
              </View>

              {/* Transmission */}
              {(product as any).transmission && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Transmission</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900 capitalize">{(product as any).transmission}</Text>
                </View>
              )}

              {/* Fuel Type */}
              {(product as any).fuel_type && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Fuel Type</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900 capitalize">{(product as any).fuel_type}</Text>
                </View>
              )}

              {/* Engine Size */}
              {(product as any).engine_size && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Engine Size</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).engine_size}</Text>
                </View>
              )}

              {/* Mileage */}
              {(product as any).mileage && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Mileage</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {(product as any).mileage.toLocaleString()} {(product as any).mileage_unit || 'km'}
                  </Text>
                </View>
              )}

              {/* Exterior Color */}
              {(product as any).exterior_color && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Exterior Color</Text>
                  <View className="flex-row items-center">
                    <View 
                      className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                      style={{ backgroundColor: (product as any).exterior_color.toLowerCase() }}
                    />
                    <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).exterior_color}</Text>
                  </View>
                </View>
              )}

              {/* Interior Color */}
              {(product as any).interior_color && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Interior Color</Text>
                  <View className="flex-row items-center">
                    <View 
                      className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                      style={{ backgroundColor: (product as any).interior_color.toLowerCase() }}
                    />
                    <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).interior_color}</Text>
                  </View>
                </View>
              )}

              {/* Number of Doors */}
              {(product as any).number_of_doors && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Doors</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).number_of_doors}</Text>
                </View>
              )}

              {/* Number of Seats */}
              {(product as any).number_of_seats && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Seats</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).number_of_seats}</Text>
                </View>
              )}

              {/* Body Type */}
              {(product as any).body_type && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Body Type</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900 uppercase">{(product as any).body_type}</Text>
                </View>
              )}

              {/* Rental Option */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Rental Option</Text>
                <View className={`px-2 py-1 rounded-full ${(product as any).is_rental ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text className={`text-xs font-NunitoBold ${(product as any).is_rental ? 'text-green-700' : 'text-gray-600'}`}>
                    {product.is_rental ? 'Available' : 'Not Available'}
                  </Text>
                </View>
              </View>

              {/* Condition */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Condition</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 capitalize">{(product as any).condition || 'N/A'}</Text>
              </View>

              {/* Warranty */}
              {(product as any).warranty && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">Warranty</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">{(product as any).warranty}</Text>
                </View>
              )}

              {/* Listed Date */}
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600 font-NunitoMedium">Listed</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {new Date((product as any).created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Car Features & Amenities */}
        {((product as any).air_conditioning || (product as any).leather_seats || (product as any).navigation_system || 
          (product as any).bluetooth || (product as any).parking_sensors || (product as any).cruise_control || 
          (product as any).keyless_entry || (product as any).sunroof || (product as any).alloy_wheels ||
          (product as any).airbags || (product as any).abs || (product as any).traction_control ||
          (product as any).lane_assist || (product as any).blind_spot_monitor) && (
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
                Features & Amenities
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {/* Comfort Features */}
                {(product as any).air_conditioning && (
                  <View className="bg-blue-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-blue-700">Air Conditioning</Text>
                  </View>
                )}
                
                {(product as any).leather_seats && (
                  <View className="bg-amber-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-amber-700">Leather Seats</Text>
                  </View>
                )}

                {(product as any).sunroof && (
                  <View className="bg-sky-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-sky-700">Sunroof</Text>
                  </View>
                )}

                {/* Technology Features */}
                {(product as any).navigation_system && (
                  <View className="bg-indigo-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-indigo-700">Navigation</Text>
                  </View>
                )}

                {(product as any).bluetooth && (
                  <View className="bg-purple-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-purple-700">Bluetooth</Text>
                  </View>
                )}

                {/* Safety Features */}
                {(product as any).airbags && (
                  <View className="bg-red-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-red-700">Airbags</Text>
                  </View>
                )}

                {(product as any).abs && (
                  <View className="bg-orange-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-orange-700">ABS</Text>
                  </View>
                )}

                {(product as any).traction_control && (
                  <View className="bg-green-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-green-700">Traction Control</Text>
                  </View>
                )}

                {(product as any).lane_assist && (
                  <View className="bg-teal-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-teal-700">Lane Assist</Text>
                  </View>
                )}

                {(product as any).blind_spot_monitor && (
                  <View className="bg-cyan-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-cyan-700">Blind Spot Monitor</Text>
                  </View>
                )}

                {/* Convenience Features */}
                {(product as any).parking_sensors && (
                  <View className="bg-violet-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-violet-700">Parking Sensors</Text>
                  </View>
                )}

                {(product as any).cruise_control && (
                  <View className="bg-pink-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-pink-700">Cruise Control</Text>
                  </View>
                )}

                {(product as any).keyless_entry && (
                  <View className="bg-rose-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-rose-700">Keyless Entry</Text>
                  </View>
                )}

                {(product as any).alloy_wheels && (
                  <View className="bg-slate-50 px-4 py-2.5 rounded-full">
                    <Text className="text-sm font-NunitoMedium text-slate-700">Alloy Wheels</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

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
                <Text className="text-3xl font-NunitoExtraBold text-gray-900 mr-2">
                  {(product as any).rating ? (product as any).rating.toFixed(1) : '0.0'}
                </Text>
                <Rating rating={(product as any).rating || 0} size={16} />
              </View>
              <Text className="text-sm text-gray-600">Based on {(product as any).reviews?.length || 0} reviews</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-sm text-gray-600 text-center">
                No reviews yet. Be the first to review this product!
            </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing for fixed buttons */}
        <View className="h-[130px] pb-4" />
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
        <View className="px-2 py-4 flex-row items-center gap-2 space-x-3">
          {/* <TouchableOpacity
            onPress={handleChatSeller}
            className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center"
          >
            <Text className="text-lg">💬</Text>
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            onPress={() => {
              console.log('❤️ TouchableOpacity onPress triggered!');
              handleToggleFavorite();
            }}
            disabled={toggleFavoriteMutation.isPending}
            className={`w-14 h-14 rounded-2xl items-center justify-center ${
              showFavoriteSuccess ? 'bg-green-100' : (product as any).is_in_favorite_list ? 'bg-red-100' : 'bg-gray-100'
            }`}
            style={{ opacity: toggleFavoriteMutation.isPending ? 0.6 : 1 }}
          >
            {toggleFavoriteMutation.isPending ? (
               <ActivityIndicator size="small" className="text-primary-500" />
            ) : showFavoriteSuccess ? (
              <Text className="text-xl text-green-500">✓</Text>
            ) : (
              <Text className={` ${(product as any).is_in_favorite_list ? 'text-red-500 text-xl' : 'text-gray-400 text-3xl'}`}>
                {(product as any).is_in_favorite_list ? '❤️' : '♡'}
              </Text>
            )}
          </TouchableOpacity>
          
          <View className="flex-1">
            {(product as any).is_in_cart ? (
              // Cart item controls - Vertical layout
              <View className="space-y-3">
                {/* Quantity Controls */}
                <View className="flex-row items-center justify-center overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Decrement Button */}
                  <TouchableOpacity
                    onPress={handleDecrementQuantity}
                    disabled={updateCartItemQuantityMutation.isPending || quantity <= 1}
                    className="flex-1 py-2 items-center justify-center"
                    style={{ 
                      backgroundColor: quantity <= 1 ? '#f3f4f6' : '#f9fafb',
                      opacity: (updateCartItemQuantityMutation.isPending || quantity <= 1) ? 0.5 : 1 
                    }}
                  >
                    {updateCartItemQuantityMutation.isPending ? (
                      <Text className="text-gray-400 text-lg">⋯</Text>
                    ) : (
                      <Text className="text-gray-700 text-xl font-NunitoBold">−</Text>
                    )}
                  </TouchableOpacity>
                  
                  {/* Quantity Display */}
                  <View className="flex-1 py-2 items-center justify-center border-x border-gray-200">
                    <Text className="text-lg font-NunitoBold text-gray-900">
                      {quantity}
                    </Text>
                  </View>
                  
                  {/* Increment Button */}
                  <TouchableOpacity
                    onPress={handleIncrementQuantity}
                    disabled={updateCartItemQuantityMutation.isPending || quantity >= ((product as any).stock)}
                    className="flex-1 py-2 items-center justify-center mb-1"
                    style={{ 
                      backgroundColor: quantity >= ((product as any).stock) ? '#f3f4f6' : '#f9fafb',
                      opacity: (updateCartItemQuantityMutation.isPending || quantity >= ((product as any).stock)) ? 0.5 : 1 
                    }}
                  >
                    {updateCartItemQuantityMutation.isPending ? (
                      <Text className="text-gray-400 text-lg">...</Text>
                    ) : (
                      <Text className="text-gray-700 text-xl font-NunitoBold">+</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Remove Button */}
                <CustomButton
                  title="Remove from Cart"
                  onPress={handleRemoveFromCart}
                  disabled={removeFromCartMutation.isPending}
                  loading={removeFromCartMutation.isPending}
                  loadingText="Removing from Cart"
                  className="mt-2"
                />
              </View>
            ) : (

              <CustomButton
                title="Add to Cart"
                onPress={handleAddToCart}
                disabled={addToCartMutation.isPending}
                loading={addToCartMutation.isPending}
                loadingText="Adding"
              />
            )}
          </View>
        </View>

        {/* Safe Area Bottom */}
        <View className="h-6 bg-white" />
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
