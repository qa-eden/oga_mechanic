"use client";

import React, { useState } from "react";
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

import { useWithdrawals } from "@/hooks/useUserProfile";
import { groupTransactionsByMonth } from "@/utils/dateFormatter";
import { RefreshControl, ActivityIndicator } from "react-native";
import WithdrawalFilterBar from "@/components/WithdrawalFilterBar";
import { WithdrawalFilters } from "@/lib/api/user";

const SellerWithdrawalHistory = () => {
  const [filters, setFilters] = useState<WithdrawalFilters>({});

  const { data: response, isLoading, refetch, isRefetching } = useWithdrawals(filters);
  const withdrawals = response?.data || [];

  const groupedWithdrawals = groupTransactionsByMonth(withdrawals);
  const months = Object.keys(groupedWithdrawals).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleGoBack = () => {
    router.back();
  };

  const handleFilterChange = (newFilters: WithdrawalFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#B91C1C" />
      </SafeAreaView>
    );
  }

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

      <WithdrawalFilterBar 
        onFilterChange={handleFilterChange} 
        activeFilters={filters}
      />

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#B91C1C" />
        }
      >
        {months.length === 0 && !isLoading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 font-NunitoMedium">No withdrawal history found</Text>
          </View>
        ) : (
          months.map((monthYear) => (
            <View key={monthYear} className="mb-6">
              {/* Month Header */}
              <View className="items-center py-6">
                <Text className="text-sm text-gray-500 font-NunitoMedium tracking-wider">
                  {monthYear}
                </Text>
              </View>

              {/* Withdrawals for this month */}
              {groupedWithdrawals[monthYear].map((withdrawal, index) => (
                <View
                  key={`${withdrawal.id}-${index}`}
                  className="flex-row items-center justify-between py-4 border-b border-gray-100"
                >
                  <View className="flex-1">
                    <Text className="font-NunitoBold text-gray-900 mb-1">
                      {withdrawal.description || "Withdraw to bank"}
                    </Text>
                    <Text className="text-sm text-gray-600 font-NunitoMedium">
                      Reference ID: {withdrawal.reference || String(withdrawal.id).slice(0, 8)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <NairaCurrency
                      value={typeof withdrawal.amount === 'string' ? parseFloat(withdrawal.amount) : withdrawal.amount}
                      className="text-lg font-NunitoBold text-red-600"
                    />
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerWithdrawalHistory;