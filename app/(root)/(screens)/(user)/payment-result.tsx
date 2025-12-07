"use client";

import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BackArrowBtn from "@/components/BackArrowBtn";
import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { useVerifyPayment } from "@/hooks/usePayment";
import { useEffect, useState } from "react";

const PaymentResult = () => {
  const params = useLocalSearchParams();

  const initialStatus = params.status as string; // 'success', 'failed', or 'pending'
  const orderId = params.orderId as string;
  const totalAmount = params.totalAmount as string;
  const paymentReference = params.paymentReference as string;
  const initialMessage = params.message as string;

  // Local state for status (can be updated after verification)
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState(initialMessage);
  const [isVerifying, setIsVerifying] = useState(initialStatus === 'pending');

  // Verify payment if status is pending
  const { data: verificationData, isLoading, error, refetch } = useVerifyPayment(
    paymentReference,
    { enabled: initialStatus === 'pending' && !!paymentReference }
  );

  // Update status based on verification result
  useEffect(() => {
    if (verificationData?.data) {
      const paymentStatus = verificationData.data.payment_status;
      if (paymentStatus === 'success') {
        setStatus('success');
        setMessage('Your payment has been verified successfully!');
      } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
        setStatus('failed');
        setMessage(verificationData.data.gateway_response || 'Payment was not completed.');
      }
      setIsVerifying(false);
    } else if (error) {
      setIsVerifying(false);
    }
  }, [verificationData, error]);

  const isSuccess = status === 'success';
  const isPending = status === 'pending';
  const isFailed = status === 'failed';

  const handleContinue = () => {
    if (isSuccess) {
      // Navigate to home or orders page
      router.replace(routes?.home);
    } else {
      // Navigate back to cart to retry payment
      router.replace(routes?.cart);
    }
  };

  const handleViewOrders = () => {
    // Navigate to orders page
    router.push(routes?.orderConfirmation);
  };

  const handleRetryVerification = () => {
    setIsVerifying(true);
    refetch();
  };

  // Get status display properties
  const getStatusConfig = () => {
    if (isVerifying || isLoading) {
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-500',
        titleColor: 'text-blue-600',
        icon: '⏳',
        title: 'Verifying Payment...',
        headerTitle: 'Payment Verification',
        headerSubtitle: 'Please wait',
        statusBgColor: 'bg-blue-100',
        statusTextColor: 'text-blue-600',
        statusText: 'Verifying',
      };
    }
    if (isSuccess) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-500',
        titleColor: 'text-green-600',
        icon: '✅',
        title: 'Payment Successful!',
        headerTitle: 'Payment Successful',
        headerSubtitle: 'Order confirmed',
        statusBgColor: 'bg-green-100',
        statusTextColor: 'text-green-600',
        statusText: 'Completed',
      };
    }
    if (isPending) {
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-500',
        titleColor: 'text-yellow-600',
        icon: '⏳',
        title: 'Payment Pending',
        headerTitle: 'Payment Pending',
        headerSubtitle: 'Awaiting confirmation',
        statusBgColor: 'bg-yellow-100',
        statusTextColor: 'text-yellow-600',
        statusText: 'Pending',
      };
    }
    return {
      bgColor: 'bg-red-100',
      textColor: 'text-red-500',
      titleColor: 'text-red-600',
      icon: '❌',
      title: 'Payment Failed',
      headerTitle: 'Payment Failed',
      headerSubtitle: 'Payment incomplete',
      statusBgColor: 'bg-red-100',
      statusTextColor: 'text-red-600',
      statusText: 'Failed',
    };
  };

  const statusConfig = getStatusConfig();

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
              {statusConfig.headerTitle}
            </Text>
            <Text className="text-sm text-gray-500">
              {statusConfig.headerSubtitle}
            </Text>
          </View>
          <View className="w-12" />
        </View>
      </LinearGradient>

      <View className="flex-1 px-5 py-8">
        {/* Status Icon */}
        <View className="items-center mb-8">
          <View
            className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${statusConfig.bgColor}`}
          >
            {(isVerifying || isLoading) ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : (
              <Text className={`text-4xl ${statusConfig.textColor}`}>
                {statusConfig.icon}
              </Text>
            )}
          </View>

          <Text className={`text-2xl font-NunitoExtraBold mb-2 ${statusConfig.titleColor}`}>
            {statusConfig.title}
          </Text>

          <Text className="text-base text-gray-600 text-center">
            {(isVerifying || isLoading)
              ? 'Please wait while we verify your payment status...'
              : message || (isSuccess
                ? 'Your payment has been processed successfully. Your order is being prepared.'
                : isPending
                  ? 'Your payment is being processed. Please check back later.'
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
                <View className={`px-3 py-1 rounded-full ${statusConfig.statusBgColor}`}>
                  <Text className={`text-sm font-NunitoBold ${statusConfig.statusTextColor}`}>
                    {statusConfig.statusText}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {!(isVerifying || isLoading) && (
          <View className="space-y-4">
            {/* Retry verification for pending status */}
            {isPending && (
              <CustomButton
                title="Check Payment Status"
                onPress={handleRetryVerification}
                className="py-4"
                bgVariant="secondary"
              />
            )}

            {isSuccess && (
              <CustomButton
                title="View Orders"
                onPress={handleViewOrders}
                className="py-4"
                bgVariant="secondary"
              />
            )}

            <CustomButton
              title={isSuccess ? "Continue Shopping" : isPending ? "Go to Home" : "Try Again"}
              onPress={handleContinue}
              className="py-4"
              bgVariant="primary"
            />
          </View>
        )}

        {/* Additional Info */}
        <View className="mt-8 p-4 bg-blue-50 rounded-xl">
          <Text className="text-sm text-blue-800 text-center">
            {(isVerifying || isLoading) ? (
              <>
                ⏳ Verifying your payment with the payment provider...{'\n'}
                Please do not close this screen.
              </>
            ) : isSuccess ? (
              <>
                📧 You'll receive an email confirmation shortly.{'\n'}
                🚚 Your order will be processed and shipped within 24 hours.
              </>
            ) : isPending ? (
              <>
                ⏳ Your payment is being processed.{'\n'}
                📱 You can check your order status in the Orders section.
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
