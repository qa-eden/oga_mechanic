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
import { driverRoutes } from "@/constants/routes";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";
import { useWallet, useEarnings } from "@/hooks/useUserProfile";
import { WalletTransaction } from "@/lib/api/user";
import { RefreshControl, ActivityIndicator } from "react-native";
import { format } from "date-fns";

const DriverEarnings = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const { 
    data: walletResponse, 
    isLoading: isWalletLoading, 
    refetch: refetchWallet, 
    isRefetching: isWalletRefetching 
  } = useWallet();

  const {
    data: earningsResponse,
    isLoading: isEarningsLoading,
    refetch: refetchEarnings,
    isRefetching: isEarningsRefetching
  } = useEarnings();

  const walletData = walletResponse?.data;
  const totalBalance = typeof walletData?.balance === 'string' ? parseFloat(walletData.balance) : (walletData?.balance || 0);
  const transactions: WalletTransaction[] = walletData?.transactions || [];

  const driverEarnings = earningsResponse?.data?.driver_earnings;
  const totalEarned = parseFloat(driverEarnings?.total_earnings || "0");
  const pendingEarned = parseFloat(driverEarnings?.pending_earnings || "0");
  const completedTrips = driverEarnings?.completed_tasks || 0;

  const isLoading = isWalletLoading || isEarningsLoading;
  const isRefetching = isWalletRefetching || isEarningsRefetching;

  const refetch = async () => {
    await Promise.all([refetchWallet(), refetchEarnings()]);
  };

  // Categorize transactions
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todayTransactions = transactions.filter((t: WalletTransaction) => new Date(t.created_at).toDateString() === today);
  const yesterdayTransactions = transactions.filter((t: WalletTransaction) => new Date(t.created_at).toDateString() === yesterday);
  const otherTransactions = transactions.filter((t: WalletTransaction) => {
    const d = new Date(t.created_at).toDateString();
    return d !== today && d !== yesterday;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <AnimatedPageContainer animationType="fadeInDown" duration={500}>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#B91C1C" />
          }
        >
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
              className="rounded-2xl py-8 mb-6"
            >
              <Text className="text-white text-sm font-NunitoMedium mb-2 mt-4 text-center">
                Available balance
              </Text>
              <View className="flex-row items-center justify-center mb-6">
                {showBalance ? (
                  <NairaCurrency
                    value={totalBalance}
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
              
              <View className="flex-row items-center justify-center w-full px-6 mb-4">
                <TouchableOpacity
                  onPress={() => setShowWithdrawModal(true)}
                  className="flex-row items-center justify-center w-full border border-white rounded-[.3rem] py-2"
                >
                  <Text className="text-white font-NunitoBold text-xs">Withdraw</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Summary Cards */}
            <View className="flex-row justify-between mb-6">
              <View className="bg-white p-4 rounded-xl border border-gray-100 w-[48%] shadow-sm">
                <Text className="text-gray-500 text-xs font-NunitoMedium mb-1">Pending Earnings</Text>
                <NairaCurrency 
                  value={pendingEarned} 
                  className="text-gray-900 text-lg font-NunitoBold" 
                />
              </View>
              <View className="bg-white p-4 rounded-xl border border-gray-100 w-[48%] shadow-sm">
                <Text className="text-gray-500 text-xs font-NunitoMedium mb-1">Completed Trips</Text>
                <Text className="text-gray-900 text-lg font-NunitoBold">{completedTrips}</Text>
              </View>
            </View>

            {/* Earnings Header */}
            <View className="flex-row items-center justify-between my-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Trip Earnings
              </Text>
              <TouchableOpacity onPress={() => router.push('/(root)/(screens)/(driver)/withdrawalHistory')}>
                <Text className="text-red-600 font-NunitoBold">
                  View withdrawals
                </Text>
              </TouchableOpacity>
            </View>

            {/* Trip Earnings List */}
            {transactions.length === 0 && !isLoading ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-500 font-NunitoMedium text-center">
                  No trip earnings yet
                </Text>
                <Text className="text-gray-400 font-NunitoRegular text-sm text-center mt-2">
                  Complete trips to start earning
                </Text>
              </View>
            ) : (
              <View>
                {/* Today Section */}
                {todayTransactions.length > 0 && (
                  <>
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4">
                      Today
                    </Text>
                    {todayTransactions.map((earning, index) => (
                      <View
                        key={`today-${earning.id || index}`}
                        className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-NunitoBold text-gray-900">
                             {earning.description || earning.reference || `Ref: ${earning.id.slice(0, 8)}`}
                          </Text>
                          <NairaCurrency
                            value={typeof earning.amount === 'string' ? parseFloat(earning.amount) : earning.amount}
                            className="text-lg font-NunitoBold text-gray-900"
                          />
                        </View>
                        <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                           {format(new Date(earning.created_at), "MMM dd, yyyy - h:mm a")}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                {/* Yesterday Section */}
                {yesterdayTransactions.length > 0 && (
                  <>
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4 mt-6">
                      Yesterday
                    </Text>
                    {yesterdayTransactions.map((earning, index) => (
                      <View
                        key={`yesterday-${earning.id || index}`}
                        className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-NunitoBold text-gray-900">
                             {earning.description || earning.reference || `Ref: ${earning.id.slice(0, 8)}`}
                          </Text>
                          <NairaCurrency
                            value={typeof earning.amount === 'string' ? parseFloat(earning.amount) : earning.amount}
                            className="text-lg font-NunitoBold text-gray-900"
                          />
                        </View>
                        <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                           {format(new Date(earning.created_at), "MMM dd, yyyy - h:mm a")}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                {/* Older Transactions Section */}
                {otherTransactions.length > 0 && (
                  <>
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4 mt-6">
                      Previous
                    </Text>
                    {otherTransactions.map((earning, index) => (
                      <View
                        key={`other-${earning.id || index}`}
                        className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-NunitoBold text-gray-900">
                             {earning.description || earning.reference || `Ref: ${earning.id.slice(0, 8)}`}
                          </Text>
                          <NairaCurrency
                            value={typeof earning.amount === 'string' ? parseFloat(earning.amount) : earning.amount}
                            className="text-lg font-NunitoBold text-gray-900"
                          />
                        </View>
                        <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                           {format(new Date(earning.created_at), "MMM dd, yyyy - h:mm a")}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                {isLoading && (
                  <View className="py-10">
                    <ActivityIndicator size="small" color="#B91C1C" />
                  </View>
                )}
              </View>
            )}

            <View className="h-20" />
          </View>
        </ScrollView>
      </AnimatedPageContainer>

      {/* Withdraw Funds Modal */}
      <WithdrawFundsModal
        isVisible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={totalBalance}
        confirmWithdrawalRoute="/(root)/(screens)/(driver)/confirmWithdrawal"
      />
    </SafeAreaView>
  );
};

export default DriverEarnings;