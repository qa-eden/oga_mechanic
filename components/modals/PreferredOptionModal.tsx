import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { PlusIcon } from 'react-native-heroicons/outline';
import { icons } from '@/constants';
import AndroidNavBarSpacer from '@/components/AndroidNavBarSpacer';

interface Option {
  id: number;
  title: string;
  onPress: () => void;
  description?: string;
}

interface PreferredOptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  options: Option[];
}

const PreferredOptionModal = ({ isVisible, onClose, options }: PreferredOptionModalProps) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <View className="bg-white rounded-t-[40px] shadow-2xl">
          <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mt-4 mb-8" />
          
          <View className="px-8 pb-12">
            {/* Header Icon Section */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary-50 rounded-[28px] items-center justify-center mb-6 shadow-sm shadow-primary-100">
                <View className="bg-white p-3 rounded-2xl shadow-sm">
                  <icons.activeProductTab width={32} height={32} />
                </View>
              </View>

              <Text className="text-[24px] font-NunitoExtraBold text-gray-900 mb-2 text-center">
                Preferred Action
              </Text>
              <Text className="text-gray-500 font-NunitoMedium text-center px-4 leading-5">
                Select the category of product you would like to list on the marketplace
              </Text>
            </View>

            {/* Options List */}
            <View className="space-y-4 gap-4">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={option.onPress}
                  activeOpacity={0.8}
                  className="bg-white border border-gray-200 rounded-[24px] p-5 flex-row items-center shadow-md shadow-gray-200/40"
                >
                  <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center mr-4">
                    {option.id === 1 ? (
                      <icons.spareParts width={24} height={24} />
                    ) : option.id === 2 ? (
                      <icons.cars width={24} height={24} />
                    ) : (
                      <icons.activeFleetTab width={24} height={24} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-NunitoExtraBold text-gray-900">
                      {option.title}
                    </Text>
                    <Text className="text-[12px] font-NunitoMedium text-gray-400 mt-0.5">
                      {option.id === 1 ? 'Add components or tools' : option.id === 2 ? 'List a vehicle for sale' : 'Add to your rental fleet'}
                    </Text>
                  </View>
                  <View className="w-8 h-8 bg-primary-50 rounded-full items-center justify-center">
                    <PlusIcon size={16} color="#D30309" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity 
              onPress={onClose}
              className="mt-8 py-4 items-center"
            >
              <Text className="text-gray-400 font-NunitoExtraBold text-[15px]">Dismiss</Text>
            </TouchableOpacity>

            <AndroidNavBarSpacer />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default PreferredOptionModal;
