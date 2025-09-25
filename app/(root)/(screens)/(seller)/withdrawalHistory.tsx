"use client";

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ArrowLeftIcon } from "react-native-heroicons/outline";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";

const SellerWithdrawalHistory = () => {
  const withdrawalHistory = [
    // January 2025
    {
      id: "C079DB3D",
      month: "JANUARY 2025",
      withdrawals: [
        {
          id: "C079DB3D",
          amount: 50000,
          date: "Jan 15, 2025",
        },
        {
          id: "C079DB3D", 
          amount: 50000,
          date: "Jan 10, 2025",
        },
      ],
    },
    // February 2024
    {
      id: "FEB2024",
      month: "FEBRUARY 2024",
      withdrawals: [
        {
          id: "C079DB3D",
          amount: 75000,
          date: "Feb 28, 2024",
        },
        {
          id: "C079DB3D",
          amount: 30000,
          date: "Feb 15, 2024",
        },
      ],
    },
    // March 2024
    {
      id: "MAR2024",
      month: "MARCH 2024",
      withdrawals: [
        {
          id: "C079DB3D",
          amount: 30000,
          date: "Mar 25, 2024",
        },
        {
          id: "C079DB3D",
          amount: 175000,
          date: "Mar 20, 2024",
        },
        {
          id: "C079DB3D",
          amount: 15000,
          date: "Mar 15, 2024",
        },
        {
          id: "C079DB3D",
          amount: 7000,
          date: "Mar 5, 2024",
        },
      ],
    },
  ];

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
          Withdrawal history
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {withdrawalHistory.map((monthGroup) => (
          <View key={monthGroup.id} className="mb-6">
            {/* Month Header */}
            <View className="items-center py-6">
              <Text className="text-sm text-gray-500 font-NunitoMedium tracking-wider">
                {monthGroup.month}
              </Text>
            </View>

            {/* Withdrawals for this month */}
            {monthGroup.withdrawals.map((withdrawal, index) => (
              <View
                key={`${withdrawal.id}-${index}`}
                className="flex-row items-center justify-between py-4 border-b border-gray-100"
              >
                <View className="flex-1">
                  <Text className="font-NunitoBold text-gray-900 mb-1">
                    Withdraw to bank
                  </Text>
                  <Text className="text-sm text-gray-600 font-NunitoMedium">
                    Reference ID: {withdrawal.id}
                  </Text>
                </View>
                <View className="items-end">
                  <NairaCurrency
                    value={withdrawal.amount}
                    className="text-lg font-NunitoBold text-red-600"
                  />
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerWithdrawalHistory;
