"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  StatusBar,
  Linking,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { 
  ChevronLeftIcon, 
  MapPinIcon, 
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  StarIcon as StarIconOutline,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "react-native-heroicons/outline";
import { StarIcon as StarIconSolid } from "react-native-heroicons/solid";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  FadeInDown, 
  FadeIn,
  interpolate,
  useAnimatedScrollHandler
} from "react-native-reanimated";
import { productsAPI } from "@/lib/api/products";
import { userAPI } from "@/lib/api/user";
import { communicationsAPI } from "@/lib/api/communications";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import LoadingSpinner from "@/components/LoadingSpinner";
import BackArrowBtn from "@/components/BackArrowBtn";
import ContactSelectionModal from "@/components/modals/ContactSelectionModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.45;

const SpecItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
  <View className="flex-row items-center bg-gray-50/80 px-4 py-3 rounded-2xl mb-3 border border-gray-100/50" style={{ width: (SCREEN_WIDTH - 52) / 2 }}>
    <View className="w-9 h-9 bg-white rounded-xl items-center justify-center shadow-sm">
      <Icon size={18} color="#D30309" />
    </View>
    <View className="ml-3 flex-1">
      <Text className="text-[10px] font-NunitoBold text-gray-400 uppercase tracking-wider">{label}</Text>
      <Text className="text-[13px] font-NunitoExtraBold text-gray-900" numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const CarRentalDetail = () => {
  const params = useLocalSearchParams();
  const productId = params.carId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1]);
    return {
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderBottomWidth: scrollY.value > 100 ? 1 : 0,
      borderBottomColor: '#F3F4F6',
    };
  });

  const headerTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 150], [0, 1]);
    return { opacity };
  });

  const fetchDetails = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await productsAPI.getProductById(productId);
      setProductData(res.data);
      
      if (res.data.merchant_id) {
        const mRes = await userAPI.getMerchantProfileByUuid(res.data.merchant_id);
        setMerchantData(mRes.data?.merchant_profile);
      }
    } catch (err) {
      setError("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const isUtility = useMemo(() => {
    const type = productData?.body_type?.toLowerCase();
    return type === 'van' || type === 'truck';
  }, [productData]);

  const carImages = useMemo(() => {
    if (!productData?.images?.length) return [productData?.image || 'https://via.placeholder.com/800x600?text=No+Image'];
    return productData.images.map((img: any) => img.image);
  }, [productData]);

  const performVoiceCall = useCallback(() => {
    const phone = merchantData?.user?.phone_number || productData?.merchant_phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Error", "Phone number not available");
    }
  }, [merchantData, productData]);

  const performWhatsAppCall = useCallback(() => {
    const phone = merchantData?.user?.phone_number || productData?.merchant_phone;
    if (!phone) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    const cleanedNumber = phone.replace(/\D/g, '');
    const message = `Hi, I'm interested in your ${productData.name} listed on Oga Mechanic. Is it available for rental?`;
    const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert("Error", "WhatsApp is not installed on this device");
      }
    });
  }, [merchantData, productData]);

  const handleChat = useCallback(async () => {
    if (!productData) return;

    try {
      const sellerUserId = merchantData?.user?.id || productData.merchant_id;

      if (!sellerUserId) {
        Alert.alert("Error", "Could not find owner information.");
        return;
      }

      const roomsResponse = await communicationsAPI.getChatRooms();
      const rooms = roomsResponse?.results?.data || [];
      
      const existingRoom = rooms.find((room: any) => 
        room.participants?.some((p: any) => p.id === sellerUserId) ||
        room.other_participant?.id === sellerUserId
      );

      let roomId: string;

      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
        const createResponse = await communicationsAPI.createChatRoom([sellerUserId]);
        if (createResponse.status && createResponse.data) {
          roomId = createResponse.data.id;
        } else {
          Alert.alert("Error", "Could not start chat. Please try again.");
          return;
        }
      }

      router.push({
        pathname: "/(root)/(screens)/(user)/chat-room",
        params: {
          roomId: roomId,
          participantName: merchantData?.user?.first_name || "Owner",
          participantAvatar: merchantData?.profile_picture || "",
        }
      });
    } catch (error) {
      Alert.alert("Error", "Failed to connect with owner.");
    }
  }, [productData, merchantData]);

  if (loading) return (
    <View className="flex-1 bg-white items-center justify-center">
      <LoadingSpinner message="Refining details..." />
    </View>
  );

  if (error || !productData) return (
    <View className="flex-1 bg-white items-center justify-center px-10">
      <InformationCircleIcon size={64} color="#D1D5DB" />
      <Text className="text-xl font-NunitoExtraBold text-gray-900 mt-4 text-center">Something went wrong</Text>
      <Text className="text-sm font-NunitoMedium text-gray-500 mt-2 text-center">{error || "Vehicle details not found"}</Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-primary-500 px-8 py-3 rounded-full">
        <Text className="text-white font-NunitoBold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Immersive Sticky Header */}
      <Animated.View 
        style={headerStyle}
        className="absolute top-0 left-0 right-0 z-50 pt-12 pb-4 px-5 flex-row items-center justify-between"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm border border-gray-100"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Animated.View style={headerTextStyle} className="flex-1 items-center">
          <Text className="text-base font-NunitoExtraBold text-gray-900" numberOfLines={1}>
            {productData.name}
          </Text>
        </Animated.View>
        
        <View className="w-10 h-10 items-center justify-center bg-white/90 rounded-full shadow-sm border border-gray-100">
           <InformationCircleIcon size={22} color="#1F2937" />
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Full Screen Carousel */}
        <View style={{ height: HEADER_IMAGE_HEIGHT }}>
          <FlatList
            data={carImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setCurrentImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
            }}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: HEADER_IMAGE_HEIGHT }} className="bg-gray-100 items-center justify-center">
                {/* Blurred Background Layer for "Fill" effect */}
                <Image
                  source={{ uri: item }}
                  className="absolute w-full h-full opacity-30"
                  blurRadius={15}
                  resizeMode="cover"
                />
                
                <Image 
                  source={{ uri: item }} 
                  className="w-full h-full" 
                  resizeMode="contain" // Ensure full visibility as requested
                />
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
          />
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,1)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }}
          />
          
          {/* Pagination Indicators Overlay */}
          <View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-1.5">
            {carImages.map((_: string, i: number) => (
              <View key={i} className={`h-1 rounded-full ${i === currentImageIndex ? 'w-6 bg-primary-500' : 'w-2 bg-white/80'}`} />
            ))}
          </View>
        </View>

        {/* Content Card */}
        <View className="bg-white px-5 pt-2 pb-10" style={{ marginTop: -20, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
          
          <Animated.View entering={FadeInDown.delay(200)}>
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-4">
                <Text className="text-3xl font-NunitoExtraBold text-gray-900" numberOfLines={2}>
                  {productData.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MapPinIcon size={14} color="#6B7280" />
                  <Text className="text-sm font-NunitoBold text-gray-500 ml-1">{productData.location || "Lagos, Nigeria"}</Text>
                </View>
              </View>
              <View className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                <Text className="text-[10px] font-NunitoExtraBold text-green-600 uppercase tracking-tighter">Available</Text>
              </View>
            </View>

            {/* Ratings Summary */}
            <View className="flex-row items-center mt-2 mb-6">
              <View className="flex-row mr-2">
                {[1,2,3,4,5].map(i => <StarIconSolid key={i} size={14} color={i <= (productData.rating || 5) ? "#F59E0B" : "#D1D5DB"} />)}
              </View>
              <Text className="text-sm font-NunitoBold text-gray-900">{productData.rating || "5.0"}</Text>
              <Text className="text-sm font-NunitoMedium text-gray-400 ml-1">({productData.review_count || 0} reviews)</Text>
            </View>

            {/* Specifications Grid */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoExtraBold text-gray-900">Specifications</Text>
              {isUtility && (
                <View className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                  <Text className="text-[10px] font-NunitoExtraBold text-blue-600 uppercase">Heavy Duty</Text>
                </View>
              )}
            </View>

            <View className="flex-row flex-wrap justify-between">
              {productData.year && <SpecItem icon={CalendarIcon} label="Year" value={productData.year} />}
              <SpecItem icon={CheckCircleIcon} label="Transmission" value={productData.transmission || "Auto"} />
              <SpecItem icon={CheckCircleIcon} label="Fuel" value={productData.fuel_type || "Petrol"} />
              
              {!isUtility && productData.number_of_seats && (
                <SpecItem icon={UserGroupIcon} label="Capacity" value={`${productData.number_of_seats} Seats`} />
              )}
              
              {!isUtility && productData.number_of_doors && (
                <SpecItem icon={CheckCircleIcon} label="Doors" value={`${productData.number_of_doors} Doors`} />
              )}

              {productData.engine_size && (
                <SpecItem icon={CheckCircleIcon} label="Engine" value={`${productData.engine_size}L`} />
              )}

              {isUtility && (
                <SpecItem icon={CheckCircleIcon} label="Service" value="Utility / Logistics" />
              )}
            </View>

            {/* Description Section */}
            <View className="mt-6">
              <Text className="text-lg font-NunitoExtraBold text-gray-900 mb-3">Vehicle Overview</Text>
              <Text className="text-sm font-NunitoMedium text-gray-500 leading-6">
                {productData.description || "Experience pure luxury and performance with this meticulously maintained vehicle. Perfect for executive travel, family trips, or making a grand entrance at your next event."}
              </Text>
            </View>

            {/* Merchant / Owner Section */}
            <View className="mt-10 mb-6 bg-gray-50 rounded-3xl p-5 border border-gray-100">
               <Text className="text-sm font-NunitoExtraBold text-gray-400 uppercase tracking-widest mb-4">Service Provider</Text>
               <View className="flex-row items-center">
                  <View className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                    <Image 
                      source={{ uri: merchantData?.profile_picture || 'https://via.placeholder.com/150' }} 
                      className="w-full h-full"
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-NunitoExtraBold text-gray-900">
                      {merchantData?.user?.first_name} {merchantData?.user?.last_name}
                    </Text>
                    <Text className="text-xs font-NunitoBold text-primary-500 mt-1">Verified Partner • Response: {'<'}1hr</Text>
                  </View>
                  <TouchableOpacity 
                    className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-gray-100"
                    onPress={handleChat}
                  >
                    <ChatBubbleBottomCenterTextIcon size={22} color="#D30309" />
                  </TouchableOpacity>
               </View>
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Sticky Pricing Footer */}
      <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-100 px-5 pt-4 pb-2">
         <View className="flex-row items-center justify-between">
            <View>
               <Text className="text-xs font-NunitoBold text-gray-400">Rental Price</Text>
               <View className="flex-row items-baseline">
                  <NairaCurrency value={productData.price} className="text-2xl font-NunitoExtraBold text-gray-900" />
                  <Text className="text-sm font-NunitoBold text-gray-400 ml-1">/day</Text>
               </View>
            </View>
            <TouchableOpacity 
              onPress={() => setIsContactModalVisible(true)}
              className="bg-primary-500 px-10 py-4 rounded-2xl shadow-lg shadow-primary-200"
              activeOpacity={0.8}
            >
              <Text className="text-white font-NunitoExtraBold text-base">Book Now</Text>
            </TouchableOpacity>
         </View>
      </SafeAreaView>

      <ContactSelectionModal
        visible={isContactModalVisible}
        onClose={() => setIsContactModalVisible(false)}
        phoneNumber={merchantData?.user?.phone_number || productData?.merchant_phone || "+234 000 000 0000"}
        onVoiceCall={performVoiceCall}
        onWhatsAppCall={performWhatsAppCall}
        storeName={merchantData?.user?.first_name ? `${merchantData.user.first_name} ${merchantData.user.last_name || ''}` : "Service Provider"}
      />
    </View>
  );
};

export default CarRentalDetail;