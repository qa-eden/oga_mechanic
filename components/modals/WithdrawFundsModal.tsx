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
import { CheckCircleIcon, PlusIcon } from "react-native-heroicons/solid";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import CustomButton from "../CustomButton";
import { router } from "expo-router";
import { mechanicRoutes, sellerRoutes } from "@/constants/routes";
import AndroidNavBarSpacer from "../AndroidNavBarSpacer";
import { useBankAccounts, useWithdrawFunds } from "@/hooks/useUserProfile";
import AddBankModal from "@/components/modals/AddBankModal";

const { width } = Dimensions.get("window");

interface WithdrawFundsModalProps {
  isVisible: boolean;
  onClose: () => void;
  availableBalance: number;
  confirmWithdrawalRoute?: string; // Add route prop
  userType?: 'mechanic' | 'seller' | 'driver' | 'rider'; // Add user type for dynamic routing
}

const WithdrawFundsModal = ({
  isVisible,
  onClose,
  availableBalance,
  confirmWithdrawalRoute,
  userType = 'mechanic', // Default to mechanic for backward compatibility
}: WithdrawFundsModalProps) => {
  // Auto-determine route if not provided
  const getDefaultRoute = () => {
    if (confirmWithdrawalRoute) return confirmWithdrawalRoute;
    
    switch (userType) {
      case 'seller':
        return sellerRoutes?.ConfirmWithdrawal;
      case 'mechanic':
      case 'driver':
      case 'rider':
      default:
        return mechanicRoutes?.ConfirmWithdrawal;
    }
  };

  const withdrawalRoute = getDefaultRoute();
  const [withdrawAmount, setWithdrawAmount] = useState("50,000");
  const [selectedAmount, setSelectedAmount] = useState("50,000");
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const { data: banksResponse, isLoading: isLoadingBanks } = useBankAccounts(isVisible);
  const bankAccounts = banksResponse?.data || [];
  
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawFunds();

  const quickAmounts = ["20,000", "30,000", "40,000", "50,000"];

  // Set default bank if available
  React.useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankAccountId) {
      setSelectedBankAccountId(String(bankAccounts[0].id));
    }
  }, [bankAccounts, selectedBankAccountId]);

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
    if (numericAmount < 1000) {
      Alert.alert("Invalid Amount", "Minimum withdrawal amount is ₦1,000");
      return;
    }
    if (!selectedBankAccountId) {
      Alert.alert("Account Required", "Please select a bank account to receive funds");
      return;
    }

    withdraw(
      {
        amount: numericAmount,
        bank_account_id: selectedBankAccountId,
        description: description || `Withdrawal of ₦${withdrawAmount}`
      },
      {
        onSuccess: () => {
          onClose(); // Close modal first
          setTimeout(() => {
            router.push(withdrawalRoute);
          }, 100);
        },
        onError: (error: any) => {
          const errMsg = error?.response?.data?.message || "Something went wrong. Please try again.";
          Alert.alert("Withdrawal Failed", errMsg);
        }
      }
    );
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

  const handleAddBankAccount = () => {
    setShowAddBankModal(true);
  };

  return (
    <Modal
        visible={isVisible}
        animationType="slide"
        onRequestClose={onClose}
        presentationStyle="fullScreen"
      >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View
          className="bg-white border-b border-gray-100"
          style={{ paddingTop: Platform.OS === 'ios' ? 50 : 20 }}
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              activeOpacity={0.7}
              disabled={isWithdrawing}
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
                  editable={!isWithdrawing}
                />
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View className="flex-row justify-between mb-10 px-2">
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => handleQuickAmount(amount)}
                  style={{
                    paddingHorizontal: width * 0.03,
                    paddingVertical: 10,
                  }}
                  disabled={isWithdrawing}
                  className={`rounded-xl border-2 ${
                    selectedAmount === amount
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 bg-white"
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

            {/* Bank Selection */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-NunitoBold text-gray-900">
                  Select Receiving Bank
                </Text>
                <TouchableOpacity onPress={handleAddBankAccount}>
                  <Text className="text-red-600 font-NunitoBold text-sm">Add New</Text>
                </TouchableOpacity>
              </View>

              {isLoadingBanks ? (
                <View className="py-4 items-center">
                  <Text className="text-gray-400 font-NunitoMedium">Loading accounts...</Text>
                </View>
              ) : bankAccounts.length === 0 ? (
                <TouchableOpacity 
                  onPress={handleAddBankAccount}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center justify-center"
                >
                  <PlusIcon size={24} color="#9CA3AF" />
                  <Text className="text-gray-500 font-NunitoMedium mt-2 text-center">
                    No bank account found. Click to add one.
                  </Text>
                </TouchableOpacity>
              ) : (
                bankAccounts.map((account: any) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => setSelectedBankAccountId(String(account.id))}
                    disabled={isWithdrawing}
                    className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border-2 ${
                      selectedBankAccountId === String(account.id)
                        ? "border-red-600 bg-red-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="font-NunitoBold text-gray-900 text-base">
                        {account.bank_name}
                      </Text>
                      <Text className="text-gray-500 font-NunitoMedium text-sm">
                        {account.account_number} • {account.account_type || 'Savings'}
                      </Text>
                    </View>
                    {selectedBankAccountId === String(account.id) && (
                      <CheckCircleIcon size={24} color="#B91C1C" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Optional Description */}
            <View className="mb-10">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
                Description (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. For personal use"
                className="bg-gray-50 rounded-2xl p-4 font-NunitoMedium text-gray-900 border border-gray-100"
                multiline
                numberOfLines={2}
                disabled={isWithdrawing}
              />
            </View>

            {/* Flexible spacer */}
            <View style={{ minHeight: 40 }} />
          </ScrollView>

          <View className="px-5 pb-10 pt-4 bg-white border-t border-gray-100">
            <CustomButton 
              title={isWithdrawing ? "Processing..." : "Withdraw Now"} 
              onPress={handleWithdraw} 
              disabled={isWithdrawing || !selectedBankAccountId}
              loading={isWithdrawing}
            />
            {/* Android Navigation Bar Spacer */}
            <AndroidNavBarSpacer />
          </View>
        </KeyboardAvoidingView>

        {/* Nesting the AddBankModal inside the main Modal to ensure it shows over it on iOS */}
        <AddBankModal 
          isVisible={showAddBankModal}
          onClose={() => setShowAddBankModal(false)}
        />
      </View>
    </Modal>
  );
};

export default WithdrawFundsModal;
