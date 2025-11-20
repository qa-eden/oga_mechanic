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

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="p-5">
                <Text className="text-base font-NunitoMedium text-gray-700 mb-4">
                  Please provide a reason for cancelling this request:
                </Text>

                {/* Default Reasons */}
                <View className="mb-4">
                  {cancelReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      onPress={() => handleReasonSelect(reason)}
                      className={`p-4 mb-2 rounded-xl border-2 ${
                        selectedCancelReason === reason
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white'
                      }`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                            selectedCancelReason === reason
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedCancelReason === reason && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>
                        <Text
                          className={`text-base font-NunitoMedium ${
                            selectedCancelReason === reason
                              ? 'text-primary-700'
                              : 'text-gray-900'
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
                  <View className="mb-4">
                    <TextArea
                      label="Please provide reason"
                      placeholder="Why are you cancelling this request?"
                      value={cancelReason}
                      onChangeText={onReasonChange}
                      rows={4}
                      required
                    />
                  </View>
                )}

                {/* Submit Button */}
                <View className="flex-row gap-2 space-x-3 pb-[2rem]">
                  <View className="flex-1">
                    <CustomButton
                      title="Cancel"
                      onPress={handleClose}
                      bgVariant="outline"
                      textVariant="outline"
                      className="py-3"
                    />
                  </View>
                  <View className="flex-1">
                    <CustomButton
                      title="Confirm Cancellation"
                      onPress={onConfirm}
                      bgVariant="danger"
                      className="py-3"
                      disabled={isLoading || !selectedCancelReason || (selectedCancelReason === 'Other' && !cancelReason.trim())}
                      loading={isLoading}
                    />
                  </View>
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

