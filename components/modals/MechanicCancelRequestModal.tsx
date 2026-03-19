import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { XMarkIcon, XCircleIcon } from 'react-native-heroicons/outline';
import CustomButton from '@/components/CustomButton';
import TextArea from '@/components/forms/TextArea';

interface MechanicCancelRequestModalProps {
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
  'Customer not available',
  'Unable to reach location',
  'Parts not available',
  'Emergency/Personal issue',
  'Scheduling conflict',
  'Customer requested cancellation',
  'Other',
];

const MechanicCancelRequestModal: React.FC<MechanicCancelRequestModalProps> = ({
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
    Keyboard.dismiss();
    onClose();
    onSelectedReasonChange('');
    onReasonChange('');
  };

  const isConfirmDisabled = isLoading || !selectedCancelReason || (selectedCancelReason === 'Other' && !cancelReason.trim());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                <XCircleIcon size={24} color="#DC2626" />
              </View>
              <Text className="text-xl font-NunitoBold text-gray-900">
                Cancel Job
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 items-center justify-center"
              disabled={isLoading}
            >
              <XMarkIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View className="p-5">
              <Text className="text-base font-NunitoMedium text-gray-700 mb-1">
                Why are you cancelling this job?
              </Text>
              <Text className="text-sm font-NunitoRegular text-gray-500 mb-4">
                This helps us improve and inform the customer.
              </Text>

              {/* Cancel Reasons */}
              <View className="mb-4">
                {cancelReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => handleReasonSelect(reason)}
                    disabled={isLoading}
                    className={`p-4 mb-2 rounded-xl border-2 ${
                      selectedCancelReason === reason
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    } ${isLoading ? 'opacity-50' : ''}`}
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
                    label="Please provide details"
                    placeholder="Explain why you need to cancel this job..."
                    value={cancelReason}
                    onChangeText={onReasonChange}
                    rows={4}
                    required
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-5 border-t border-gray-200 pb-8">
            <View className="flex-row gap-3 space-x-3">
              <View className="flex-1">
                <CustomButton
                  title="Go Back"
                  onPress={handleClose}
                  bgVariant="outline"
                  textVariant="outline"
                  disabled={isLoading}
                />
              </View>
              <View className="flex-1">
                <CustomButton
                  title="Cancel Job"
                  onPress={onConfirm}
                  bgVariant="danger"
                  disabled={isConfirmDisabled}
                  loading={isLoading}
                  loadingText="Cancelling"
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MechanicCancelRequestModal;

