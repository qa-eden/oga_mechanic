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
import { mechanicRoutes, routes } from "@/constants/routes";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";

const MechanicEarnings = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // TODO: Replace with actual API data when available
  const earningsData: { id: string; date: string; amount: number }[] = [];
  const yesterdayEarnings: { id: string; date: string; amount: number }[] = [];
  const totalBalance = 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <AnimatedPageContainer animationType="fadeInDown" duration={500}>
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
              <View className="flex-row items-center justify-center w-full gap-4 px-6">
                <TouchableOpacity
                  onPress={() => router.push(routes?.bankTransfer)}
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
                Earnings
              </Text>
              <TouchableOpacity onPress={() => router.push(mechanicRoutes?.WithdrawalHistory)}>
                <Text className="text-red-600 font-NunitoBold">
                  View withdrawals
                </Text>
              </TouchableOpacity>
            </View>

            {/* Earnings List */}
            {earningsData.length === 0 && yesterdayEarnings.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-gray-500 font-NunitoMedium text-center">
                  No earnings yet
                </Text>
                <Text className="text-gray-400 font-NunitoRegular text-sm text-center mt-2">
                  Complete repair jobs to start earning
                </Text>
              </View>
            ) : (
              <>
                {/* Today Section */}
                {earningsData.length > 0 && (
                  <>
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4">
                      Today
                    </Text>
                    {earningsData.map((earning, index) => (
                      <View
                        key={`today-${index}`}
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                      >
                        <View className="flex-1">
                          <Text className="font-NunitoBold text-gray-900 mb-1">
                            {earning.id}
                          </Text>
                          <Text className="text-sm text-gray-600 font-NunitoMedium">
                            {earning.date}
                          </Text>
                        </View>
                        <NairaCurrency
                          value={earning.amount}
                          className="text-lg font-NunitoBold text-gray-900"
                        />
                      </View>
                    ))}
                  </>
                )}

                {/* Yesterday Section */}
                {yesterdayEarnings.length > 0 && (
                  <>
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4 mt-6">
                      Yesterday
                    </Text>
                    {yesterdayEarnings.map((earning, index) => (
                      <View
                        key={`yesterday-${index}`}
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                      >
                        <View className="flex-1">
                          <Text className="font-NunitoBold text-gray-900 mb-1">
                            {earning.id}
                          </Text>
                          <Text className="text-sm text-gray-600 font-NunitoMedium">
                            {earning.date}
                          </Text>
                        </View>
                        <NairaCurrency
                          value={earning.amount}
                          className="text-lg font-NunitoBold text-gray-900"
                        />
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </AnimatedPageContainer>

      {/* Withdraw Funds Modal */}
      <WithdrawFundsModal
        isVisible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={totalBalance}
      />
    </SafeAreaView>
  );
};

export default MechanicEarnings;
