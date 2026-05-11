import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,

  Image,
  RefreshControl,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Services as ServicesData } from "@/constants";
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
import EmptyState from "@/components/EmptyState";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown
} from "react-native-reanimated";

const ServiceCard = ({ item, index, onPress }: { item: any; index: number; onPress: () => void }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 60).duration(400).springify()}
      style={[{ width: "48.5%", marginBottom: 12 }, animatedStyle]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          height: 160,
          borderRadius: 24,
          backgroundColor: '#fff',
          shadowColor: item.border,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 5,
        }}
        activeOpacity={1}
      >
        <LinearGradient
          colors={[item.bgColor, '#ffffff', '#ffffff']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 24,
            padding: 16,
            borderWidth: 1.5,
            borderColor: item.border,
            justifyContent: "space-between",
          }}
        >
          {/* Icon Container */}
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              marginTop: -6,
              marginRight: -6,
            }}
          >
            {typeof item.image === "function" ? (
              <item.image width={item.isSmall ? 65 : 85} height={item.isSmall ? 65 : 85} />
            ) : (
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : item.image
                }
                style={{ 
                  width: item.isSmall ? 65 : 85, 
                  height: item.isSmall ? 65 : 85, 
                  resizeMode: "contain" 
                }}
              />
            )}
          </View>

          {/* Text Content */}
          <View style={{ width: "100%" }}>
            <Text
              style={{
                fontSize: 17,
                lineHeight: 22,
                color: "#1F2937",
                width: "95%",
                letterSpacing: -0.3,
              }}
              numberOfLines={2}
              className="font-NunitoExtraBold"
            >
              {item.name}
            </Text>
            {/* Subtle indicator bar */}
            <View style={{ 
              width: 20, 
              height: 4, 
              backgroundColor: item.border, 
              borderRadius: 2, 
              marginTop: 6,
              opacity: 0.5
            }} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
      case "Buy spare parts": {
        const catId = (sparePartCategoryId || 24);
        const catName = homeProducts?.data?.best_selling_spare_parts?.[0]?.category?.name || 'Spare Part';
        router.push(`${routes.shop}?categoryId=${catId}&category=${encodeURIComponent(catName)}`);
        break;
      }
      case "Buy a Car": {
        const catId = (carCategoryId || 23);
        const catName = homeProducts?.data?.best_selling_cars?.[0]?.category?.name || 'Car';
        router.push(`${routes.shop}?categoryId=${catId}&category=${encodeURIComponent(catName)}`);
        break;
      }
      case "Vehicle Rental":
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
                renderItem={({ item, index }) => (
                  <ServiceCard 
                    item={item} 
                    index={index} 
                    onPress={() => handleServicePress(item)} 
                  />
                )}
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
              <EmptyState 
                title="No services found"
                description="We couldn't load any services at the moment. Please try refreshing or checking back later."
                actionLabel="Refresh Now"
                onAction={onRefresh}
              />
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
