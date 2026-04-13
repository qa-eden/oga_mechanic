import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Share,
  Platform,
} from "react-native";
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ShareIcon } from 'react-native-heroicons/outline';

const { width: screenWidth } = Dimensions.get("window");
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import CartIconBtn from "@/components/CartIconBtn";
import BackArrowBtn from "@/components/BackArrowBtn";
import { useCart as useCartContext } from "@/contexts/CartContext";
import { useProductDetail, useToggleFavorite } from "@/hooks/useProducts";
import { showToast } from "@/utils/toastUtils";
import { getErrorMessage } from "@/utils/errorMessages";
import {
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useUpdateCartItemQuantity,
} from "@/hooks/useCart";
import {
  ProductImageGallery,
  ProductSellerCard,
  ProductInfoCard,
  ProductDescription,
  ProductSpecifications,
  ProductFeatures,
  ProductActionBar,
  ProductReviews,
  ProductRepairHistory,
} from "@/components/product-detail";

const ProductDetail = () => {
  const params = useLocalSearchParams() as { id?: string; productId?: string };
  const productId = params?.id || params?.productId;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showFavoriteSuccess, setShowFavoriteSuccess] = useState(false);
  const { getItemQuantity } = useCartContext();

  // API hooks
  const { data: product, isLoading, error, refetch } = useProductDetail(productId || "");
  const { refetch: refetchCart } = useCart();
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantity();
  const toggleFavoriteMutation = useToggleFavorite();

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (productId) {
        refetch();
        refetchCart();
      }
    }, [productId, refetch, refetchCart])
  );

  // Sync quantity with cart
  useEffect(() => {
    if (product?.is_in_cart) {
      const cartQuantity = getItemQuantity(product.id);
      if (cartQuantity > 0) setQuantity(cartQuantity);
    }
  }, [product, getItemQuantity]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Share product functionality
  const handleShare = useCallback(async () => {
    if (!product) return;
    
    try {
      const priceValue = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      const shareMessage = `Check out ${product.name}\n\nPrice: ₦${priceValue.toLocaleString()}\n\nView on Oga Mechanic`;
      
      await Share.share({
        message: shareMessage,
        title: product.name,
      });
      
      // Haptic feedback on share
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [product]);

  // Memoize product price for performance
  const productPrice = useMemo(() => {
    if (!product) return 0;
    return typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  }, [product?.price]);

  // Handlers - must be defined before conditional returns
  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await addToCartMutation.mutateAsync({ productId: product.id, quantity });
      await Promise.all([refetchCart(), refetch()]);
    } catch (e) {}
  }, [product?.id, quantity, addToCartMutation, refetchCart, refetch]);

  const handleRemoveFromCart = useCallback(async () => {
    if (!product) return;
    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await removeFromCartMutation.mutateAsync(product.id);
      await Promise.all([refetchCart(), refetch()]);
    } catch (e) {}
  }, [product?.id, removeFromCartMutation, refetchCart, refetch]);

  const handleIncrement = useCallback(async () => {
    if (!product || quantity >= (product.stock || 10)) return;
    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await updateCartItemQuantityMutation.mutateAsync({
        productId: product.id,
        action: "increment",
      });
      setQuantity((prev) => prev + 1);
      await Promise.all([refetchCart(), refetch()]);
    } catch (e) {}
  }, [quantity, product?.stock, product?.id, updateCartItemQuantityMutation, refetchCart, refetch]);

  const handleDecrement = useCallback(async () => {
    if (!product || quantity <= 1) return;
    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await updateCartItemQuantityMutation.mutateAsync({
        productId: product.id,
        action: "decrement",
      });
      setQuantity((prev) => prev - 1);
      await Promise.all([refetchCart(), refetch()]);
    } catch (e) {}
  }, [quantity, product?.id, updateCartItemQuantityMutation, refetchCart, refetch]);

  const handleToggleFavorite = useCallback(async () => {
    if (!product) return;
    const isCurrentlyFavorited = product.is_in_favorite_list || false;
    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await toggleFavoriteMutation.mutateAsync({
        productId: product.id,
        isCurrentlyFavorited,
      });
      showToast.success(
        isCurrentlyFavorited ? "Removed from favorites" : "Added to favorites"
      );
      setShowFavoriteSuccess(true);
      await refetch();
      setTimeout(() => setShowFavoriteSuccess(false), 2000);
    } catch (e) {
      setShowFavoriteSuccess(false);
      showToast.error("Failed to update favorites. Please try again.");
    }
  }, [product?.is_in_favorite_list, product?.id, toggleFavoriteMutation, refetch]);

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
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <View className="flex-1 items-center">
            <View className="w-32 h-5 bg-gray-200 rounded-lg" />
          </View>
          <CartIconBtn />
        </View>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Image Skeleton */}
          <View className="w-full bg-gray-200" style={{ height: screenWidth * 0.95 }}>
            <View className="w-full h-full bg-gray-200" />
          </View>
          
          {/* Cards Skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="mx-4 mb-3">
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center mb-3">
                  <View className="w-24 h-5 bg-gray-200 rounded-lg" />
                </View>
                <View className="space-y-2">
                  <View className="w-full h-3 bg-gray-200 rounded" />
                  <View className="w-3/4 h-3 bg-gray-200 rounded" />
                  <View className="w-1/2 h-3 bg-gray-200 rounded" />
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-base font-NunitoBold text-gray-900">
          Product Details
        </Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={handleShare}
            className="w-9 h-9 items-center justify-center rounded-full bg-gray-100"
          >
            <ShareIcon size={20} color="#374151" />
          </TouchableOpacity>
          <CartIconBtn />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#D30309"]}
            tintColor="#D30309"
          />
        }
      >
        {/* Image Gallery */}
        <Animated.View entering={FadeIn.duration(400)}>
          <ProductImageGallery images={product.images || []} />
        </Animated.View>

        {/* Seller Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ProductSellerCard
            merchantId={product.merchant_id}
            merchantEmail={product.merchant_email}
            merchantRating={product.merchant_rating ?? undefined}
            purchasedCount={product.purchased_count ?? undefined}
          />
        </Animated.View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <ProductInfoCard
            name={product.name}
            price={productPrice}
            stock={product.stock || 0}
            purchasedCount={product.purchased_count ?? undefined}
          />
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <ProductDescription description={product.description} />
        </Animated.View>

        {/* Specifications */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <ProductSpecifications
            productId={product.id}
            category={product.category?.name}
            condition={(product as any).condition}
            transmission={(product as any).transmission}
            fuelType={(product as any).fuel_type}
            engineSize={(product as any).engine_size}
            mileage={(product as any).mileage}
            mileageUnit={(product as any).mileage_unit}
            exteriorColor={(product as any).exterior_color}
            interiorColor={(product as any).interior_color}
            numberOfDoors={(product as any).number_of_doors}
            numberOfSeats={(product as any).number_of_seats}
            bodyType={(product as any).body_type}
            isRental={product.is_rental}
            warranty={(product as any).warranty}
            createdAt={(product as any).created_at}
          />
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <ProductFeatures
            airConditioning={(product as any).air_conditioning}
            leatherSeats={(product as any).leather_seats}
            navigationSystem={(product as any).navigation_system}
            bluetooth={(product as any).bluetooth}
            parkingSensors={(product as any).parking_sensors}
            cruiseControl={(product as any).cruise_control}
            keylessEntry={(product as any).keyless_entry}
            sunroof={(product as any).sunroof}
            alloyWheels={(product as any).alloy_wheels}
            airbags={(product as any).airbags}
            abs={(product as any).abs}
            tractionControl={(product as any).traction_control}
            laneAssist={(product as any).lane_assist}
            blindSpotMonitor={(product as any).blind_spot_monitor}
          />
        </Animated.View>

        {/* Repair History */}
        {product.repair_history && product.repair_history.length > 0 && (
          <Animated.View entering={FadeInDown.delay(325).duration(400)}>
            <ProductRepairHistory repairHistory={product.repair_history} />
          </Animated.View>
        )}

        {/* Reviews */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <ProductReviews
            rating={(product as any).rating ?? undefined}
            reviewCount={(product as any).reviews?.length ?? 0}
          />
        </Animated.View>

        {/* Bottom spacing for action bar */}
        <View className="h-28" />
      </ScrollView>

      {/* Action Bar */}
      <ProductActionBar
        isInCart={product.is_in_cart}
        isFavorite={product.is_in_favorite_list}
        quantity={quantity}
        maxStock={product.stock || 10}
        showFavoriteSuccess={showFavoriteSuccess}
        isTogglingFavorite={toggleFavoriteMutation.isPending}
        isAddingToCart={addToCartMutation.isPending}
        isRemovingFromCart={removeFromCartMutation.isPending}
        isUpdatingQuantity={updateCartItemQuantityMutation.isPending}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </SafeAreaView>
  );
};

export default ProductDetail;
