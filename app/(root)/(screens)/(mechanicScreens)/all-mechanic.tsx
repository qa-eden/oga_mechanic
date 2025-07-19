"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { images } from "@/constants";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";
import { useCallback } from "react";
import MechanicCard from "@/components/cards/MechanicCard";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";

const { width: screenWidth } = Dimensions.get("window");

interface Mechanic {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  image: any;
  isVip?: boolean;
  specialization?: string;
  location?: string;
  isOnline?: boolean;
}

const AllMechanic = () => {
  const [activeTab, setActiveTab] = useState("Mechanics");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Mock mechanics data
  const mechanics: Mechanic[] = [
    {
      id: 1,
      name: "Fatai Sule",
      rating: 4.5,
      reviewCount: 30,
      image: images?.mechanic1,
      specialization: "Engine Specialist",
      location: "Lagos",
      isOnline: true,
    },
    {
      id: 2,
      name: "Easther Emeka",
      rating: 5.0,
      reviewCount: 30,
      image: images?.mechanic3,
      isVip: true,
      specialization: "Transmission Expert",
      location: "Abuja",
      isOnline: true,
    },
    {
      id: 3,
      name: "Lukman Saheed",
      rating: 4.5,
      reviewCount: 35,
      image: images?.lookman,
      specialization: "Brake Specialist",
      location: "Kano",
      isOnline: false,
    },
    {
      id: 4,
      name: "Otunba Lamba",
      rating: 3.5,
      reviewCount: 30,
      image: images?.otunba,
      specialization: "Electrical Systems",
      location: "Ibadan",
      isOnline: true,
    },
    {
      id: 5,
      name: "Salisu Samlary",
      rating: 4.0,
      reviewCount: 44,
      image: images?.salisu,
      specialization: "Diagnostic Expert",
      location: "Port Harcourt",
      isOnline: true,
    },
    {
      id: 6,
      name: "Fatai Sule",
      rating: 4.5,
      reviewCount: 30,
      image: images?.mechanic1,
      specialization: "General Repair",
      location: "Lagos",
      isOnline: false,
    },
  ];

  const filteredMechanics = mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMechanicPress = (mechanic: Mechanic) => {
    router.push({
      pathname: routes.mechanicProfile,
      params: {
        mechanicId: mechanic.id,
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
          Chat mechanic
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
          onPress={() => setActiveTab("All chats")}
          className={`flex-1 py-3 rounded-lg ml-2 ${
            activeTab === "All chats" ? "bg-primary-500" : "bg-gray-100"
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-center font-NunitoBold text-base ${
              activeTab === "All chats" ? "text-white" : "text-gray-600"
            }`}
          >
            All chats
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
        ) : (
          <View className="flex-1 justify-center items-center px-5">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">💬</Text>
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2 text-center">
              No chats yet
            </Text>
            <Text className="text-gray-500 text-center font-NunitoMedium">
              Start a conversation with a mechanic to see your chats here
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AllMechanic;
