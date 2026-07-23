
/**
 * @deprecated This screen is DEPRECATED and should NOT be used for checkout payments.
 *
 * SECURITY WARNING: This screen has hardcoded bank details and simulated payment
 * confirmation which is insecure. Payment verification should always be done
 * server-side.
 *
 * Use the secure payment flow instead:
 * 1. Call checkout API with payment_method: 'online'
 * 2. Navigate to payment.tsx with the payment_url from the response
 * 3. The WebView will handle the payment securely through the payment gateway
 *
 * This screen is kept only for reference and will redirect users to the cart.
 */

import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import BackArrowBtn from "@/components/BackArrowBtn";
import { useEffect } from "react";
import { routes } from "@/constants/routes";

const BankTransfer = () => {
  // Log deprecation warning on mount
  useEffect(() => {
    console.warn(
      '[DEPRECATED] BankTransfer screen is deprecated. ' +
      'Hardcoded bank details and simulated confirmation are insecure. ' +
      'Use the secure payment flow via payment.tsx instead.'
    );
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
            ⚠️ Payment Method Unavailable
          </Text>
          <Text className="text-base text-yellow-700 text-center mb-4">
            Manual bank transfer for checkout is no longer available.
          </Text>
          <Text className="text-sm text-yellow-600 text-center">
            Please use our secure online payment option which supports bank transfers,
            cards, and other payment methods through our trusted payment gateway.
          </Text>
        </View>

        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <Text className="text-base font-NunitoBold text-blue-800 mb-2 text-center">
            🔒 Secure Payment
          </Text>
          <Text className="text-sm text-blue-700 text-center">
            All payments are processed securely through our payment provider
            with automatic verification.
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

export default BankTransfer;
