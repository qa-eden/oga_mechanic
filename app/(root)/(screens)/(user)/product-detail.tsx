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
  Linking,
} from "react-native";
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ShareIcon, CheckCircleIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';

const { width: screenWidth } = Dimensions.get("window");
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import { useProductDetail, useToggleFavorite } from "@/hooks/useProducts";
import { useMerchantProfileByUuid, usePrimaryUserProfile, useUserCars } from "@/hooks/useUserProfile";
import { communicationsAPI } from "@/lib/api/communications";
import { showToast } from "@/utils/toastUtils";
import { getErrorMessage } from "@/utils/errorMessages";
import { routes } from "@/constants/routes";
import { useProfileStore } from "@/hooks/useProfileStore";
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
import ContactSelectionModal from "@/components/modals/ContactSelectionModal";

const ProductDetail = () => {
  const params = useLocalSearchParams() as { id?: string; productId?: string };
  const productId = params?.id || params?.productId;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFavoriteSuccess, setShowFavoriteSuccess] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);

  // API hooks
  const { data: product, isLoading, error, refetch } = useProductDetail(productId || "");
  const { data: merchantProfileData } = useMerchantProfileByUuid(product?.merchant_id || "", !!product?.merchant_id);
  const { data: profileResponse } = usePrimaryUserProfile();
  const { data: vehicles } = useUserCars();
  const toggleFavoriteMutation = useToggleFavorite();

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (productId) {
        refetch();
      }
    }, [productId, refetch])
  );



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
      const shareMessage = `Check out ${product.name} on Oga Mechanic! 🚗\n\nPrice: ₦${priceValue.toLocaleString()}\n\nView details and contact the seller on the Oga Mechanic app.\n\nDownload or open here: https://ogamechanic.org`;
      
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

  // Handlers - Communication
  const handleCall = useCallback(() => {
    if (!product) return;
    
    // Prioritize phone number from the full merchant profile we fetched
    const merchantPhone = merchantProfileData?.data?.merchant_profile?.user?.phone_number;
    const fallbackPhone = (product as any).merchant?.phone_number || product.contact_info?.phone || "08000000000";
    
    if (merchantPhone || fallbackPhone) {
      setIsContactModalVisible(true);
    } else {
      showToast.error("Seller phone number not available");
    }
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [product, merchantProfileData]);

  const performVoiceCall = useCallback(() => {
    if (!product) return;
    const merchantPhone = merchantProfileData?.data?.merchant_profile?.user?.phone_number;
    const fallbackPhone = (product as any).merchant?.phone_number || product.contact_info?.phone || "08000000000";
    const phoneNumber = merchantPhone || fallbackPhone;
    Linking.openURL(`tel:${phoneNumber}`);
  }, [product, merchantProfileData]);

  const performWhatsAppCall = useCallback(() => {
    if (!product) return;
    const merchantPhone = merchantProfileData?.data?.merchant_profile?.user?.phone_number;
    const fallbackPhone = (product as any).merchant?.phone_number || product.contact_info?.phone || "08000000000";
    const phoneNumber = merchantPhone || fallbackPhone;
    
    // Format number: remove leading + and ensure international format
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // Role detection - normalized for PrimaryUserProfileResponse structure
    const user = (profileResponse as any)?.data || (profileResponse as any)?.user;
    const activeRole = user?.active_role || (profileResponse as any)?.active_role || "customer";
    const isMechanic = activeRole.toLowerCase() === 'mechanic';
    const roleLabel = isMechanic ? "a mechanic" : "a customer";
    
    // Professional Template
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    const userName = (firstName || lastName) ? `${firstName} ${lastName}` : "a user";
    
    const message = `Hi, I'm ${userName}, ${roleLabel} from Oga Mechanic. I'm interested in your ${product.name} (₦${productPrice.toLocaleString()}). Is it available for pickup?`;
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
    
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        showToast.error("WhatsApp is not installed on this device");
      }
    });
  }, [product, merchantProfileData, productPrice, profileResponse]);

  const handleChat = useCallback(async () => {
    if (!product) return;

    try {
      // 1. Get the target seller's USER UUID (flexible lookup)
      const sellerUserId = 
        merchantProfileData?.data?.merchant_profile?.user?.id || 
        (merchantProfileData?.data?.merchant_profile as any)?.user_id ||
        (merchantProfileData?.data as any)?.user_id ||
        product.merchant_id;

      if (!sellerUserId) {
        showToast.error("Could not find seller information.");
        return;
      }

      // 2. CHECK FIRST: Call GET to see if a chat room already exists
      const roomsResponse = await communicationsAPI.getChatRooms();
      const rooms = roomsResponse?.results?.data || [];
      
      // Look for a room that includes this seller's user ID
      const existingRoom = rooms.find((room: any) => 
        room.participants?.some((p: any) => p.id === sellerUserId) ||
        room.other_participant?.id === sellerUserId
      );

      let roomId: string;

      if (existingRoom) {
        console.log("♻️ Found existing chat room:", existingRoom.id);
        roomId = existingRoom.id;
      } else {
        // 3. Only POST if no existing room was found
        console.log("🆕 No existing room, creating new chat with User ID:", sellerUserId);
        const createResponse = await communicationsAPI.createChatRoom([sellerUserId]);
        
        if (createResponse.status && createResponse.data) {
          roomId = createResponse.data.id;
        } else {
          showToast.error("Could not start chat. Please try again.");
          return;
        }
      }

      // 4. Navigate to the chat room
      router.push({
        pathname: "/(root)/(screens)/(user)/chat-room",
        params: {
          roomId: roomId,
          participantName: product.merchant_email.split('@')[0],
          participantAvatar: product.images?.[0]?.image || "",
        }
      });
    } catch (error) {
      console.error("❌ Chat connection error:", error);
      showToast.error("Failed to connect with seller.");
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [product]);

  // Check compatibility with user's car
  const compatibilityInfo = useMemo(() => {
    if (!product) return { isCompatible: false, userCar: "" };
    
    // Build list of makes to check
    const user = (profileResponse as any)?.data || (profileResponse as any)?.user;
    const cars = vehicles || [];
    
    const productTitle = product.name?.toLowerCase() || "";
    const categoryName = product.category?.name?.toLowerCase() || "";
    const productMake = String((product as any).make_id || "").toLowerCase();

    // Check primary profile car
    if (user?.car_make) {
      const makeLower = user.car_make.toLowerCase();
      if (productTitle.includes(makeLower) || categoryName.includes(makeLower) || productMake.includes(makeLower)) {
        return { isCompatible: true, userCar: `${user.car_year || ""} ${user.car_make} ${user.car_model || ""}`.trim() };
      }
    }

    // Check all cars in vehicle list
    for (const car of cars) {
      if (car.make) {
        const makeLower = car.make.toLowerCase();
        if (productTitle.includes(makeLower) || categoryName.includes(makeLower) || productMake.includes(makeLower)) {
          return { isCompatible: true, userCar: `${car.year || ""} ${car.make} ${car.model || ""}`.trim() };
        }
      }
    }

    return { isCompatible: false, userCar: "" };
  }, [product, profileResponse, vehicles]);

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
        {/* Compatibility Banner */}
        {compatibilityInfo.isCompatible && (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            className="mx-4 mb-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex-row items-center"
          >
            <View className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center mr-3 shadow-sm shadow-emerald-200">
              <CheckCircleIconSolid size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-emerald-900 font-NunitoExtraBold text-sm">Fits Your Vehicle</Text>
              <Text className="text-emerald-700 font-NunitoMedium text-xs">Compatible with your {compatibilityInfo.userCar}</Text>
            </View>
          </Animated.View>
        )}

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
            merchantProfile={merchantProfileData?.data?.merchant_profile}
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

      <ProductActionBar
        isFavorite={product.is_in_favorite_list}
        showFavoriteSuccess={showFavoriteSuccess}
        isTogglingFavorite={toggleFavoriteMutation.isPending}
        onToggleFavorite={handleToggleFavorite}
        onCall={handleCall}
        onChat={handleChat}
      />

      <ContactSelectionModal
        visible={isContactModalVisible}
        onClose={() => setIsContactModalVisible(false)}
        onVoiceCall={performVoiceCall}
        onWhatsAppCall={performWhatsAppCall}
        phoneNumber={merchantProfileData?.data?.merchant_profile?.user?.phone_number ?? product?.contact_info?.phone ?? "N/A"}
        storeName={merchantProfileData?.data?.merchant_profile?.store_name ?? undefined}
      />
    </SafeAreaView>
  );
};

export default ProductDetail;
