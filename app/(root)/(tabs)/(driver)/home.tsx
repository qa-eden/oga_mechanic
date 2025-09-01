import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDownIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from 'react-native-heroicons/outline';

import {
  MapPinIcon,
} from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import OngoingBookingCard from '@/components/cards/OngoingBookingCard';
import BookingCard from '@/components/cards/BookingCard';
import { router } from 'expo-router';
import { driverRoutes } from '@/constants/routes';

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
    },
    {
      id: 2,
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
                <Text className="text-xl font-bold text-gray-900">Hi, Okorie</Text>
                <Text className="text-sm text-gray-500 flex-row items-center">
                  Everything your car needs is here ☁️
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            {/* Location */}
            <TouchableOpacity className="flex-row items-center " onPress={handleLocationPress}>
              <MapPinIcon size={20} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{selectedLocation}</Text>
              <ChevronDownIcon size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Online/Offline Toggle */}
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`py-3 px-6 rounded-xl self-end ${isOnline ? 'bg-primary-500' : 'bg-yellow-500'}`}
            >
              <Text className="text-white font-semibold text-center">
                {isOnline ? 'Go offline' : 'Go online'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Performance Metrics */}
        <View className="px-5 mb-6 mt-3">
          <View className="flex-row space-x-3 gap-2">
            {dailyMetrics.map((metric) => {
              // const IconComponent = metric.icon;
              return (
                <View key={metric.id} className="flex-1 bg-white p-4 rounded-xl shadow-xs border border-gray-300">
                  <View className="items-center mb-2">
                    {/* <IconComponent size={20} color={metric.iconColor} /> */}
                    <Text className="text-gray-500 text-[.86rem] text-center">{metric.label}</Text>
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
            <OngoingBookingCard
              key={booking.id}
              id={booking.id}
              count={booking.count}
              type={booking.type}
              timeRemaining={booking.timeRemaining}
              dateTime={booking.dateTime}
            />
          ))}
        </View>



        {/* Recommended Bookings - Show when offline */}
        {!isOnline ? (
          <View className="px-5 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Recommended Bookings</Text>
            <View className="bg-white rounded-xl border border-gray-200 p-8 items-center">
              <View className="w-40 h-40 bg-gray-100 rounded-full items-center justify-center mb-4">
                <icons.empty className='w-full h-full' />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">No Bookings Found</Text>
              <Text className="text-sm text-gray-500 text-center leading-5">
                You can't view recommended bookings while you are offline, go online to see available request.
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-5 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Close by bookings</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push({
                  pathname: "/(root)/(tabs)/(driver)/home",
                  params: { tab: "consultation" }
                })}
              >
                <Text className="text-red-500 font-medium mr-1">View All</Text>
                <ArrowRightIcon size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-col gap-4">
              {nearbyBookings.map((booking) => (
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
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;