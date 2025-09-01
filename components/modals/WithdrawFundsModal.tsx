"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import CustomButton from "../CustomButton";
import { router } from "expo-router";
import { mechanicRoutes } from "@/constants/routes";

const { width } = Dimensions.get("window");

interface WithdrawFundsModalProps {
  isVisible: boolean;
  onClose: () => void;
  availableBalance: number;
  confirmWithdrawalRoute?: string; // Add route prop
}

const WithdrawFundsModal = ({
  isVisible,
  onClose,
  availableBalance,
  confirmWithdrawalRoute = mechanicRoutes?.ConfirmWithdrawal, // Default to mechanic route
}: WithdrawFundsModalProps) => {
  const [withdrawAmount, setWithdrawAmount] = useState("50,000");
  const [selectedAmount, setSelectedAmount] = useState("50,000");

  const quickAmounts = ["20,000", "30,000", "40,000", "50,000"];

  const handleQuickAmount = (amount: string) => {
    const numericAmount = parseFloat(amount.replace(/,/g, ""));
    if (numericAmount <= availableBalance) {
      setSelectedAmount(amount);
      setWithdrawAmount(amount);
    } else {
      Alert.alert("Invalid Amount", "Amount cannot exceed available balance");
    }
  };

  const handleWithdraw = () => {
    const numericAmount = parseFloat(withdrawAmount.replace(/,/g, ""));
    if (numericAmount > availableBalance) {
      Alert.alert("Invalid Amount", "Amount cannot exceed available balance");
      return;
    }
    if (numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }
    // Handle withdrawal logic here
    onClose(); // Close modal first
    setTimeout(() => {
      router.push(confirmWithdrawalRoute);
    }, 100); // Small delay to ensure modal closes
  };

  const formatAmount = (text: string) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, "");

    // Add commas for thousands
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return "";
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    const numericAmount = parseFloat(formatted.replace(/,/g, ""));

    // Check if amount exceeds available balance
    if (numericAmount > availableBalance) {
      Alert.alert("Invalid Amount", "Amount cannot exceed available balance");
      return;
    }

    setWithdrawAmount(formatted);
    setSelectedAmount(""); // Clear selection when typing
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-white">
        {/* Header with manual status bar padding */}
        <View
          className="bg-white border-b border-gray-100"
          style={{ paddingTop: Platform.OS === 'ios' ? 50 : 20 }}
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              activeOpacity={0.7}
            >
              <XMarkIcon size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-NunitoBold text-gray-900">
              Withdraw funds
            </Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Main Content */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Available Balance */}
            <View className="items-center py-6">
              <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
                Available Balance
              </Text>
              <NairaCurrency
                value={availableBalance}
                className="text-lg font-NunitoBold text-gray-900"
              />
            </View>

            {/* Amount Input */}
            <View className="items-center py-8">
              <Text className="text-sm text-gray-600 font-NunitoMedium mb-4">
                Enter amount to withdraw
              </Text>
              <View className="flex-row items-center">
                <Text
                  className="font-NunitoBold text-red-600 mr-2"
                  style={{ fontSize: Math.min(24, width * 0.06) }}
                >
                  ₦
                </Text>
                <TextInput
                  value={withdrawAmount}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  keyboardType="numeric"
                  className="font-NunitoBold text-red-600 text-center border-b-2 border-red-600 pb-2"
                  style={{
                    fontSize: Math.min(48, width * 0.12),
                    minWidth: width * 0.4,
                  }}
                  maxLength={10}
                  autoFocus
                />
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View className="flex-row justify-between mb-8 px-2">
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleQuickAmount(amount)}
                  style={{
                    paddingHorizontal: width * 0.03,
                    paddingVertical: 10,
                  }}
                  className={`rounded-xl border-2 ${
                    selectedAmount === amount
                      ? "border-red-600 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-NunitoBold text-center ${
                      selectedAmount === amount
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                    style={{ fontSize: Math.min(14, width * 0.035) }}
                  >
                    ₦{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Flexible spacer */}
            <View style={{ minHeight: 70 }} />
          </ScrollView>

          <View className="px-5 pb-10 pt-4 bg-white border-t border-gray-100">
            <CustomButton title="Withdraw Now" onPress={handleWithdraw} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default WithdrawFundsModal;
