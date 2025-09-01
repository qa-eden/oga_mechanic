import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { riderRoutes } from '@/constants/routes';

const RiderProfile = () => {
  const profileData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 801 234 5678",
    vehicleType: "Car",
    vehicleModel: "Toyota Camry 2020",
    rating: 4.8,
    totalTrips: 156,
    totalEarnings: "₦450,000",
  };

  const menuItems = [
    {
      id: 1,
      title: "Edit Profile",
      icon: "👤",
      onPress: () => console.log("Edit Profile"),
    },
    {
      id: 2,
      title: "Vehicle Information",
      icon: "🚗",
      onPress: () => console.log("Vehicle Information"),
    },
    {
      id: 3,
      title: "Bank Account",
      icon: "🏦",
      onPress: () => console.log("Bank Account"),
    },
    {
      id: 4,
      title: "Notifications",
      icon: "🔔",
      onPress: () => console.log("Notifications"),
    },
    {
      id: 5,
      title: "Help & Support",
      icon: "❓",
      onPress: () => console.log("Help & Support"),
    },
    {
      id: 6,
      title: "About",
      icon: "ℹ️",
      onPress: () => console.log("About"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4 bg-white">
          <Text className="text-xl font-NunitoBold text-gray-900 text-center">
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="px-5 py-6">
          <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <View className="items-center mb-4">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                className="w-20 h-20 rounded-full mb-3"
              />
              <Text className="text-xl font-NunitoBold text-gray-900 mb-1">
                {profileData.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">
                {profileData.email}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 text-lg mr-1">⭐</Text>
                <Text className="text-sm text-gray-600">
                  {profileData.rating} ({profileData.totalTrips} trips)
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Vehicle</Text>
                <Text className="font-NunitoBold text-gray-900">
                  {profileData.vehicleType} - {profileData.vehicleModel}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Phone</Text>
                <Text className="font-NunitoBold text-gray-900">
                  {profileData.phone}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Total Earnings</Text>
                <Text className="font-NunitoBold text-gray-900">
                  {profileData.totalEarnings}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="bg-white rounded-xl border border-gray-200">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                className={`flex-row items-center justify-between p-4 ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">{item.icon}</Text>
                  <Text className="text-gray-900 font-NunitoMedium">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/(login)/sign_in')}
            className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <Text className="text-red-600 font-NunitoBold text-center">
              Logout
            </Text>
          </TouchableOpacity>

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RiderProfile;