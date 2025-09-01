import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { NairaCurrency } from '@/utils/useCurrencyFormatter';
import CustomButton from '@/components/CustomButton';
import BackArrowBtn from '@/components/BackArrowBtn';
import { router } from 'expo-router';

const DriverConfirmWithdrawal = () => {
  const withdrawalData = {
    amount: 50000,
    bankName: "First Bank",
    accountNumber: "1234567890",
    accountName: "John Doe",
    reference: "WD-" + Date.now(),
  };

  const handleConfirm = () => {
    // Handle withdrawal confirmation
    router.push('/(root)/(screens)/(driver)/withdrawalSuccess');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900 ml-4">
            Confirm Withdrawal
          </Text>

          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Success Icon */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <CheckCircleIcon size={40} color="#059669" />
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 text-center">
              Withdrawal Details
            </Text>
          </View>

          {/* Withdrawal Details Card */}
          <View className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <View className="space-y-4">
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Amount</Text>
                <NairaCurrency
                  value={withdrawalData.amount}
                  className="text-lg font-NunitoBold text-gray-900"
                />
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Bank Name</Text>
                <Text className="font-NunitoBold text-gray-900">{withdrawalData.bankName}</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Account Number</Text>
                <Text className="font-NunitoBold text-gray-900">{withdrawalData.accountNumber}</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Account Name</Text>
                <Text className="font-NunitoBold text-gray-900">{withdrawalData.accountName}</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-gray-600">Reference</Text>
                <Text className="font-NunitoBold text-gray-900">{withdrawalData.reference}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <CustomButton
              title="Confirm Withdrawal"
              onPress={handleConfirm}
              bgVariant="primary"
              textVariant="default"
            />
            
            <CustomButton
              title="Cancel"
              onPress={handleBack}
              bgVariant="outline"
              textVariant="outline"
              className="mt-4"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverConfirmWithdrawal;
