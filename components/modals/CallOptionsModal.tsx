import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { PhoneIcon } from 'react-native-heroicons/solid';
import AndroidNavBarSpacer from '../AndroidNavBarSpacer';

interface CallOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  phoneNumber: string;
  onInAppCall: () => void;
  onPhoneCall: () => void;
}

const CallOptionsModal: React.FC<CallOptionsModalProps> = ({
  isVisible,
  onClose,
  phoneNumber,
  onInAppCall,
  onPhoneCall,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        {/* Backdrop */}
        <TouchableOpacity 
          className="flex-1" 
          onPress={onClose}
          activeOpacity={1}
        />
        
        {/* Modal Content */}
        <View className="bg-white rounded-t-3xl">
          {/* Handle */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />
          
          {/* Header */}
          <View className="px-6 pb-4">
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Call option
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Select your preferred call option here
            </Text>
          </View>
          
          {/* Call Options */}
          <View className="px-6 pb-8 space-y-4">
            {/* In-app Call Option */}
            <TouchableOpacity
              className="flex-row items-center p-4 border border-[#EBEBEB] rounded-xl bg-[#FAFAFA] border border-gray-300 shadow-sm"
              onPress={onInAppCall}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-[#F2DADB] rounded-full items-center justify-center mr-4">
                <PhoneIcon size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base text-gray-900 mb-0.5">
                  In-app call
                </Text>
                <Text className="text-lg font-semibold text-gray-700">
                  {phoneNumber}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Phone Call Option */}
            <TouchableOpacity
              className="flex-row items-center p-4 border border-[#EBEBEB] rounded-xl mt-4 bg-[#FAFAFA] border border-gray-300 shadow-sm mb-4"
              onPress={onPhoneCall}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-[#F2DADB] rounded-full items-center justify-center mr-4">
                <PhoneIcon size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base  text-gray-900 mb-0.5">
                  Phone call
                </Text>
                <Text className="text-lg font-semibold text-gray-700">
                  {phoneNumber}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Android Navigation Bar Spacer */}
            <AndroidNavBarSpacer />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CallOptionsModal;
