import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BackArrowBtn from '@/components/BackArrowBtn';

const DriverBankTransfer = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900 ml-4">
            Fund Wallet
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          <View className="bg-white rounded-xl p-6 border border-gray-200">
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4 text-center">
              Bank Transfer Details
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Bank Name</Text>
                <Text className="font-NunitoBold text-gray-900">Oga Mechanic Bank</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Account Number</Text>
                <Text className="font-NunitoBold text-gray-900">1234567890</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600">Account Name</Text>
                <Text className="font-NunitoBold text-gray-900">Oga Mechanic Driver Wallet</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-gray-600">Reference</Text>
                <Text className="font-NunitoBold text-gray-900">DRIVER-{Date.now()}</Text>
              </View>
            </View>
            
            <View className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Text className="text-sm text-yellow-800 font-NunitoMedium">
                💡 Please use the reference number above when making your transfer. 
                Your wallet will be credited within 24 hours after confirmation.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverBankTransfer;
