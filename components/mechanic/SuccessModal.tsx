import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import CustomButton from '@/components/CustomButton';

interface SuccessModalProps {
  visible: boolean;
  orderId: string | null;
  message?: string | null;
  estimatedCost?: string | number | null;
  onTrackOrder: () => void;
  onGoHome: () => void;
}

/**
 * Success confirmation modal component
 * Displays after successfully creating a repair request
 */
export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  orderId,
  message,
  estimatedCost,
  onTrackOrder,
  onGoHome,
}) => {
  const amount =
    estimatedCost != null && !Number.isNaN(Number(estimatedCost))
      ? Number(estimatedCost)
      : null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onGoHome}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl">
          {/* Success Icon */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-green-50 items-center justify-center mb-6 shadow-sm border border-green-100">
              <CheckCircleIcon size={56} color="#10B981" />
            </View>
            <Text className="text-3xl font-NunitoExtraBold text-gray-900 mb-3 text-center leading-tight">
              Request{'\n'}Submitted!
            </Text>
            <Text className="text-[17px] text-gray-500 font-NunitoMedium text-center leading-6 px-2">
              {message || "Your repair request has been successfully submitted."}
            </Text>
          </View>

          {/* Order ID Ticket */}
          {orderId && (
            <View className="mb-8 overflow-hidden">
              <View className="bg-primary-50/50 rounded-3xl p-5 border-2 border-dashed border-primary-200">
                <Text className="text-xs text-primary-500 font-NunitoExtraBold uppercase tracking-[2px] mb-2 text-center">
                  Ticket ID
                </Text>
                <Text className="text-2xl font-NunitoExtraBold text-primary-600 text-center tracking-tight">
                  #{orderId.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              
              {/* Decorative ticket punches */}
              <View className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border-r-2 border-gray-100 -translate-y-3" />
              <View className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-l-2 border-gray-100 -translate-y-3" />
            </View>
          )}

          {amount != null && (
            <View className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
              <Text className="text-xs text-red-700 font-NunitoExtraBold uppercase tracking-[1.5px] text-center mb-1">
                Estimated Cost
              </Text>
              <Text className="text-3xl font-NunitoExtraBold text-red-700 text-center">
                ₦{amount.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-4">
            <CustomButton
              title="Track Order"
              onPress={onTrackOrder}
              bgVariant="primary"
              className="py-5 rounded-2xl shadow-lg shadow-primary-200"
            />
            <TouchableOpacity
              onPress={onGoHome}
              className="py-4 rounded-2xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-base font-NunitoBold text-gray-400">Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
