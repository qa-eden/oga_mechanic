import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";

export interface SelectionOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  options: SelectionOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  showCancel?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
}

const SelectionModal = ({
  isVisible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  showCancel = true,
  cancelLabel = "Cancel",
  onCancel,
}: SelectionModalProps) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <Text className="text-xl font-NunitoBold text-gray-900">
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <XMarkIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="p-6">
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSelect(option.value)}
                className={`flex-row items-center justify-between py-4 px-2 rounded-xl mb-3 border ${selectedValue === option.value ? "bg-blue-100 border-blue-500" : "bg-gray-50 border-gray-200"}`}
              >
                <View className="flex-row items-center">
                  {option.icon && (
                    <View className="mr-3">{option.icon}</View>
                  )}
                  <Text className="text-lg font-NunitoBold text-gray-900">{option.label}</Text>
                </View>
                <View className="w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center">
                  {selectedValue === option.value && (
                    <View className="w-4 h-4 bg-blue-500 rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          {showCancel && (
            <View className="p-6 border-t border-gray-100">
              <TouchableOpacity
                onPress={onCancel || onClose}
                className="bg-gray-200 py-3 px-6 rounded-xl items-center justify-center"
              >
                <Text className="text-gray-700 font-NunitoBold text-lg">
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SelectionModal; 