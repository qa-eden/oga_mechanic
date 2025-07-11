"use client"

import React from "react"
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Dimensions } from "react-native"
import { useState } from "react"

const { width: screenWidth } = Dimensions.get("window")
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams } from "expo-router"
import BackArrowBtn from "@/components/BackArrowBtn"
// import { icons, images } from "@/constants"
import brabus from "@/assets/images/brabus.svg";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PhoneIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon,
  CogIcon,
  FunnelIcon
} from "react-native-heroicons/outline"
import { StarIcon as StarIconSolid } from "react-native-heroicons/solid"
import { FlatList } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface CarRentalDetails {
  id: string
  name: string
  year: string
  brand: string
  model: string
  image: any
  pricePerDay: number
  pricePerWeek: number
  pricePerMonth: number
  mileage: number
  fuelType: string
  transmission: string
  seats: number
  doors: number
  color: string
  location: string
  rating: number
  reviewCount: number
  isAvailable: boolean
  features: string[]
  insurance: {
    included: boolean
    coverage: string
    deductible: number
  }
  owner: {
    name: string
    phone: string
    avatar: string
    rating: number
    reviewCount: number
    responseTime: string
  }
  pickupLocation: string
  returnLocation: string
  minimumRentalDays: number
  maximumRentalDays: number
  cancellationPolicy: string
}

const CarRentalDetail = () => {
  const params = useLocalSearchParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Mock car data - in real app, this would be fetched based on car ID from params
  const [carData] = useState<CarRentalDetails>({
    id: (params.carId as string) || "1",
    name: (params.carName as string) || "BMW 328",
    year: "2019",
    brand: "BMW",
    model: "328",
    image: brabus,
    pricePerDay: Number.parseInt(params.pricePerDay as string) || 15000,
    pricePerWeek: 90000,
    pricePerMonth: 300000,
    mileage: 25000,
    fuelType: "Petrol",
    transmission: "Automatic",
    seats: 5,
    doors: 4,
    color: "#1F2937",
    location: "Lagos, Nigeria",
    rating: 4.8,
    reviewCount: 127,
    isAvailable: true,
    features: [
      "Air Conditioning",
      "Bluetooth",
      "Backup Camera",
      "GPS Navigation",
      "USB Charging",
      "Leather Seats",
      "Sunroof",
      "Cruise Control",
    ],
    insurance: {
      included: true,
      coverage: "Comprehensive",
      deductible: 50000,
    },
    owner: {
      name: "Micheal Adenuga",
      phone: "08056432765",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 4.9,
      reviewCount: 89,
      responseTime: "Usually responds in 1 hour",
    },
    pickupLocation: "Lagos Airport",
    returnLocation: "Lagos Airport",
    minimumRentalDays: 1,
    maximumRentalDays: 30,
    cancellationPolicy: "Free cancellation up to 24 hours before pickup",
  })

  // Multiple car images for carousel
  const images = [brabus, brabus, brabus, brabus] // In real app, these would be different images

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleContactNow = () => {
    const phoneNumber = carData.owner.phone.replace(/\s/g, "")
    const url = `tel:+234${phoneNumber.substring(1)}`
    Linking.openURL(url)
  }

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
            <Text className="text-xl font-NunitoBold text-gray-900">Car Rental</Text>
            <Text className="text-sm text-gray-500 font-NunitoMedium">Vehicle Details</Text>
          </View>
          <View className="w-6" />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Car Info */}
        <View className="px-5 pt-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-NunitoExtraBold text-gray-900">{carData.brand} {carData.model}</Text>
              <Text className="text-lg font-NunitoMedium text-gray-600">{carData.year}</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center mb-1">
                <StarIconSolid size={16} color="#F59E0B" />
                <Text className="text-sm font-NunitoBold text-gray-700 ml-1">
                  {carData.rating} ({carData.reviewCount})
                </Text>
              </View>
              <View className={`px-2 py-1 rounded-full ${
                carData.isAvailable ? "bg-green-100" : "bg-red-100"
              }`}>
                <Text className={`text-xs font-NunitoBold ${
                  carData.isAvailable ? "text-green-600" : "text-red-600"
                }`}>
                  {carData.isAvailable ? "Available" : "Unavailable"}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center mb-6">
            <MapPinIcon size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 font-NunitoMedium ml-1">{carData.location}</Text>
          </View>
        </View>

        {/* Car Image Carousel */}
        <View className="px-5 mb-8">
          <View className="relative">
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 40))
                setCurrentImageIndex(newIndex)
              }}
              renderItem={({ item }) => (
                <View className="bg-gray-50 rounded-2xl overflow-hidden items-center justify-center" style={{ width: screenWidth - 40 }}>
                  {React.createElement(item, { width: 300, height: 280 })}
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
            />

            {/* Image Navigation */}
            {images.length > 1 && (
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
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-primary-500" : "bg-gray-300"
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
              <Text className="text-xl font-NunitoBold text-white mb-1">{carData.owner.name}</Text>
              <View className="flex-row items-center">
                <PhoneIcon size={16} color="#9CA3AF" />
                <Text className="text-gray-300 font-NunitoMedium ml-2">{carData.owner.phone}</Text>
              </View>
            </View>
          </View>

          {/* Overview */}
          <Text className="text-2xl font-NunitoBold text-white mb-4">Overview</Text>

          {/* Price */}
          <Text className="text-4xl font-NunitoExtraBold text-white mb-8">
            NGN {carData.pricePerDay.toLocaleString()}/day
          </Text>

          {/* Specifications */}
          <View className="flex-row flex-wrap mb-8">
            <View className="w-1/2 pr-2 mb-4">
              <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                  <CogIcon size={16} color="#FFFFFF" />
                </View>
                <Text className="text-white font-NunitoBold text-base">{carData.transmission}</Text>
              </View>
            </View>

            <View className="w-1/2 pl-2 mb-4">
              <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                  <FunnelIcon size={16} color="#FFFFFF" />
                </View>
                <Text className="text-white font-NunitoBold text-base">{carData.fuelType}</Text>
              </View>
            </View>

            <View className="w-1/2 pr-2">
              <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                  <UserIcon size={16} color="#FFFFFF" />
                </View>
                <Text className="text-white font-NunitoBold text-base">{carData.seats} Seats</Text>
              </View>
            </View>

            <View className="w-1/2 pl-2">
              <View className="bg-gray-800 rounded-2xl p-4 flex-row items-center">
                <View className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center mr-3">
                  <Text className="text-white text-xs">📊</Text>
                </View>
                <Text className="text-white font-NunitoBold text-base">{carData.mileage.toLocaleString()}km</Text>
              </View>
            </View>
          </View>

    

          {/* Contact Button */}
          <TouchableOpacity onPress={handleContactNow} className="w-full py-4 bg-white rounded-2xl" activeOpacity={0.8}>
            <Text className="text-center font-NunitoBold text-primary-600 text-lg">Contact now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CarRentalDetail
