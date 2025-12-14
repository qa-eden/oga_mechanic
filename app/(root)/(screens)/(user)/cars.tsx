"use client";

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  RefreshControl,
  Image
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { MagnifyingGlassIcon, PlusIcon, ArrowLeftIcon, FunnelIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/lib/api/user";
import LoadingSpinner from "@/components/LoadingSpinner";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const CarCard = ({ item, onPress }: { item: any, onPress: (car: any) => void }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => onPress(item)}
    className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4 flex-row items-center"
  >
    <View className="w-16 h-16 bg-primary-50 rounded-2xl items-center justify-center mr-4">
      {item.image ? (
        <Image source={{ uri: item.image }} className="w-full h-full rounded-2xl" resizeMode="cover" />
      ) : (
        <icons.car width={32} height={32} color="#D30309" />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-lg font-NunitoExtraBold text-gray-900 mb-1">
        {item.name}
      </Text>
      <View className="flex-row items-center">
         <View className="bg-gray-100 px-2 py-0.5 rounded mr-2">
            <Text className="text-xs font-NunitoBold text-gray-600">{item.year || 'N/A'}</Text>
         </View>
         <Text className="text-sm text-gray-400 font-NunitoMedium">
           {item.license_plate || 'No Plate'}
         </Text>
      </View>
    </View>
    <View className={`w-3 h-3 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
  </TouchableOpacity>
);

const Cars = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cars from API
  const {
    data: carsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userCars"],
    queryFn: userAPI.getCars,
    staleTime: 5 * 60 * 1000, 
    retry: 2,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle both array response and wrapped response
  const cars = Array.isArray(carsData) 
    ? carsData 
    : ((carsData as any)?.data || []);

  // Animation values for modal
  const slideY = useSharedValue(300);
  const opacity = useSharedValue(0);

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: slideY.value }],
  }));

  useEffect(() => {
    if (showFilterModal) {
      slideY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      slideY.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [showFilterModal]);

  const filterOptions = [
    { id: "all", label: "All", description: "Show all cars" },
    { id: "active", label: "Active", description: "Active vehicles only" },
    {
      id: "inactive",
      label: "Inactive",
      description: "Inactive vehicles only",
    },
  ];

  const filteredCars = cars.filter((car: any) => {
    const matchesSearch =
      car?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car?.vin?.includes(searchQuery);
    const matchesFilter =
      selectedFilter === "All" || car?.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddCar = () => {
    router.push(routes.addCar);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
  };

  const handleCarPress = (car: any) => {
    // Navigate to car detail screen
    router.push({
      pathname: routes?.carDetails,
      params: {
        carId: car.id,
        carName: car.name,
        carYear: car.year,
      },
    });
  };

  const renderCarCard = ({ item }: { item: any }) => (
    <CarCard item={item} onPress={handleCarPress} />
  );

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
          >
            <ArrowLeftIcon size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-NunitoExtraBold text-gray-900">
            My Cars
          </Text>
        </View>
        <LoadingSpinner
          message="Loading your cars..."
          subMessage="Please wait while we fetch your vehicles"
          size="medium"
        />
      </SafeAreaView>
    );
  }

  // Show error state with headers
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <ArrowLeftIcon size={20} color="#1F2937" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-NunitoExtraBold text-gray-900">
                My Cars
              </Text>
              <Text className="text-base text-gray-500">0 cars</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddCar}
            className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center"
          >
            <PlusIcon size={24} color="#D30309" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View className="px-5 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            {/* Search Bar */}
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mr-3">
              <MagnifyingGlassIcon/>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
              />
            </View>

            {/* Filter Button */}
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              className="px-4 py-3 bg-primary-50 rounded-xl flex-row items-center border border-primary-200"
            >
              <View className="w-4 h-4 mr-2">
                <View className="w-full h-0.5 bg-primary-500 mb-1" />
                <View className="w-3 h-0.5 bg-primary-500 mb-1" />
                <View className="w-full h-0.5 bg-primary-500" />
              </View>
              <Text className="text-primary-500 font-NunitoBold">Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        <View className="flex-1 justify-center items-center px-5">
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
            <icons.car width={40} height={40} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-NunitoBold text-gray-900 mb-2">
            Unable to load cars
          </Text>
          <Text className="text-gray-500 text-center">
            Please try again later
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <ArrowLeftIcon size={20} color="#1F2937" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-NunitoExtraBold text-gray-900">
              My Cars
            </Text>
            <Text className="text-base text-gray-500">{cars.length} cars</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddCar}
          className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center"
        >
          <PlusIcon size={24} color="#D30309" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mr-3">
            <MagnifyingGlassIcon/>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
            />
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="px-4 py-3 bg-primary-50 rounded-xl flex-row items-center border border-primary-200"
          >
            <View className="w-4 h-4 mr-2">
              <View className="w-full h-0.5 bg-primary-500 mb-1" />
              <View className="w-3 h-0.5 bg-primary-500 mb-1" />
              <View className="w-full h-0.5 bg-primary-500" />
            </View>
            <Text className="text-primary-500 font-NunitoBold">Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cars Grid */}
      <View className="flex-1 px-5 py-4">
        {filteredCars.length > 0 ? (
          <FlatList
            data={filteredCars}
            renderItem={renderCarCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#D30309']}
                tintColor="#D30309"
              />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              <icons.car width={40} height={40} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2">
              No cars found
            </Text>
            <Text className="text-gray-500 text-center">
              {searchQuery
                ? "Try adjusting your search"
                : "Add your first car to get started"}
            </Text>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View className="flex-1 justify-start items-end pt-32 pr-5">
            <Animated.View
              style={animatedModalStyle}
              className="bg-white rounded-3xl p-2 w-64 shadow-2xl"
            >
              {/* Header */}
              <View className="px-4 py-3 border-b border-gray-100">
                <Text className="text-lg font-NunitoExtraBold text-gray-900 text-center">
                  Filter Cars
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1">
                  Choose your filter
                </Text>
              </View>

              {/* Filter Options */}
              <View className="py-2">
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleFilterSelect(option.label)}
                    className={`flex-row items-center justify-between py-4 px-4 mx-2 rounded-xl mb-1 ${
                      selectedFilter === option.label
                        ? "bg-primary-50 border border-primary-200"
                        : "bg-transparent"
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-1">
                      <Text
                        className={`font-NunitoBold text-base ${
                          selectedFilter === option.label
                            ? "text-primary-600"
                            : "text-gray-800"
                        }`}
                      >
                        {option.label}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </Text>
                    </View>

                    {selectedFilter === option.label && (
                      <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-NunitoBold">
                          ✓
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Footer */}
              <View className="px-4 py-3 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => setShowFilterModal(false)}
                  className="py-3 px-4 bg-gray-100 rounded-xl"
                  activeOpacity={0.7}
                >
                  <Text className="text-center font-NunitoBold text-gray-600">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default Cars;
