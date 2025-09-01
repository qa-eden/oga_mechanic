import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BookingCard from '@/components/cards/BookingCard';

const RiderOrder = () => {
  const [activeTab, setActiveTab] = useState('recent');

  const recentBookings = [
    {
      id: 1,
      type: "Round Trip",
      dateTime: "28 Feb, 10:10 AM",
      estimateUsage: "5 Hrs",
      totalDistance: "85 km",
      pickup: {
        address: "108, Auchandi Bawana Rd, Bawana Village, Lag...",
        color: "#2F6FED"
      },
      dropoff: {
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quart...",
        color: "#00A85A"
      },
      price: "₦15,000"
    },
    {
      id: 2,
      type: "One Way",
      dateTime: "27 Feb, 2:30 PM",
      estimateUsage: "3 Hrs",
      totalDistance: "45 km",
      pickup: {
        address: "Lagos Island, Victoria Island, Lagos...",
        color: "#2F6FED"
      },
      dropoff: {
        address: "Ikeja, Lagos State, Nigeria...",
        color: "#00A85A"
      },
      price: "₦8,500"
    },
  ];

  const completedBookings = [
    {
      id: 3,
      type: "One Way",
      dateTime: "26 Feb, 9:15 AM",
      estimateUsage: "2 Hrs",
      totalDistance: "35 km",
      pickup: {
        address: "Surulere, Lagos State, Nigeria...",
        color: "#2F6FED"
      },
      dropoff: {
        address: "Yaba, Lagos State, Nigeria...",
        color: "#00A85A"
      },
      price: "₦6,200"
    },
    {
      id: 4,
      type: "Round Trip",
      dateTime: "25 Feb, 11:45 AM",
      estimateUsage: "4 Hrs",
      totalDistance: "60 km",
      pickup: {
        address: "Oshodi, Lagos State, Nigeria...",
        color: "#2F6FED"
      },
      dropoff: {
        address: "Alimosho, Lagos State, Nigeria...",
        color: "#00A85A"
      },
      price: "₦12,000"
    },
  ];

  const renderBookingCard = (booking: any) => (
    <BookingCard
      key={booking.id}
      id={booking.id}
      type={booking.type}
      dateTime={booking.dateTime}
      estimateUsage={booking.estimateUsage}
      totalDistance={booking.totalDistance}
      pickup={booking.pickup}
      dropoff={booking.dropoff}
      price={booking.price}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 bg-white">
        <Text className="text-xl font-NunitoBold text-gray-900 text-center">
          Bookings
        </Text>
      </View>

      {/* Tab Buttons */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-4 rounded-md ${
              activeTab === 'recent' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-center font-NunitoMedium ${
                activeTab === 'recent' ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              Recent bookings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-md ${
              activeTab === 'completed' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-center font-NunitoMedium ${
                activeTab === 'completed' ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              Completed bookings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {activeTab === 'recent' ? (
            <View className="space-y-4">
              {recentBookings.map(renderBookingCard)}
            </View>
          ) : (
            <View className="space-y-4">
              {completedBookings.map(renderBookingCard)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RiderOrder;