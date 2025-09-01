import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDownIcon, ArrowRightIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import { router } from 'expo-router';

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState("No 5, Agbondodo str, Ijai...");

  // Summary cards data
  const summaryCards = [
    {
      id: 1,
      title: "Total earnings",
      value: "NGN 123,000",
      icon: "₦",
      color: "#FFD700"
    },
    {
      id: 2,
      title: "Today's delivery",
      value: "15 completed",
      icon: "🛵",
      color: "#10B981"
    }
  ];

  // Nearby delivery requests data
  const deliveryRequests = [
    {
      id: 1,
      customerName: "Ademola Michael",
      orderId: "Order 21222345",
      pickup: "Obalende St.",
      delivery: "No 20, Obalende St.",
      isSelected: true
    },
    {
      id: 2,
      customerName: "Big Suzz",
      orderId: "Order 21222345",
      pickup: "NO 2, Barkely St.",
      delivery: "No 22, College road,",
      isSelected: false
    },
    {
      id: 3,
      customerName: "Big Warith",
      orderId: "Order 21222345",
      pickup: "No 22, College road,",
      delivery: "NO 2, Barkely St",
      isSelected: false
    }
  ];

  const handleLocationPress = () => {
    Alert.alert('Location', 'Location selector tapped');
  };

  const handleCheckDetails = () => {
    Alert.alert('Check Details', 'Check details button tapped');
  };

  return (
    <SafeAreaView className="h-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-white px-5 py-4">
          {/* Profile and Greeting */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="text-xl font-bold text-gray-900">Hi, Waarith</Text>
                <Text className="text-sm text-gray-500 flex-row items-center">
                  Everything your car needs is here ☁️
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            {/* Location */}
            <TouchableOpacity className="flex-row items-center" onPress={handleLocationPress}>
              <MapPinIcon size={20} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{selectedLocation}</Text>
              <ChevronDownIcon size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Go offline button */}
            <TouchableOpacity className="py-3 px-6 rounded-xl bg-green-500">
              <Text className="text-white font-semibold text-center">
                Go offline
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Section */}
        <View className="h-64 bg-gray-200 mx-5 rounded-xl mb-4">
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Map View</Text>
            <View className="w-6 h-6 border-2 border-blue-500 border-dashed rounded-full mt-2" />
          </View>
        </View>

        {/* Summary Cards */}
        <View className="px-5 mb-6">
          <View className="flex-row space-x-3">
            {summaryCards.map((card) => (
              <View key={card.id} className="flex-1 bg-white p-4 rounded-xl shadow-xs border border-gray-300">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-sm font-medium">{card.title}</Text>
                  <ArrowRightIcon size={16} color="#6B7280" />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900">{card.value}</Text>
                  <Text className="text-2xl">{card.icon}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Nearby Delivery Requests */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Nearby Delivery Requests</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-red-500 font-medium mr-1">View all</Text>
              <ArrowRightIcon size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {deliveryRequests.map((request) => (
              <View
                key={request.id}
                className={`bg-white rounded-xl p-4 border ${
                  request.isSelected ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-bold text-gray-900">{request.customerName}</Text>
                  <Text className="text-sm text-gray-600">{request.orderId}</Text>
                </View>
                
                <View className="flex-row items-start">
                  <View className="w-4 h-4 bg-blue-500 rounded-full mt-1 mr-3" />
                  <Text className="text-sm text-gray-700 flex-1">{request.pickup}</Text>
                </View>
                
                <View className="ml-2 my-1">
                  <View className="w-px h-4 bg-gray-300" />
                </View>
                
                <View className="flex-row items-start">
                  <View className="w-4 h-4 bg-green-500 rounded-full mt-1 mr-3" />
                  <Text className="text-sm text-gray-700 flex-1">{request.delivery}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Check Details Button */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={handleCheckDetails}
            className="bg-red-500 py-4 rounded-xl"
          >
            <Text className="text-white font-bold text-center text-lg">
              Check details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;