"use client"

import { View, Text, FlatList, TouchableOpacity } from "react-native"
import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import { icons } from "@/constants"
import BackArrowBtn from "@/components/BackArrowBtn"

interface LocationItem {
  id: string
  name: string
  address: string
  type: "current_route" | "suggestion"
}

const LocationSelection = () => {
  const params = useLocalSearchParams()
  const { type } = params // 'from' or 'to'

  // Mock location data
  const [locations] = useState<LocationItem[]>([
    {
      id: "1",
      name: "Campus Mini Stadium",
      address: "102273 Lagos Island, Lagos",
      type: "current_route",
    },
    {
      id: "2",
      name: "Viva Cinema",
      address: "22 Simbiat Abiola Way, Lagos",
      type: "current_route",
    },
    {
      id: "3",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "4",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "5",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "6",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "7",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "8",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "9",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "10",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "11",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "12",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
  ])

  const currentRoute = locations.filter((loc) => loc.type === "current_route")
  const suggestions = locations.filter((loc) => loc.type === "suggestion")

  const handleLocationSelect = (location: LocationItem) => {
    // Navigate back with selected location
    router.back()
    // In a real app, you would pass the selected location back to the previous screen
    console.log("Selected location:", location)
  }

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      onPress={() => handleLocationSelect(item)}
      className="flex-row items-center py-4 px-5 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-4">
        <icons.location width={16} height={16} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-NunitoBold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500 font-NunitoMedium mt-1">{item.address}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">Message</Text>
        <View className="w-6" />
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={renderLocationItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* Current Route Summary */}
            <View className="mx-5 mt-6 mb-4 p-4 border-2 border-red-300 rounded-xl bg-red-50">
              {/* From Location */}
              <View className="flex-row items-center mb-3">
                <View className="w-6 h-6 bg-gray-800 rounded-full items-center justify-center mr-3">
                  <icons.location width={12} height={12} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-NunitoBold text-gray-900">{currentRoute[0]?.name}</Text>
                  <Text className="text-sm text-gray-600 font-NunitoMedium">{currentRoute[0]?.address}</Text>
                </View>
              </View>

              {/* Arrow */}
              <View className="flex-row justify-start ml-3 mb-3">
                <View className="transform rotate-90">
                  <icons.rightArrow width={16} height={16} color="#EF4444" />
                </View>
              </View>

              {/* To Location */}
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-gray-800 rounded-full items-center justify-center mr-3">
                  <icons.location width={12} height={12} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-NunitoBold text-gray-900">{currentRoute[1]?.name}</Text>
                  <Text className="text-sm text-gray-600 font-NunitoMedium">{currentRoute[1]?.address}</Text>
                </View>
              </View>
            </View>

            {/* Suggestions Header */}
            <View className="px-5 py-2">
              <Text className="text-base font-NunitoBold text-gray-700">Recent Locations</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />
    </SafeAreaView>
  )
}

export default LocationSelection
