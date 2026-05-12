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
      <View className="flex-1 justify-center items-center bg-black/80 px-6">
        <View className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl overflow-hidden">
          {/* Success Icon */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-[32px] bg-gray-50 items-center justify-center mb-6 border border-gray-100">
              <CheckCircleIcon size={56} color="#111827" />
            </View>
            <Text className="text-3xl font-NunitoExtraBold text-gray-900 mb-2 text-center leading-tight">
              Request{'\n'}Received
            </Text>
            <Text className="text-sm text-gray-400 font-NunitoMedium text-center leading-5 px-2">
              {message || "Your request is being processed. We'll notify you once a specialist accepts."}
            </Text>
          </View>

          {/* Ticket ID */}
          {orderId && (
            <View className="mb-8">
              <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 relative overflow-hidden">
                <Text className="text-[10px] text-gray-400 font-NunitoExtraBold uppercase tracking-widest mb-1.5 text-center">
                  Reference ID
                </Text>
                <Text className="text-2xl font-NunitoExtraBold text-gray-900 text-center tracking-tight">
                  #{orderId.slice(0, 8).toUpperCase()}
                </Text>
                
                {/* Decorative cutouts */}
                <View className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border border-gray-100 -translate-y-3" />
                <View className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-gray-100 -translate-y-3" />
              </View>
            </View>
          )}

          {amount != null && (
            <View className="mb-8 items-center">
              <Text className="text-[10px] text-gray-400 font-NunitoExtraBold uppercase tracking-widest mb-1">
                Estimated Deposit
              </Text>
              <Text className="text-4xl font-NunitoExtraBold text-gray-900">
                ₦{amount.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-4">
            <CustomButton
              title="Track Progress"
              onPress={onTrackOrder}
              bgVariant="primary"
              className="h-14 bg-gray-900 rounded-2xl shadow-xl shadow-gray-200"
            />
            <TouchableOpacity
              onPress={onGoHome}
              className="h-14 rounded-2xl items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-NunitoExtraBold text-gray-400 uppercase tracking-widest">Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
