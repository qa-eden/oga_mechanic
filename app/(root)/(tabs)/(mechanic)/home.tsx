"use client";

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BellIcon } from "react-native-heroicons/outline";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";

const { width } = Dimensions.get("window");

const MechanicHome = () => {
  const consultations = [
    {
      id: 1,
      name: "Yvonne Ede",
      email: "yvonnede@email.com",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 2,
      name: "Azeez Babatunde",
      email: "azeez@email.com",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah@email.com",
      avatar: "https://via.placeholder.com/40",
    },
    {
      id: 4,
      name: "Michael Chen",
      email: "michael@email.com",
      avatar: "https://via.placeholder.com/40",
    },
  ];

  const ratingData = [
    { stars: 5, count: 900, percentage: 90 },
    { stars: 4, count: 50, percentage: 5 },
    { stars: 3, count: 25, percentage: 2.5 },
    { stars: 2, count: 15, percentage: 1.5 },
    { stars: 1, count: 15, percentage: 1.5 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-200 rounded-full mr-3" />
            <View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Hi, Waarith
              </Text>
              <Text className="text-sm text-gray-600 font-NunitoMedium">
                Everything your car needs is here.
              </Text>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <BellIcon size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-4">
          {/* Let's fix some cars card */}
          <View className="bg-gray-900 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-NunitoBold mb-2">
                  Let's fix some cars
                </Text>
                <Text className="text-gray-300 text-sm font-NunitoMedium mb-4">
                  Connecting with car owners
                </Text>
                <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-full self-start">
                  <Text className="text-white font-NunitoBold">View all consultation</Text>
                </TouchableOpacity>
              </View>
              <View className="w-20 h-20 bg-gray-700 rounded-lg items-center justify-center">
                <Text className="text-white text-2xl">🔧</Text>
              </View>
            </View>
          </View>

          {/* Metrics */}
          <View className="flex-row space-x-4 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
                Today's Earning
              </Text>
              <NairaCurrency
                value={500000}
                className="text-2xl font-NunitoBold text-gray-900"
              />
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
                Total Consultation
              </Text>
              <Text className="text-2xl font-NunitoBold text-gray-900">500</Text>
            </View>
          </View>

          {/* Customer Reviews */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Customer's Review
              </Text>
              <Text className="text-2xl">📊</Text>
            </View>
            
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl font-NunitoBold text-gray-900 mr-2">
                1K (4.7)
              </Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} className="text-green-500 text-lg">⭐</Text>
                ))}
              </View>
            </View>

            {/* Rating bars */}
            {ratingData.map((item) => (
              <View key={item.stars} className="flex-row items-center mb-2">
                <Text className="text-sm text-gray-600 w-8">{item.stars}★</Text>
                <View className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                  <View 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </View>
                <Text className="text-sm text-gray-600 w-12">{item.count}</Text>
              </View>
            ))}
          </View>

          {/* New Consultations */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                New Consultation
              </Text>
              <TouchableOpacity>
                <Text className="text-red-600 font-NunitoBold">View All</Text>
              </TouchableOpacity>
            </View>

            {consultations.map((consultation) => (
              <View key={consultation.id} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <Image
                    source={{ uri: consultation.avatar }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="font-NunitoBold text-gray-900">
                      {consultation.name}
                    </Text>
                    <Text className="text-sm text-gray-600 font-NunitoMedium">
                      {consultation.email}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-red-600 px-4 py-2 rounded-full">
                  <Text className="text-white font-NunitoBold text-sm">Visit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MechanicHome;