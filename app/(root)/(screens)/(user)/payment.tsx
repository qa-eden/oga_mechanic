"use client";

import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import { WebView } from "react-native-webview";
import { useState } from "react";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";

const Payment = () => {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentUrl = params.paymentUrl as string;
  const orderId = params.orderId as string;
  const totalAmount = params.totalAmount as string;
  const paymentReference = params.paymentReference as string;

  const handleWebViewLoad = () => {
    setLoading(false);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('Failed to load payment page. Please try again.');
    setLoading(false);
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('Navigation URL:', url);
    
    // Check for payment success/failure URLs
    if (url.includes('success') || url.includes('callback') || url.includes('verify')) {
      // Navigate to success page
      router.push({
        pathname: "/(root)/(screens)/(user)/payment-result",
        params: {
          status: 'success',
          orderId: orderId,
          totalAmount: totalAmount,
          paymentReference: paymentReference,
          message: 'Your payment has been processed successfully!'
        }
      });
    } else if (url.includes('error') || url.includes('failed') || url.includes('cancel')) {
      // Navigate to failure page
      router.push({
        pathname: "/(root)/(screens)/(user)/payment-result",
        params: {
          status: 'failed',
          orderId: orderId,
          totalAmount: totalAmount,
          paymentReference: paymentReference,
          message: 'Payment was not completed. Please try again.'
        }
      });
    }
  };

  if (!paymentUrl) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-500 text-center text-lg mb-4">
            Payment URL not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
       <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">Payment</Text>
        <View className="w-10" />
      </View>


      {/* Loading State */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D30309" />
          <Text className="text-gray-600 mt-4">Loading payment page...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      {!error && (
        <WebView
          source={{ uri: paymentUrl }}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          onNavigationStateChange={handleNavigationStateChange}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Payment;
