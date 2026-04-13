import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NairaCurrency } from '@/utils/useCurrencyFormatter';
import BackArrowBtn from '@/components/BackArrowBtn';

import { useWithdrawals } from "@/hooks/useUserProfile";
import { groupTransactionsByMonth } from "@/utils/dateFormatter";
import { RefreshControl, ActivityIndicator } from "react-native";
import WithdrawalFilterBar from "@/components/WithdrawalFilterBar";
import { WithdrawalFilters } from "@/lib/api/user";

const WithdrawalHistory = () => {
  const [filters, setFilters] = useState<WithdrawalFilters>({});

  const { data: response, isLoading, refetch, isRefetching } = useWithdrawals(filters);
  const withdrawals = response?.data || [];

  const groupedWithdrawals = groupTransactionsByMonth(withdrawals);
  const months = Object.keys(groupedWithdrawals).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

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

      <WithdrawalFilterBar 
        onFilterChange={handleFilterChange} 
        activeFilters={filters}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#B91C1C" />
        }
      >
        <View className="px-5 py-6">
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
                    className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-NunitoBold text-gray-900">
                        {withdrawal.description || "Withdraw to bank"}
                      </Text>
                      <NairaCurrency
                        value={typeof withdrawal.amount === 'string' ? parseFloat(withdrawal.amount) : withdrawal.amount}
                        className="text-lg font-NunitoBold text-red-600"
                      />
                    </View>
                    <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                      Reference ID: {withdrawal.reference || String(withdrawal.id).slice(0, 8)}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-500">
                        Bank Transfer
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${withdrawal.status?.toLowerCase() === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Text className={`text-xs font-NunitoBold ${withdrawal.status?.toLowerCase() === 'completed' ? 'text-green-700' : 'text-gray-700'}`}>
                          {withdrawal.status || "Completed"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawalHistory;
