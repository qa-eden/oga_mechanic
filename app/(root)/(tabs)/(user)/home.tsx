import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,

  Image,
  RefreshControl,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Services as ServicesData, Ads } from "@/constants";
import AdsComponents from "@/components/AdsComponents";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { LinearGradient } from "expo-linear-gradient";
import Navbar from "@/components/Navbar";
import { LAYOUT } from "@/constants/units";
import { useHomeProducts, useActiveBiddingProducts } from "@/hooks/useProducts";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";
import BiddingCarousel from "@/components/bidding/BiddingCarousel";
import SpecialistIconBtn from "@/components/SpecialistIconBtn";
import SwitchUserModal from "@/components/modals/SwitchUserModal";
import VINSearchModal from "@/components/modals/VINSearchModal";

const Home = () => {

  const [refreshing, setRefreshing] = useState(false);
  const [isSwitchRoleVisible, setIsSwitchRoleVisible] = useState(false);
  const [isVinSearchVisible, setIsVinSearchVisible] = useState(false);

  // Fetch home products to get category IDs
  const { data: homeProducts, refetch: refetchHomeProducts } = useHomeProducts();
  const { data: activeBiddingRes, refetch: refetchActiveBidding } = useActiveBiddingProducts();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchHomeProducts(),
      refetchActiveBidding()
    ]);
    setRefreshing(false);
  };

  // Extract category IDs from the actual products
  const carCategoryId = homeProducts?.data?.best_selling_cars?.[0]?.category?.id;
  const sparePartCategoryId = homeProducts?.data?.best_selling_spare_parts?.[0]?.category?.id;

  // Enhanced services data with additional information
  const enhancedServices = ServicesData.map((service) => ({
    ...service,
    rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
    reviewCount: Math.floor(Math.random() * 100) + 20, // Random review count
    estimatedTime: Math.floor(Math.random() * 30) + 15, // Random time in minutes
    isPopular: Math.random() > 0.7, // 30% chance of being popular
  }));

  const { SCROLL_PADDING_BOTTOM } = LAYOUT;

  const handleServicePress = (service: any) => {
    console.log("Service pressed:", service.name);
    // Navigate to specific service screen based on service type
    switch (service.name) {
      case "Service Provider":
        setIsSwitchRoleVisible(true);
        break;
      // case "Order a Ride":
      //   router.push(routes.enterAddressForRide);
      //   break;
      case "Buy spare parts":
        if (sparePartCategoryId) {
          router.push({
            pathname: routes.shop,
            params: {
              category: homeProducts?.data?.best_selling_spare_parts?.[0]?.category?.name || 'Spare Part',
              categoryId: sparePartCategoryId.toString(),
            }
          });
        } else {
          router.push(routes.shop);
        }
        break;
      case "Buy a Car":
        if (carCategoryId) {
          router.push({
            pathname: routes.shop,
            params: {
              category: homeProducts?.data?.best_selling_cars?.[0]?.category?.name || 'Car',
              categoryId: carCategoryId.toString(),
            }
          });
        } else {
          router.push(routes.cars);
        }
        break;
      case "Rent a car":
        router.push(routes.rentACar);
        break;
      // case "Tow your car":
      //   router.push(routes.enterAddressForRide);
      //   break;
      case "Chat a Specialist":
        router.push(routes.supportSuggestions as any);
        break;
      case "Find a Mechanic":
        router.push(routes.findMechanic);
        break;
      case "My Mechanic Orders":
        router.push(routes.myMechanicOrders);
        break;
      case "VIN Search":
        setIsVinSearchVisible(true);
        break;
      default:
        console.log("Navigate to:", service.name);
    }
  };

  const renderServiceItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => handleServicePress(item)}
        style={{
          width: "48.5%",
          height: 160, // Slightly taller for elegance
          borderRadius: 24, // Super smooth
          marginBottom: 12, // Balanced gap
          // BEAUTIFUL GLOWING SHADOW
          shadowColor: item.border, // Use the card's own accent color for shadow
          shadowOffset: { width: 0, height: 4 }, // Reduced offset
          shadowOpacity: 0.1, // Much softer (was 0.25)
          shadowRadius: 10, // Tighter radius (was 16)
          elevation: 4, // Reduced elevation (was 8)
          backgroundColor: '#fff' 
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[item.bgColor, '#ffffff', '#ffffff']} // Smoother fade
          locations={[0, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: item.border, // Crisp border matching shadow
            justifyContent: "space-between",
          }}
        >
          {/* Icon Container - Floating Effect */}
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              marginTop: -5, // Slight overlap for dynamic feel
              marginRight: -5,
            }}
          >
            {typeof item.image === "function" ? (
              <item.image width={85} height={85} />
            ) : (
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : item.image
                }
                style={{ width: 85, height: 85, resizeMode: "contain" }}
              />
            )}
          </View>

          {/* Text Content - Clear & Bold */}
          <View style={{ width: "100%" }}>
            <Text
              style={{
                fontSize: 17, // Larger, more readable
                lineHeight: 22,
                color: "#1F2937",
                width: "95%",
                letterSpacing: -0.2,
              }}
              numberOfLines={2}
              className="font-NunitoExtraBold"
            >
              {item.name}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar />
      {/* Enhanced Header */}
      
      {/* Floating Chat Specialist */}
      <View style={{ position: 'absolute', bottom: 170, right: 24, zIndex: 1000 }}>
        <SpecialistIconBtn isFloating={true} />
      </View>
      
      {/* Navbar */}
      <View className="px-4">
        <Navbar />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D30309"]} tintColor="#D30309" />
        }
      >
        <AnimatedPageContainer animationType="fadeInDown" duration={500}>
          {/* Enhanced Ads Section using standard Bidding Carousel */}
          <BiddingCarousel />

          {/* Services Grid */}
          <View className="flex-1 px-4 mt-6">
            {enhancedServices.length > 0 ? (
              <FlatList
                scrollEnabled={false} // Disable internal scrolling since we wrapped in ScrollView
                data={enhancedServices}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: SCROLL_PADDING_BOTTOM,
                }}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={true}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-xl font-NunitoBold text-gray-900 mb-2">No services found</Text>
              </View>
            )}
          </View>
        </AnimatedPageContainer>
      </ScrollView>

      {/* Switch Role Modal */}
      <SwitchUserModal 
        isVisible={isSwitchRoleVisible} 
        onClose={() => setIsSwitchRoleVisible(false)} 
        onSwitchUser={() => {}}
      />

      {/* VIN Search Modal */}
      <VINSearchModal
        isVisible={isVinSearchVisible}
        onClose={() => setIsVinSearchVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Home;
