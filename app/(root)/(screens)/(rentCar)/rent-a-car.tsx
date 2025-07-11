"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Image, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { icons, images } from "@/constants"
import { LAYOUT } from "@/constants/units"
import { NairaCurrency } from "@/utils/useCurrencyFormatter"
import { routes } from "@/constants/routes"

const { width: screenWidth } = Dimensions.get("window")

interface RentalCar {
  id: string
  name: string
  transmission: string
  pricePerDay: number
  image: any
  category: string
}

const RentACarScreen = () => {
  const { CONTAINER_PADDING } = LAYOUT

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Mercedes", "Porsche", "Hyundai", "BMW", "Tesla", "Toyota"]

  const rentalCars: RentalCar[] = [
    {
      id: "1",
      name: "BMW 328",
      transmission: "Automatic",
      pricePerDay: 100000,
      image: images?.brabus,
      category: "BMW",
    },
    {
      id: "2",
      name: "Tesla Model S",
      transmission: "Automatic",
      pricePerDay: 210000,
      image: images?.brabus,
      category: "Tesla",
    },
    {
      id: "3",
      name: "Toyota Yaris",
      transmission: "Automatic",
      pricePerDay: 90000,
      image: images?.brabus,
      category: "Toyota",
    },
    {
      id: "4",
      name: "Brabus G63",
      transmission: "Automatic",
      pricePerDay: 400000,
      image: images?.brabus,
      category: "Mercedes",
    },
    {
      id: "5",
      name: "Mercedes C-Class",
      transmission: "Automatic",
      pricePerDay: 150000,
      image: images?.brabus,
      category: "Mercedes",
    },
    {
      id: "6",
      name: "Porsche 911",
      transmission: "Automatic",
      pricePerDay: 350000,
      image: images?.brabus,
      category: "Porsche",
    },
  ]

  const filteredCars = rentalCars.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || car.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const renderCategoryTab = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item)}
      className={`px-6 py-3 rounded-full mr-3 ${selectedCategory === item ? "bg-primary-500" : "bg-gray-200"}`}
      activeOpacity={0.7}
    >
      <Text className={`font-NunitoBold text-base ${selectedCategory === item ? "text-white" : "text-gray-600"}`}>
        {item}
      </Text>
    </TouchableOpacity>
  )

  const renderCarCard = ({ item }: { item: RentalCar }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: routes?.carRentalDetail,
          params: {
            carId: item.id,
            carName: item.name,
            pricePerDay: item.pricePerDay,
          },
        })
      }}
      className="bg-gray-50 rounded-2xl p-4 mb-4 flex-row items-center"
      activeOpacity={0.7}
    >
      {/* Car Image */}
      <View className="w-32 h-24 bg-white rounded-xl mr-4 overflow-hidden items-center justify-center">
        <item.image width={120} height={100} />
      </View>

      {/* Car Details */}
      <View className="flex-1">
        <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-1">{item.name}</Text>

        <Text className="text-base font-NunitoMedium text-gray-600 mb-3">{item.transmission}</Text>

        <View className="flex-row items-center">
          <NairaCurrency value={item.pricePerDay} className="text-lg font-NunitoBold text-gray-900" />
          <Text className="text-base font-NunitoMedium text-gray-600 ml-1">/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className={`flex-row items-center justify-between py-4 ${CONTAINER_PADDING} border-b border-gray-100`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <icons.backBtn width={20} height={20} />
        </TouchableOpacity>

        <Text className="text-xl font-NunitoExtraBold text-gray-900">Rent a car</Text>

        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Search Bar */}
        <View className={`${CONTAINER_PADDING} pt-6 mb-6`}>
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4">
            <icons.search width={20} height={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <Text className={`text-xl font-NunitoExtraBold text-gray-900 mb-4 ${CONTAINER_PADDING}`}>Categories</Text>

          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Cars List */}
        <View className={CONTAINER_PADDING}>
          {filteredCars.length > 0 ? (
            <FlatList
              data={filteredCars}
              renderItem={renderCarCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-lg font-NunitoBold text-gray-500 mb-2">No cars found</Text>
              <Text className="text-base font-NunitoMedium text-gray-400 text-center">
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default RentACarScreen
