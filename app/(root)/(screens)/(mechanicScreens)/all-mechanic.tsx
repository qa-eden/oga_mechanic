"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";
import { useCallback } from "react";
import MechanicCard from "@/components/cards/MechanicCard";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useGetAvailableMechanics } from "@/hooks/useMechanics";

const { width: screenWidth } = Dimensions.get("window");

interface Mechanic {
  id: number;
  userId: string;
  name: string;
  rating: number;
  reviewCount: number;
  image: string | null;
  isVip?: boolean;
  specialization?: string;
  location?: string;
  isOnline?: boolean;
}

const AllMechanic = () => {
  const [activeTab, setActiveTab] = useState("Mechanics");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch available mechanics from API
  const { 
    data: mechanicsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetAvailableMechanics();

  // Transform API data to local format
  const mechanics: Mechanic[] = (() => {
    try {
      if (!mechanicsData?.data) {
        return [];
      }
      
      if (!Array.isArray(mechanicsData.data)) {
        return [];
      }
      
      return mechanicsData.data.map((mechanic: any) => ({
        id: mechanic.id || 0,
        userId: mechanic.user?.id || '', // Add user.id for navigation
        name: mechanic.user ? `${mechanic.user.first_name} ${mechanic.user.last_name}`.trim() : `Mechanic ${mechanic.id}`,
        rating: mechanic.rating || 0, // Use rating from API
        reviewCount: 0, // Not provided in API response
        image: mechanic.selfie || null, // Use selfie URL from API
        specialization: 'General Repair', // Not provided in API response
        location: mechanic.location || 'Location not available', // Use location from API
        isOnline: mechanic.is_approved || false,
        isVip: false, // Not provided in API response
      }));
    } catch (error) {
      return [];
    }
  })();

  const filteredMechanics = mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMechanicPress = (mechanic: Mechanic) => {
    router.push({
      pathname: routes.mechanicProfile,
      params: {
        mechanicId: mechanic.userId, // Use user.id instead of mechanic id
        mechanicName: mechanic.name,
        mechanicRating: mechanic.rating,
        mechanicImage: mechanic.image,
      },
    });
  };

  const cardWidth = (screenWidth - 60) / 2;

  const renderMechanicCard = useCallback(
    ({ item }: { item: Mechanic }) => (
      <MechanicCard item={item} onPress={handleMechanicPress} cardWidth={cardWidth} />
    ),
    [handleMechanicPress, cardWidth]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
          All Mechanics
        </Text>
       <View className="w-8" />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white px-5 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab("Mechanics")}
          className={`flex-1 py-3 rounded-lg mr-2 ${
            activeTab === "Mechanics" ? "bg-primary-500" : "bg-gray-100"
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-center font-NunitoBold text-base ${
              activeTab === "Mechanics" ? "text-white" : "text-gray-600"
            }`}
          >
            Mechanics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("All orders")}
          className={`flex-1 py-3 rounded-lg ml-2 ${
            activeTab === "All orders" ? "bg-primary-500" : "bg-gray-100"
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-center font-NunitoBold text-base ${
              activeTab === "All orders" ? "text-white" : "text-gray-600"
            }`}
          >
            All orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
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

        <TouchableOpacity
          onPress={() => setShowFilter(!showFilter)}
          className="bg-red-50 rounded-xl px-4 py-3 flex-row items-center"
          activeOpacity={0.8}
        >
          <View className="w-4 h-4 mr-2">
            <View className="w-full h-0.5 bg-primary-500 mb-1" />
            <View className="w-3 h-0.5 bg-primary-500 mb-1" />
            <View className="w-full h-0.5 bg-primary-500" />
          </View>
          <Text className="text-primary-500 font-NunitoBold text-sm">
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "Mechanics" ? (
          <>
            {/* Loading State */}
            {isLoading && (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#D30309" />
                <Text className="text-gray-600 mt-4">Loading mechanics...</Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View className="flex-1 items-center justify-center px-5">
                <Text className="text-red-500 text-center text-lg mb-4">
                  Failed to load mechanics
                </Text>
                <TouchableOpacity
                  onPress={() => refetch()}
                  className="bg-primary-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-NunitoBold">Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredMechanics.length === 0 && (
              <View className="flex-1 justify-center items-center px-5">
                <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
                  <Text className="text-4xl">🔧</Text>
                </View>
                <Text className="text-xl font-NunitoBold text-gray-900 mb-2 text-center">
                  No mechanics found
                </Text>
                <Text className="text-gray-500 text-center font-NunitoMedium">
                  {searchQuery ? 'Try adjusting your search terms' : 'No mechanics are currently available'}
                </Text>
              </View>
            )}

            {/* Mechanics List */}
            {!isLoading && !error && filteredMechanics.length > 0 && (
              <FlatList
                data={filteredMechanics}
                renderItem={renderMechanicCard}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={true}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                }}
                contentContainerStyle={{
                  paddingTop: 20,
                  paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
              />
            )}
          </>
        ) : (
          <View className="flex-1 justify-center items-center px-5">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">📋</Text>
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2 text-center">
              No orders yet
            </Text>
            <Text className="text-gray-500 text-center font-NunitoMedium">
              Order a mechanic to see your orders here
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AllMechanic;
