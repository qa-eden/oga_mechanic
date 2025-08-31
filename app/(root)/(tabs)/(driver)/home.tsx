import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDownIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArrowPathIcon
} from 'react-native-heroicons/outline';

import {
  MapPinIcon,
} from 'react-native-heroicons/solid';
import { icons } from '@/constants';

const Home = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("No 5, Agbondodo str, Ijai...");
  const [debugCount, setDebugCount] = useState(0);

  // Daily performance metrics data
  const dailyMetrics = [
    {
      id: 1,
      icon: CurrencyDollarIcon,
      label: "Today's Earning",
      value: "₦123,000",
      iconColor: "#EF4444"
    },
    {
      id: 2,
      icon: TruckIcon,
      label: "Today's Trips",
      value: "10",
      iconColor: "#EF4444"
    },
    {
      id: 3,
      icon: ClockIcon,
      label: "Today's Login Hrs",
      value: "17 Hrs",
      iconColor: "#EF4444"
    }
  ];

  // Ongoing bookings data
  const ongoingBookings = [
    {
      id: 1,
      count: 2,
      type: "One Way",
      timeRemaining: "Ends In: 1 Hr 12 mins",
      dateTime: "28 Feb, 10:10 AM"
    }
  ];

  // Nearby bookings data
  const nearbyBookings = [
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
    }
  ];

  useEffect(() => {
    // Test logging every 5 seconds
    const interval = setInterval(() => {
      setDebugCount(prev => prev + 1);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleOnlineStatus = () => {
    Alert.alert('Status Changed', `You are now ${!isOnline ? 'online' : 'offline'}`);
    setIsOnline(!isOnline);
  };

  const handleLocationPress = () => {
    Alert.alert('Location', 'Location selector tapped');
  };

  const handleViewAll = () => {
    Alert.alert('View All', 'View All button tapped');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-white px-5 pt-4 pb-6">
          {/* Profile and Greeting */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="text-xl font-bold text-gray-900">Hi, Okorie</Text>
                <Text className="text-sm text-gray-500 flex-row items-center">
                  Everything your car needs is here ☁️
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            {/* Location */}
            <TouchableOpacity className="flex-row items-center mb-4" onPress={handleLocationPress}>
              <MapPinIcon size={20} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{selectedLocation}</Text>
              <ChevronDownIcon size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Online/Offline Toggle */}
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`py-3 px-6 rounded-xl self-end ${isOnline ? 'bg-primary-500' : 'bg-green-500'}`}
            >
              <Text className="text-white font-semibold text-center">
                {isOnline ? 'Go offline' : 'Go online'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Performance Metrics */}
        <View className="px-5 mb-6">
          <View className="flex-row space-x-3 gap-2">
            {dailyMetrics.map((metric) => {
              // const IconComponent = metric.icon;
              return (
                <View key={metric.id} className="flex-1 bg-white p-4 rounded-xl shadow-xs border border-gray-300">
                  <View className="flex-row items-center mb-2 justify-center flex-1">
                    {/* <IconComponent size={20} color={metric.iconColor} /> */}
                    <Text className="text-gray-500 text-[.86rem] ml-2 font-NunitoMedium text-center">{metric.label}</Text>
                  </View>
                  <Text className="text-xl text-center font-medium text-red-500">{metric.value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Ongoing Bookings */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">On Going Bookings</Text>
          {ongoingBookings.map((booking) => (
            <View key={booking.id} className="bg-white p-4 rounded-xl shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className=" items-center justify-center mr-3">
                    {/* <Text className="text-white font-bold text-lg">{booking.count}</Text> */}
                    <icons.trip width={50} height={50} />
                  </View>
                  <View>
                    <Text className="font-semibold text-lg text-gray-900">{booking.type}</Text>
                    <Text className="text-sm text-gray-500">{booking.timeRemaining}</Text>
                  </View>
                </View>
                <Text className="text-green-700 text-sm font-medium">{booking.dateTime}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Close by Bookings */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Close by bookings</Text>
            <TouchableOpacity className="flex-row items-center" onPress={handleViewAll}>
              <Text className="text-red-500 font-medium mr-1">View All</Text>
              <ArrowRightIcon size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {nearbyBookings.map((booking) => (
            <View key={booking.id} className="bg-white rounded-xl border border-gray-300">
              {/* Booking Header */}
              <View className="flex-row items-center gap-2 w-full border-b border-gray-300 p-3">
                <icons.round width={50} height={50} />
                <View className="flex-1">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">{booking.type}</Text>
                    <Text className="text-green-500 text-sm font-medium bg-green-700 text-white px-2 py-1 rounded-full">{booking.dateTime}</Text>
                  </View>
                  {/* Trip Details */}
                  <View className="flex-row items-center space-x-2 mb-2">
                    <Text className="text-sm text-gray-500">Estimate Usage: <Text className="text-gray-900 font-medium">{booking.estimateUsage}</Text></Text>
                    <Text className="text-sm text-gray-500 border-l border-gray-300 pl-1 ml-1">Total Dist.: <Text className="text-gray-900 font-medium">{booking.totalDistance}</Text></Text>
                  </View>
                </View>
              </View>



              {/* Route Information */}
              <View className="mb-4 p-3">
                {/* Pickup */}
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1" >
                    <MapPinIcon size={30} color={booking.pickup.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-700 leading-5">
                      {booking.pickup.address}
                    </Text>
                  </View>
                </View>

                {/* Route Line */}
                <View className="ml-3 mb-1">
                  <View className="w-px h-6 bg-gray-300 border-l-2 border-dashed border-gray-300" />
                </View>

                {/* Drop-off */}
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-1" >
                    <MapPinIcon size={30} color={booking.dropoff.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-700 leading-5">
                      {booking.dropoff.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Price */}
              <View className="border-t border-gray-100 bg-red-100 py-3">
                <Text className="text-2xl font-bold text-primary-500 text-center">{booking.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;