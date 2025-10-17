import React, { useState, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDownIcon, ArrowRightIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import { router } from 'expo-router';
import RiderRequestCard from '@/components/cards/RiderRequestCard';
import CustomMapView from '@/components/MapView';

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState("No 5, Agbondodo str, Ijai...");
  const [selectedRequestId, setSelectedRequestId] = useState<string | number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate markers for delivery requests
  const generateDeliveryMarkers = () => {
    return deliveryRequests.map((request, index) => ({
      id: `delivery-${request.id}`,
      coordinate: {
        latitude: 6.5244 + (Math.random() - 0.5) * 0.02, // Random nearby locations
        longitude: 3.3792 + (Math.random() - 0.5) * 0.02,
      },
      title: `Delivery Request ${request.id}`,
      description: `${request.customerName} - ${request.orderId}`,
      color: selectedRequestId === request.id ? '#EF4444' : '#10B981',
      size: selectedRequestId === request.id ? 20 : 16,
    }));
  };

  // Handle marker press
  const handleMarkerPress = (markerId: string) => {
    if (markerId.startsWith('delivery-')) {
      const requestId = parseInt(markerId.replace('delivery-', ''));
      setSelectedRequestId(requestId);
    }
  };

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

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView className="h-screen bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#D30309']} // Android
            tintColor="#D30309" // iOS
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
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
        <View className="h-64 mx-5 rounded-xl mb-4 overflow-hidden">
          <CustomMapView
            region={{
              latitude: 6.5244, // Lagos, Nigeria
              longitude: 3.3792,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            markers={[
              {
                id: 'user-location',
                coordinate: {
                  latitude: 6.5244,
                  longitude: 3.3792,
                },
                title: 'Your Location',
                description: selectedLocation,
                color: '#3B82F6',
                size: 20,
              },
              ...generateDeliveryMarkers(),
            ]}
            showUserLocation={true}
            showMyLocationButton={true}
            showCompass={true}
            className="rounded-xl"
          />
        </View>

        {/* Summary Cards */}
        <View className="px-5 mb-6">
          <View className="flex-row gap-3 space-x-3">
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
        <View className="px-5 mb-3">
          <View className="flex-row items-center justify-between ">
            <Text className="text-lg font-bold text-gray-900">Nearby Delivery Requests</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-red-500 font-medium mr-1">View all</Text>
              <ArrowRightIcon size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {deliveryRequests.map((request) => {
              const isSelected = selectedRequestId === request.id;
              return (
                <View key={request.id} className="w-full mt-2">
                  <RiderRequestCard
                    request={{
                      ...request,
                      isSelected: isSelected
                    }}
                    onPress={() => {
                      // Handle request selection
                      setSelectedRequestId(request.id);
                    }}
                    showSelection={true}
                    pickupColor="#3B82F6"
                    deliveryColor="#10B981"
                    borderColor="border-gray-200"
                    selectedBorderColor="border-red-500"
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Check Details Button - Only show when a request is selected */}
        {selectedRequestId && (
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
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;