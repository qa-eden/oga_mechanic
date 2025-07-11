"use client";

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { routes } from "@/constants/routes";

const Payment = () => {
  const handlePayment = () => {
    // Handle payment logic
    console.log("Processing payment...");
    // Navigate to success page or back to home
    router.push(routes?.home);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <icons.backBtn />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">Payment</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Order Summary */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            Order Summary
          </Text>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-gray-600">Items (2)</Text>
            <NairaCurrency
              value={250000}
              className="text-base font-NunitoMedium text-gray-900"
            />
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-gray-600">Delivery fee</Text>
            <NairaCurrency
              value={2000}
              className="text-base font-NunitoMedium text-gray-900"
            />
          </View>

          <View className="h-px bg-gray-200 my-3" />

          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-NunitoBold text-gray-900">Total</Text>
            <NairaCurrency
              value={252000}
              className="text-xl font-NunitoExtraBold text-primary-500"
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mb-6">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            Payment Method
          </Text>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-8 bg-blue-600 rounded mr-3 items-center justify-center">
                <Text className="text-white text-xs font-bold">VISA</Text>
              </View>
              <Text className="text-base font-NunitoMedium text-gray-900">
                **** 1234
              </Text>
            </View>
            <View className="w-5 h-5 border-2 border-primary-500 rounded-full bg-primary-500" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-8 bg-orange-500 rounded mr-3 items-center justify-center">
                <Text className="text-white text-xs font-bold">MC</Text>
              </View>
              <Text className="text-base font-NunitoMedium text-gray-900">
                **** 5678
              </Text>
            </View>
            <View className="w-5 h-5 border-2 border-gray-300 rounded-full" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
            <View className="flex-row items-center">
              <View className="w-12 h-8 bg-green-600 rounded mr-3 items-center justify-center">
                <Text className="text-white text-xs font-bold">PAY</Text>
              </View>
              <Text className="text-base font-NunitoMedium text-gray-900">
                PayPal
              </Text>
            </View>
            <View className="w-5 h-5 border-2 border-gray-300 rounded-full" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View className="px-5 py-6 border-t border-gray-100">
        <CustomButton
          title="Pay NGN 252,000"
          onPress={handlePayment}
          className="py-4"
          bgVariant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

export default Payment;
