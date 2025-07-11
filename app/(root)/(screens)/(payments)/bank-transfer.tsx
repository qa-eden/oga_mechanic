"use client";

import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { DocumentDuplicateIcon } from "react-native-heroicons/outline";
import * as Clipboard from "@react-native-clipboard/clipboard";
import CustomButton from "@/components/CustomButton";
import CartIconBtn from "@/components/CartIconBtn";
import BackArrowBtn from "@/components/BackArrowBtn";
import { useState } from "react";
import { routes } from "@/constants/routes";

const BankTransfer = () => {
  const params = useLocalSearchParams();
  const totalAmount = Number(params.totalAmount) || 252000;

  const bankDetails = {
    bankName: "Sterling bank",
    accountNumber: "3425618209",
    accountName: "OGA MECHANIC",
  };

  const copyToClipboard = (text: string) => {
    // Clipboard.setString(text)
    Alert.alert("Copied", "Account number copied to clipboard");
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleTransferComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push(routes?.paymentConfirm);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">Payment</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 py-6">
        {/* Bank Transfer Section */}
        <View className="mb-8">
          <Text className="text-2xl font-NunitoBold text-gray-900 mb-2">
            Bank transfer
          </Text>
          <Text className="text-base text-gray-500">
            Fund your wallet today for quick and easy payments
          </Text>
        </View>

        {/* Bank Icon */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
            <icons.bankIcon
              width={50}
              height={50}
              // style={{ marginRight: 16 }}
            />
          </View>
        </View>

        {/* Virtual Account Number Section */}
        <View className="mb-8">
          <Text className="text-xl font-NunitoBold text-gray-900 text-center mb-4">
            Virtual Account Number
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            Make a transfer to the account details below and your payment will
            be verified immediately
          </Text>
        </View>

        {/* Amount to Pay */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-lg text-green-600 font-NunitoMedium">
            Amount to pay
          </Text>
          <NairaCurrency
            value={totalAmount}
            className="text-2xl font-NunitoBold text-green-600"
          />
        </View>

        {/* Bank Details */}
        <View className="mb-8">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            {bankDetails.bankName}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-NunitoBold text-gray-900">
              {bankDetails.accountNumber}
            </Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(bankDetails.accountNumber)}
              className="w-10 h-10 items-center justify-center"
            >
              <DocumentDuplicateIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-base text-gray-600">
            Account name -{" "}
            <Text className="font-NunitoBold text-gray-900">
              {bankDetails.accountName}
            </Text>
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View className="px-5 pt-6 pb-[5rem] border-t border-gray-100">
        <CustomButton
          title={isLoading ? "Confirming payment..." : "I have transferred"}
          onPress={handleTransferComplete}
          className="py-4"
          bgVariant="primary"
          loading={isLoading}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default BankTransfer;
