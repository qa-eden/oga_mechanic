import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Services as ServicesData } from "@/constants";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { LinearGradient } from "expo-linear-gradient";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { LAYOUT } from "@/constants/units";
import { useHomeProducts } from "@/hooks/useProducts";

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch home products to get category IDs
  const { data: homeProducts } = useHomeProducts();

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

  const categories = ["All", "Transport", "Maintenance", "Purchase", "Support"];

  const { SCROLL_PADDING_BOTTOM } = LAYOUT;

  const getServiceCategory = (serviceName: string) => {
    if (
      serviceName.includes("Ride") ||
      serviceName.includes("Tow") ||
      serviceName.includes("Rent")
    ) {
      return "Transport";
    } else if (
      serviceName.includes("parts") ||
      serviceName.includes("Specialist") ||
      serviceName.includes("Mechanic")
    ) {
      return "Maintenance";
    } else if (serviceName.includes("Buy")) {
      return "Purchase";
    } else {
      return "Support";
    }
  };

  const filteredServices = enhancedServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      getServiceCategory(service.name) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServicePress = (service: any) => {
    console.log("Service pressed:", service.name);
    // Navigate to specific service screen based on service type
    switch (service.name) {
      case "Order a Ride":
        router.push(routes.enterAddressForRide);
        break;
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
      case "Tow your car":
        router.push(routes.enterAddressForRide);
        break;
      case "Chat a Specialist":
        router.push(routes.chatSeller);
        break;
      case "Find a Mechanic":
        router.push(routes.findMechanic);
        break;
      case "My Mechanic Orders":
        router.push(routes.myMechanicOrders);
        break;
      default:
        console.log("Navigate to:", service.name);
    }
  };

  const renderServiceItem = ({ item }: { item: any }) => {
    const IconComponent = item.image;

    return (
      <TouchableOpacity
        onPress={() => handleServicePress(item)}
        style={{
          backgroundColor: item.bgColor,
          borderWidth: 1,
          borderColor: item.border,
          width: "48%",
          height: 160,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          alignItems: "flex-end",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        activeOpacity={0.8}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "flex-end",
            height: 80,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {typeof item.image === "function" ? (
            <item.image width={90} height={90} color="#555" />
          ) : (
            <Image
              source={
                typeof item.image === "string"
                  ? { uri: item.image }
                  : item.image
              }
              style={{ width: 90, height: 90, resizeMode: "contain" }}
            />
          )}
        </View>
        <Text
          style={{
            fontSize: 15,
            width: "100%",
            textAlign: "left",
            lineHeight: 20,
          }}
          className="font-NunitoBold text-[#101828]"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        className="border-b border-gray-100"
      >
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-NunitoExtraBold text-gray-900">
                Services
              </Text>
              <Text className="text-base text-gray-500 font-NunitoMedium">
                Explore all auto services
              </Text>
            </View>
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-primary-600 text-lg font-NunitoBold">
                🚗
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
            <MagnifyingGlassIcon size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search services..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full mr-3 border ${
                selectedCategory === category
                  ? "bg-primary-500 border-primary-500"
                  : "bg-white border-gray-300"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-NunitoBold text-sm ${
                  selectedCategory === category ? "text-white" : "text-gray-700"
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services Grid */}
      <View className="flex-1 px-5 py-4">
        {filteredServices.length > 0 ? (
          <FlatList
            data={filteredServices}
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
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              <MagnifyingGlassIcon size={40} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2">
              No services found
            </Text>
            <Text className="text-gray-500 text-center">
              {searchQuery
                ? "Try adjusting your search"
                : "No services available in this category"}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Services;
