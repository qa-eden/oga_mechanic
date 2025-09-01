"use client";

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { EyeIcon, EyeSlashIcon } from "react-native-heroicons/outline";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import WithdrawFundsModal from "@/components/modals/WithdrawFundsModal";
import { router } from "expo-router";
import { riderRoutes } from "@/constants/routes";

const RiderEarnings = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const earningsData = [
    {
      id: "#0CAC6C64",
      date: "April 14, 2025 - 2:53 PM",
      amount: 15000,
      tripType: "Round Trip",
      distance: "85 km",
      duration: "3h 00min",
    },
    {
      id: "#0CAC6C65",
      date: "April 14, 2025 - 10:30 AM",
      amount: 8500,
      tripType: "One Way",
      distance: "45 km",
      duration: "1h 45min",
    },
    {
      id: "#0CAC6C66",
      date: "April 14, 2025 - 8:15 AM",
      amount: 12000,
      tripType: "Round Trip",
      distance: "65 km",
      duration: "2h 30min",
    },
    {
      id: "#0CAC6C67",
      date: "April 14, 2025 - 6:45 AM",
      amount: 9500,
      tripType: "One Way",
      distance: "52 km",
      duration: "2h 00min",
    },
  ];

  const yesterdayEarnings = [
    {
      id: "#0CAC6C68",
      date: "April 13, 2025 - 9:20 PM",
      amount: 18000,
      tripType: "Round Trip",
      distance: "95 km",
      duration: "3h 30min",
    },
    {
      id: "#0CAC6C69",
      date: "April 13, 2025 - 4:15 PM",
      amount: 11000,
      tripType: "One Way",
      distance: "70 km",
      duration: "2h 45min",
    },
    {
      id: "#0CAC6C70",
      date: "April 13, 2025 - 1:30 PM",
      amount: 13500,
      tripType: "Round Trip",
      distance: "78 km",
      duration: "3h 00min",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4 bg-white">
          <Text className="text-xl font-NunitoBold text-gray-900 text-center">
            Earnings
          </Text>
        </View>

        <View className="px-5 py-6">
          {/* Balance Card */}
          <LinearGradient
            colors={["#991B1B", "#B91C1C", "#DC2626"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16 }}
            className="rounded-2xl py-10 mb-6"
          >
            <Text className="text-white text-sm font-NunitoMedium mb-2 mt-4 text-center">
              Your balance
            </Text>
            <View className="flex-row items-center justify-center mb-4">
              {showBalance ? (
                <NairaCurrency
                  value={45000}
                  className="text-white text-3xl font-NunitoBold"
                />
              ) : (
                <Text className="text-white text-3xl font-NunitoBold">
                  ₦******
                </Text>
              )}
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                className="ml-3"
              >
                {showBalance ? (
                  <EyeIcon size={20} color="white" />
                ) : (
                  <EyeSlashIcon size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-center w-full gap-4 px-6">
              <TouchableOpacity
                onPress={() => router.push('/(root)/(screens)/(rider)/bank-transfer')}
                className="flex-row items-center justify-center mb-6 w-[50%] bg-white border border-white rounded-[.3rem] py-2"
              >
                <Text className="text-[#991B1B] font-NunitoBold mr-2">Fund wallet</Text>
                <Text className="text-[#991B1B]">→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(true)}
                className="flex-row items-center justify-center mb-6 w-[50%] border border-white rounded-lg py-2 rounded-[.3rem]"
              >
                <Text className="text-white font-NunitoBold mr-2">Withdraw</Text>
                <Text className="text-white">→</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Earnings Header */}
          <View className="flex-row items-center justify-between my-4">
            <Text className="text-lg font-NunitoBold text-gray-900">
              Trip Earnings
            </Text>
            <TouchableOpacity onPress={() => router.push('/(root)/(screens)/(rider)/withdrawalHistory')}>
              <Text className="text-red-600 font-NunitoBold">
                View withdrawals
              </Text>
            </TouchableOpacity>
          </View>

          {/* Today Section */}
          <Text className="text-base font-NunitoBold text-gray-900 mb-4">
            Today
          </Text>

          {earningsData.map((earning, index) => (
            <View
              key={`today-${index}`}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-NunitoBold text-gray-900">
                  {earning.id}
                </Text>
                <NairaCurrency
                  value={earning.amount}
                  className="text-lg font-NunitoBold text-gray-900"
                />
              </View>
              <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                {earning.date}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <Text className="text-xs text-gray-500">
                    {earning.tripType}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {earning.distance}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {earning.duration}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/(root)/(screens)/(rider)/trip-completed',
                    params: { tripId: earning.id }
                  })}
                >
                  <Text className="text-red-600 text-xs font-NunitoBold">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Yesterday Section */}
          <Text className="text-base font-NunitoBold text-gray-900 mb-4 mt-6">
            Yesterday
          </Text>

          {yesterdayEarnings.map((earning, index) => (
            <View
              key={`yesterday-${index}`}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-NunitoBold text-gray-900">
                  {earning.id}
                </Text>
                <NairaCurrency
                  value={earning.amount}
                  className="text-lg font-NunitoBold text-gray-900"
                />
              </View>
              <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                {earning.date}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <Text className="text-xs text-gray-500">
                    {earning.tripType}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {earning.distance}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {earning.duration}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/(root)/(screens)/(rider)/trip-completed',
                    params: { tripId: earning.id }
                  })}
                >
                  <Text className="text-red-600 text-xs font-NunitoBold">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Withdraw Funds Modal */}
      <WithdrawFundsModal
        isVisible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={45000}
        confirmWithdrawalRoute="/(root)/(screens)/(rider)/confirmWithdrawal"
      />
    </SafeAreaView>
  );
};

export default RiderEarnings;