"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ArrowLeftIcon, MapPinIcon, PhoneIcon } from "react-native-heroicons/outline";
import { StarIcon } from "react-native-heroicons/solid";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { images } from "@/constants";

const EditProfile = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Last year");

  const profileData = {
    name: "Abdulwarrith Abdulazeez",
    location: "Lagos, Nigeria",
    phone: "07064685268",
    rating: 4.5,
    profileImage: images.mechanic1,
    totalEarnings: 5000000,
    drivingLicense: {
      number: "DLFA1245798123S",
      expiryDate: "12 Jan 2023",
      experience: "12 Years",
    },
    vehicleInfo: {
      name: "Toyota Camry",
      color: "Black",
      model: "2025",
      plateNumber: "DLFA1245",
    },
  };

  const earningsPeriods = ["Last month", "Last year", "All time"];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">
          My Profile
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="items-center py-8">
          {/* Profile Image */}
          <View className="mb-6">
            <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                source={profileData.profileImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Name */}
          <Text className="text-2xl font-NunitoBold text-gray-900 mb-4 text-center">
            {profileData.name}
          </Text>

          {/* Location and Phone */}
          <View className="flex-row items-center justify-center space-x-6 mb-4">
            <View className="flex-row items-center">
              <MapPinIcon size={16} color="#EF4444" />
              <Text className="text-gray-600 font-NunitoMedium ml-1">
                {profileData.location}
              </Text>
            </View>
            <View className="flex-row items-center">
              <PhoneIcon size={16} color="#EF4444" />
              <Text className="text-gray-600 font-NunitoMedium ml-1">
                {profileData.phone}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View className="flex-row items-center bg-green-600 px-3 py-1 rounded-full">
            <StarIcon size={16} color="white" />
            <Text className="text-white font-NunitoBold ml-1">
              {profileData.rating}
            </Text>
          </View>
        </View>

        {/* Total Earnings Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-NunitoBold text-gray-900">
              Total Earnings
            </Text>
            
            {/* Period Selector */}
            <View className="flex-row items-center border border-gray-300 rounded-lg">
              <Text className="text-gray-600 font-NunitoMedium px-3 py-2">
                {selectedPeriod}
              </Text>
              <TouchableOpacity className="px-2">
                <Text className="text-gray-400">▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <NairaCurrency
            value={profileData.totalEarnings}
            className="text-3xl font-NunitoBold text-gray-900"
          />
        </View>

        {/* Driving License Section */}
        <View className="mb-8">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            Driving License
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">DL Number</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.drivingLicense.number}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">DL Expiry Date</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.drivingLicense.expiryDate}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">Experience</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.drivingLicense.experience}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Info Section */}
        <View className="mb-8">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            Vehicle Info
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">Vehicle Name</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.vehicleInfo.name}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">Vehicle Color</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.vehicleInfo.color}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">Vehicle Model</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.vehicleInfo.model}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-NunitoMedium">Plate Number</Text>
              <Text className="font-NunitoBold text-gray-900">
                {profileData.vehicleInfo.plateNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
