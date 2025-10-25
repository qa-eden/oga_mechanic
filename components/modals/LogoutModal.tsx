import React from 'react';
import { View, Text, Modal } from 'react-native';
import { ArrowRightOnRectangleIcon } from 'react-native-heroicons/outline';
import CustomButton from '../CustomButton';
import AndroidNavBarSpacer from '../AndroidNavBarSpacer';

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = "Logout",
  message = "Are you sure you want to logout from your account?",
  confirmText = "Yes, Logout",
  cancelText = "Cancel"
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/30 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-[3rem]">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <ArrowRightOnRectangleIcon size={32} color="#EF4444" />
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 text-center">
              {title}
            </Text>
            <Text className="text-gray-600 text-center mt-2 font-NunitoMedium">
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View className="space-y-3">
            <CustomButton title={confirmText} loadingText='Logging Out' onPress={onConfirm} />

            <CustomButton title={cancelText} onPress={onCancel} bgVariant="outline" textVariant="outline" className='mt-4' />

            {/* Android Navigation Bar Spacer */}
            <AndroidNavBarSpacer />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
