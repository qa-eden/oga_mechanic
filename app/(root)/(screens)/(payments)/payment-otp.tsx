/**
 * @deprecated This screen is DEPRECATED and should NOT be used.
 *
 * SECURITY WARNING: This screen has simulated OTP verification without
 * actual API integration. OTP verification should be handled by the
 * payment gateway, not the app.
 */

import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";

const PaymentOTP = () => {
  const router = useRouter();

  useEffect(() => {
    console.warn("[DEPRECATED] PaymentOTP screen is deprecated.");
  }, []);

  const handleGoToCart = () => {
    router.replace(routes?.cart);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">Payment</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 py-6 items-center justify-center">
        {/* Deprecation Notice */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <Text className="text-2xl font-NunitoBold text-yellow-800 mb-4 text-center">
            ⚠️ Verification Unavailable
          </Text>
          <Text className="text-base text-yellow-700 text-center mb-4">
            This verification method is no longer available.
          </Text>
          <Text className="text-sm text-yellow-600 text-center">
            OTP verification is now handled securely through our payment gateway.
          </Text>
        </View>

        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <Text className="text-base font-NunitoBold text-blue-800 mb-2 text-center">
            🔒 Secure Verification
          </Text>
          <Text className="text-sm text-blue-700 text-center">
            All payment verifications are handled securely by our payment provider.
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View className="px-5 pt-6 pb-[5rem] border-t border-gray-100">
        <CustomButton
          title="Go to Cart"
          onPress={handleGoToCart}
          className="py-4"
          bgVariant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

export default PaymentOTP;
