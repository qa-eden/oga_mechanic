"use client";

import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BackArrowBtn from "@/components/BackArrowBtn";
import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";

const PaymentResult = () => {
  const params = useLocalSearchParams();
  
  const status = params.status as string; // 'success' or 'failed'
  const orderId = params.orderId as string;
  const totalAmount = params.totalAmount as string;
  const paymentReference = params.paymentReference as string;
  const message = params.message as string;

  const isSuccess = status === 'success';

  const handleContinue = () => {
    if (isSuccess) {
      // Navigate to home or orders page
      router.push(routes?.home);
    } else {
      // Navigate back to cart to retry payment
      router.push(routes?.cart);
    }
  };

  const handleViewOrders = () => {
    // Navigate to orders page
    router.push(routes?.orderConfirmation);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        className="border-b border-gray-100"
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <BackArrowBtn />
          <View className="items-center">
            <Text className="text-xl font-NunitoExtraBold text-gray-900">
              Payments {isSuccess ? 'Successful' : 'Failed'}
            </Text>
            <Text className="text-sm text-gray-500">
              {isSuccess ? 'Order confirmed' : 'Payment incomplete'}
            </Text>
          </View>
          <View className="w-12" />
        </View>
      </LinearGradient>

      <View className="flex-1 px-5 py-8">
        {/* Status Icon */}
        <View className="items-center mb-8">
          <View 
            className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <Text className={`text-4xl ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
              {isSuccess ? '✅' : '❌'}
            </Text>
          </View>
          
          <Text className={`text-2xl font-NunitoExtraBold mb-2 ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </Text>
          
          <Text className="text-base text-gray-600 text-center">
            {message || (isSuccess 
              ? 'Your payment has been processed successfully. Your order is being prepared.' 
              : 'There was an issue processing your payment. Please try again.')}
          </Text>
        </View>

        {/* Order Details */}
        {orderId && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
              Order Details
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-gray-600">Order ID</Text>
                <Text className="text-base font-NunitoMedium text-gray-900">
                  {orderId}
                </Text>
              </View>
              
              {paymentReference && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-600">Reference</Text>
                  <Text className="text-base font-NunitoMedium text-gray-900">
                    {paymentReference}
                  </Text>
                </View>
              )}
              
              {totalAmount && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-600">Amount</Text>
                  <NairaCurrency
                    value={parseFloat(totalAmount)}
                    className="text-base font-NunitoBold text-gray-900"
                  />
                </View>
              )}
              
              <View className="h-px bg-gray-200 my-3" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-gray-600">Status</Text>
                <View className={`px-3 py-1 rounded-full ${
                  isSuccess ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Text className={`text-sm font-NunitoBold ${
                    isSuccess ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isSuccess ? 'Completed' : 'Failed'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-4">
          {isSuccess && (
            <CustomButton
              title="View Orders"
              onPress={handleViewOrders}
              className="py-4"
              bgVariant="secondary"
            />
          )}
          
          <CustomButton
            title={isSuccess ? "Continue Shopping" : "Try Again"}
            onPress={handleContinue}
            className="py-4"
            bgVariant="primary"
          />
        </View>

        {/* Additional Info */}
        <View className="mt-8 p-4 bg-blue-50 rounded-xl">
          <Text className="text-sm text-blue-800 text-center">
            {isSuccess ? (
              <>
                📧 You'll receive an email confirmation shortly.{'\n'}
                🚚 Your order will be processed and shipped within 24 hours.
              </>
            ) : (
              <>
                💡 Check your internet connection and try again.{'\n'}
                💳 Make sure your payment method has sufficient funds.
              </>
            )}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentResult;
