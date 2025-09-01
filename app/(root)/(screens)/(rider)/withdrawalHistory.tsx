import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NairaCurrency } from '@/utils/useCurrencyFormatter';
import BackArrowBtn from '@/components/BackArrowBtn';

const RiderWithdrawalHistory = () => {
  const withdrawalData = [
    {
      id: "#WD001",
      date: "April 14, 2025 - 2:53 PM",
      amount: 25000,
      status: "Completed",
      method: "Bank Transfer",
    },
    {
      id: "#WD002",
      date: "April 13, 2025 - 10:30 AM",
      amount: 15000,
      status: "Completed",
      method: "Bank Transfer",
    },
    {
      id: "#WD003",
      date: "April 12, 2025 - 8:15 AM",
      amount: 20000,
      status: "Completed",
      method: "Bank Transfer",
    },
    {
      id: "#WD004",
      date: "April 11, 2025 - 6:45 AM",
      amount: 18000,
      status: "Completed",
      method: "Bank Transfer",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900 ml-4">
            Withdrawal History
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {withdrawalData.map((withdrawal, index) => (
            <View
              key={`withdrawal-${index}`}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-NunitoBold text-gray-900">
                  {withdrawal.id}
                </Text>
                <NairaCurrency
                  value={withdrawal.amount}
                  className="text-lg font-NunitoBold text-gray-900"
                />
              </View>
              <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                {withdrawal.date}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">
                  {withdrawal.method}
                </Text>
                <View className="px-2 py-1 bg-green-100 rounded-full">
                  <Text className="text-xs text-green-700 font-NunitoBold">
                    {withdrawal.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RiderWithdrawalHistory;
