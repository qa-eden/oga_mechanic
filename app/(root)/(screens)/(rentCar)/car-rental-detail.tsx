"use client";

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";

const { width: screenWidth } = Dimensions.get("window");
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CogIcon,
  FunnelIcon,
} from "react-native-heroicons/outline";
import { StarIcon as StarIconSolid } from "react-native-heroicons/solid";
import { FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { productsAPI } from "@/lib/api/products";

interface CarRentalDetails {
  id: string;
  name: string;
  year: string;
  brand: string;
  model: string;
  image: any;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  seats: number;
  doors: number;
  color: string;
  location: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  features: string[];
  insurance: {
    included: boolean;
    coverage: string;
    deductible: number;
  };
  owner: {
    name: string;
    phone: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
  };
  pickupLocation: string;
  returnLocation: string;
  minimumRentalDays: number;
  maximumRentalDays: number;
  cancellationPolicy: string;
}

const CarRentalDetail = () => {
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for API data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [merchantData, setMerchantData] = useState<any>(null);

  // Get product ID from params
  const productId = params.carId as string;

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getProductById(productId);
        setProductData(response.data);
        console.log('Fetched product details:', response.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Extract merchant data from product data (merchant info is embedded in the product response)
  useEffect(() => {
    if (productData) {
      // Create merchant object from the embedded merchant fields in product data
      const merchantInfo = {
        id: productData.merchant_id,
        email: productData.merchant_email,
        rating: productData.merchant_rating,
        // Note: Full merchant profile details (business_name, phone_number, etc.)
        // are not included in the products API response
      };
      setMerchantData(merchantInfo);
      console.log('🏪 Extracted merchant data from product:', merchantInfo);
    }
  }, [productData]);

  // Transform API data to CarRentalDetails format
  const transformProductToCarData = (product: any, merchant: any): CarRentalDetails => {
    // Build features array from API boolean fields
    const features = [];
    if (product.air_conditioning) features.push("Air Conditioning");
    if (product.bluetooth) features.push("Bluetooth");
    if (product.navigation_system) features.push("GPS Navigation");
    if (product.cruise_control) features.push("Cruise Control");
    if (product.leather_seats) features.push("Leather Seats");
    if (product.sunroof) features.push("Sunroof");
    if (product.keyless_entry) features.push("Keyless Entry");
    if (product.parking_sensors) features.push("Parking Sensors");
    if (product.lane_assist) features.push("Lane Assist");
    if (product.blind_spot_monitor) features.push("Blind Spot Monitor");
    if (product.traction_control) features.push("Traction Control");
    if (product.abs) features.push("ABS");
    if (product.airbags) features.push("Airbags");
    if (product.alloy_wheels) features.push("Alloy Wheels");

    return {
      id: product.id,
      name: product.name,
      year: product.year?.toString(),
      brand: product.make,
      model: product.model,
      image: product.images?.[0]?.image,
      pricePerDay: parseFloat(product.price),
      pricePerWeek: parseFloat(product.price),
      pricePerMonth: parseFloat(product.price),
      mileage: product.mileage,
      fuelType: product.fuel_type?.charAt(0).toUpperCase() + product.fuel_type?.slice(1),
      transmission: product.transmission?.charAt(0).toUpperCase() + product.transmission?.slice(1),
      seats: product.number_of_seats,
      doors: product.number_of_doors,
      color: product.exterior_color,
      location: product.location,
      rating: product.rating,
      reviewCount: product.review_count,
      isAvailable: product.availability === "in_stock",
      features: features,
      insurance: {
        included: product.insurance_included,
        coverage: product.insurance_coverage,
        deductible: product.insurance_deductible,
      },
      owner: {
        name: merchant?.email?.split('@')[0] || 'Car Owner', // Use email username as fallback
        phone: merchant?.phone_number,
        avatar: merchant?.profile_picture,
        rating: merchant?.rating || product.merchant_rating,
        reviewCount: merchant?.review_count,
        responseTime: merchant?.response_time,
      },
      pickupLocation: product.pickup_location,
      returnLocation: product.return_location,
      minimumRentalDays: product.min_rental_days,
      maximumRentalDays: product.max_rental_days,
      cancellationPolicy: product.cancellation_policy,
    };
  };

  // Use only API data - no fallback to mock data
  const carData: CarRentalDetails | null = productData ? transformProductToCarData(productData, merchantData) : null;

  // Multiple car images for carousel - use API images if available
  const carImages = productData?.images?.length > 0
    ? productData.images.map((img: any) => img.image)
    : carData?.image ? [carData.image] : [];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1));
  };

  const handleContactNow = () => {
    if (!carData) return;
    const phoneNumber = carData.owner.phone.replace(/\s/g, "");
    const url = `tel:+234${phoneNumber.substring(1)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        className="border-b border-gray-100"
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <BackArrowBtn />
          <View className="flex-1 items-center">
            <Text className="text-xl font-NunitoBold text-gray-900">
              Car Rental
            </Text>
            <Text className="text-sm text-gray-500 font-NunitoMedium">
              Vehicle Details
            </Text>
          </View>
          <View className="w-6" />
        </View>
      </LinearGradient>

      {/* Loading State */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-NunitoMedium text-gray-600">Loading car details...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-lg font-NunitoBold text-red-600 mb-2">Error</Text>
          <Text className="text-base font-NunitoMedium text-gray-600 text-center">{error}</Text>
        </View>
      )}

      {/* No Data State */}
      {!loading && !error && !carData && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-lg font-NunitoBold text-gray-600 mb-2">No Data</Text>
          <Text className="text-base font-NunitoMedium text-gray-600 text-center">Car details not found</Text>
        </View>
      )}

      {/* Content */}
      {!loading && !error && carData && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Car Info */}
        <View className="px-5 pt-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-NunitoExtraBold text-gray-900">
                {carData.brand} {carData.model}
              </Text>
              <Text className="text-lg font-NunitoMedium text-gray-600">
                {carData.year}
              </Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center mb-1">
                <StarIconSolid size={16} color="#F59E0B" />
                <Text className="text-sm font-NunitoBold text-gray-700 ml-1">
                  {carData.rating} ({carData.reviewCount})
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-full ${
                  carData.isAvailable ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Text
                  className={`text-xs font-NunitoBold ${
                    carData.isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {carData.isAvailable ? "Available" : "Unavailable"}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <MapPinIcon size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 font-NunitoMedium ml-1">
              {carData.location}
            </Text>
          </View>
        </View>

        {/* Car Image Carousel */}
        <View className="px-5 mb-8">
          <View className="relative">
            <FlatList
              data={carImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / (screenWidth - 40)
                );
                setCurrentImageIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <View
                  className="bg-gray-50 rounded-2xl overflow-hidden items-center justify-center"
                  style={{ width: screenWidth - 40 }}
                >
                  {typeof item === 'string' ? (
                    <Image
                      source={{ uri: item }}
                      style={{ width: 300, height: 280 }}
                      resizeMode="cover"
                    />
                  ) : (
                    React.createElement(item, { width: 300, height: 280 })
                  )}
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
            />

            {/* Image Navigation */}
            {carImages.length > 1 && (
              <View className="flex-row items-center justify-center mt-4 space-x-4">
                <TouchableOpacity
                  onPress={handlePreviousImage}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <ChevronLeftIcon size={20} color="#6B7280" />
                </TouchableOpacity>

                {/* Image Indicators */}
                <View className="flex-row space-x-2">
                  {carImages.map((_: any, index: number) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex
                          ? "bg-primary-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleNextImage}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <ChevronRightIcon size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Section */}
        <View className="bg-gray-900 flex-1 rounded-t-3xl px-5 pt-6 pb-8">
          {/* Owner Info */}
          <View className="flex-row items-center mb-6">
            <View className="w-14 h-14 rounded-full overflow-hidden mr-4">
              <Image
                source={{ uri: carData.owner.avatar }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                }}
              />
            </View>

            <View className="flex-1">
              <Text className="text-xl font-NunitoBold text-white mb-1">
                {carData.owner.name}
              </Text>
              <View className="flex-row items-center">
                <PhoneIcon size={16} color="#9CA3AF" />
                <Text className="text-gray-300 font-NunitoMedium ml-2">
                  {carData.owner.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Overview */}
          <Text className="text-2xl font-NunitoBold text-white mb-4">
            Overview
          </Text>

          {/* Description */}
          {productData?.description && (
            <View className="mb-6">
              <Text className="text-lg font-NunitoBold text-white mb-2">Description</Text>
              <Text className="text-gray-300 font-NunitoMedium leading-6">
                {productData.description}
              </Text>
            </View>
          )}

          {/* Price */}
          <Text className="text-4xl font-NunitoExtraBold text-white mb-8">
            NGN {carData.pricePerDay.toLocaleString()}/day
          </Text>

          {/* Specifications */}
          <Text className="text-lg font-NunitoBold text-white mb-4">Specifications</Text>
          <View className="flex-row flex-wrap mb-6">
            {/* Transmission */}
            {carData.transmission && (
              <View className="w-1/2 pr-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <CogIcon size={16} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Transmission</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {carData.transmission}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Fuel Type */}
            {carData.fuelType && (
              <View className="w-1/2 pl-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <FunnelIcon size={16} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Fuel Type</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {carData.fuelType}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Seats */}
            {carData.seats && (
              <View className="w-1/2 pr-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <UserIcon size={16} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Seats</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {carData.seats} Seats
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Doors */}
            {carData.doors && (
              <View className="w-1/2 pl-2 mb-4">
              <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                  <Text className="text-white text-xs">�</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs font-NunitoMedium">Doors</Text>
                  <Text className="text-white font-NunitoBold text-sm">
                    {carData.doors} Doors
                  </Text>
                </View>
              </View>
            </View>
            )}

            {/* Exterior Color */}
            {carData.color && (
              <View className="w-1/2 pr-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <Text className="text-white text-xs">🎨</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Exterior Color</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {carData.color}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Interior Color */}
            {productData?.interior_color && (
              <View className="w-1/2 pl-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <Text className="text-white text-xs">🪑</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Interior Color</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {productData.interior_color}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Engine Size */}
            {productData?.engine_size && (
              <View className="w-1/2 pr-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <Text className="text-white text-xs">⚙️</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Engine Size</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {productData.engine_size}L
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Body Type */}
            {productData?.body_type && (
              <View className="w-1/2 pl-2 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                  <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                    <Text className="text-white text-xs">🚗</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs font-NunitoMedium">Body Type</Text>
                    <Text className="text-white font-NunitoBold text-sm">
                      {productData.body_type?.charAt(0).toUpperCase() + productData.body_type?.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Features */}
          {carData.features && carData.features.length > 0 && (
            <>
              <Text className="text-lg font-NunitoBold text-white mb-4">Features</Text>
              <View className="flex-row flex-wrap mb-8">
                {carData.features.map((feature, index) => (
                  <View key={index} className="bg-gray-800 rounded-xl px-3 py-2 mr-2 mb-2">
                    <Text className="text-white font-NunitoMedium text-sm">{feature}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Contact Button */}
          <TouchableOpacity
            onPress={handleContactNow}
            className="w-full py-4 bg-white rounded-2xl"
            activeOpacity={0.8}
          >
            <Text className="text-center font-NunitoBold text-primary-600 text-lg">
              Contact now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CarRentalDetail;