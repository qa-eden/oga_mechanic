import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import CustomButton from '@/components/CustomButton';
import TextArea from '@/components/forms/TextArea';

interface CancelRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelReason: string;
  selectedCancelReason: string;
  onReasonChange: (reason: string) => void;
  onSelectedReasonChange: (reason: string) => void;
  isLoading?: boolean;
}

const cancelReasons = [
  'Found another mechanic',
  'Issue resolved myself',
  'Changed my mind',
  'Mechanic not available',
  'Scheduling conflict',
  'Other',
];

const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  visible,
  onClose,
  onConfirm,
  cancelReason,
  selectedCancelReason,
  onReasonChange,
  onSelectedReasonChange,
  isLoading = false,
}) => {
  const handleReasonSelect = (reason: string) => {
    onSelectedReasonChange(reason);
    if (reason !== 'Other') {
      onReasonChange('');
    }
  };

  const handleClose = () => {
    onClose();
    onSelectedReasonChange('');
    onReasonChange('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-white rounded-t-3xl min-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
              <Text className="text-xl font-NunitoBold text-gray-900">
                Cancel Request
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <XMarkIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <View className="p-6">
                <Text className="text-base font-NunitoSemiBold text-gray-600 mb-6">
                  Please let us know why you are cancelling this request.
                </Text>

                {/* Default Reasons */}
                <View className="mb-6">
                  {cancelReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      onPress={() => handleReasonSelect(reason)}
                      className={`p-4 mb-3 rounded-2xl border ${
                        selectedCancelReason === reason
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-100 bg-white'
                      }`}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${
                            selectedCancelReason === reason
                              ? 'border-gray-900 bg-gray-900'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedCancelReason === reason && (
                            <View className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </View>
                        <Text
                          className={`text-sm font-NunitoBold ${
                            selectedCancelReason === reason
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {reason}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* TextArea for Other/Additional Details */}
                {selectedCancelReason === 'Other' && (
                  <View className="mb-8">
                    <TextArea
                      label="Additional Details"
                      placeholder="Share more context with us..."
                      value={cancelReason}
                      onChangeText={onReasonChange}
                      rows={4}
                      required
                    />
                  </View>
                )}

                {/* Submit Button */}
                <View className="mt-4">
                  <CustomButton
                    title="Confirm Cancellation"
                    onPress={onConfirm}
                    bgVariant="primary"
                    className="h-14 bg-red-600"
                    disabled={isLoading || !selectedCancelReason || (selectedCancelReason === 'Other' && !cancelReason.trim())}
                    loading={isLoading}
                  />
                  <TouchableOpacity 
                    onPress={handleClose}
                    className="mt-4 items-center"
                  >
                    <Text className="text-sm font-NunitoBold text-gray-400">Keep My Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CancelRequestModal;

