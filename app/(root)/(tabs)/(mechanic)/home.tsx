"use client";

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { images } from "@/constants";
import OrderCard, { Order } from "@/components/OrderCard";
import CustomerReviewCard from "@/components/CustomerReviewCard";
import { router } from "expo-router";
import Navbar from "@/components/Navbar";
import { useRepairRequests, useAcceptRepairRequest, useDeclineRepairRequest, useMechanicAnalytics } from "@/hooks/useRepairRequests";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnimatedErrorCard from "@/components/AnimatedErrorCard";

const MechanicHome = () => {
  // Fetch repair requests from API
  const {
    data: repairRequestsData,
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests
  } = useRepairRequests();

  // Fetch mechanic analytics from API
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useMechanicAnalytics();

  // Mutations for accepting/declining requests
  const acceptRequestMutation = useAcceptRepairRequest();
  const declineRequestMutation = useDeclineRepairRequest();

  // Transform API data to match OrderCard interface
  const currentOrders: Order[] = repairRequestsData?.data?.map((request: any) => ({
    id: request.id,
    clientName: request.customer_name || request.client_name || 'Unknown Customer',
    phoneNumber: request.customer_phone || request.phone_number || 'N/A',
    carType: request.vehicle_make || request.car_type || 'Unknown Vehicle',
    carIssue: request.issue_description || request.problem_description || 'Repair needed',
  })) || [];

  const handleAccept = async (orderId: string) => {
    try {
      await acceptRequestMutation.mutateAsync(orderId);
      console.log("Request accepted:", orderId);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDecline = async (orderId: string) => {
    try {
      await declineRequestMutation.mutateAsync(orderId);
      console.log("Request declined:", orderId);
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  const ratingData = [
    { stars: 5, count: 900, percentage: 90, color: "bg-green-500" },
    { stars: 4, count: 50, percentage: 5, color: "bg-blue-500" },
    { stars: 3, count: 25, percentage: 2.5, color: "bg-purple-500" },
    { stars: 2, count: 15, percentage: 1.5, color: "bg-orange-500" },
    { stars: 1, count: 15, percentage: 1.5, color: "bg-red-500" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={requestsLoading || analyticsLoading}
            onRefresh={() => {
              refetchRequests();
              refetchAnalytics();
            }}
            colors={['#A80207']}
            tintColor="#A80207"
          />
        }
      >
        {/* Header */}
        <Navbar />

        <View className="py-4">
          {/* Let's fix some cars card */}
          {/* <View className="rounded-2xl mb-6 overflow-hidden">
            <ImageBackground
              source={images?.adsbackground}
              className="w-full h-[150px] bg-cover bg-center"
              resizeMode="cover"
            >
              <View className="bg-black/40 flex-1 justify-center items-start p-6">
                <View className="items-start">
                  <Text className="text-white text-[1.4rem] font-NunitoBold mb-2 text-start">
                    Let's fix some cars
                  </Text>
                  <Text className="text-gray-300 text-md font-NunitoMedium text-start">
                    Connecting with car owners
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View> */}

          {/* Key Metrics Header */}
          <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
            Key Metrics
          </Text>

          {/* Metrics */}
          <View className="flex-row gap-4 space-x-4 mb-4">
            <View className="flex-1 gradient-to-t from-[#C9E6E5] to-[#B1E5FB] bg-[#B1E5FB] rounded-[.4rem] p-4 ">
              <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                Total Repair Requests
              </Text>
              {analyticsLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text className="text-2xl font-NunitoBold text-gray-900">
                  {analyticsData?.data?.total_repair_requests || 0}
                </Text>
              )}
            </View>
            <View className="flex-1 gradient-to-r from-[#D7CFF1] to-[#D3C8E4] bg-[#D3C8E4] rounded-[.4rem] p-4">
              <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                Completed Requests
              </Text>
              {analyticsLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text className="text-2xl font-NunitoBold text-gray-900">
                  {analyticsData?.data?.completed_repair_requests || 0}
                </Text>
              )}
            </View>
          </View>

          {/* Customer Reviews */}
          <CustomerReviewCard
            totalReviews="1K"
            averageRating={4.7}
            ratingData={ratingData}
          />

          {/* Repair Requests Section */}
          <View>
            <View className="flex-row items-center justify-between my-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Recent Repair Requests
              </Text>
              <TouchableOpacity onPress={() => router?.push("./order")}>
                <Text className="text-red-600 font-NunitoBold">View All</Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {requestsLoading && (
              <View className="items-center py-8">
                <LoadingSpinner size="large" />
                <Text className="text-gray-600 font-NunitoMedium mt-2">
                  Loading repair requests...
                </Text>
              </View>
            )}

            {/* Error State */}
            {requestsError && !requestsLoading && (
              <AnimatedErrorCard
                emoji="🔧"
                title="No repair requests available"
                message="No repair requests found at the moment. Pull down to refresh or check back later!"
                gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
                textColor="text-red-800"
                actionButton={{
                  text: "Refresh",
                  onPress: () => refetchRequests(),
                  backgroundColor: "#DC2626"
                }}
              />
            )}

            {/* Success State - Show Orders */}
            {!requestsLoading && !requestsError && currentOrders.length > 0 && (
              <View className="">
                {currentOrders.slice(0, 3).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    type="current"
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </View>
            )}

            {/* Empty State */}
            {!requestsLoading && !requestsError && currentOrders.length === 0 && (
              <AnimatedErrorCard
                emoji="🚗"
                title="No repair requests yet"
                message="You'll see repair requests from customers here. Pull down to refresh!"
                gradientColors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
                textColor="text-blue-800"
              />
            )}
          </View>

          {/* <View className="h-10" /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MechanicHome;
