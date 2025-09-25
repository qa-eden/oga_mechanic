"use client";

import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useState } from "react";
import { XMarkIcon } from "react-native-heroicons/outline";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { icons } from "@/constants";

interface PaymentMethodModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectPayment: (method: string) => void;
  totalAmount: number;
}

const PaymentMethodModal = ({
  isVisible,
  onClose,
  onSelectPayment,
  totalAmount,
}: PaymentMethodModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("transfer");

  const handleSelectMethod = (method: string) => {
    setSelectedMethod(method);
  };

  const handleProceed = () => {
    onSelectPayment(selectedMethod);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl w-full overflow-hidden">
          {/* Top indicator */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-4 mb-2" />
          
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 pb-4 border-b border-gray-100">
            <Text className="text-xl font-NunitoBold text-gray-900">
              Select Payment method
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <XMarkIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Payment Methods */}
          <View className="p-6">
            {/* transfer Option */}
            <TouchableOpacity
              onPress={() => handleSelectMethod("transfer")}
              className="flex-row items-center justify-between py-4"
            >
              <View className="flex-row items-center ">
                {/* <Text className="text-2xl mr-4">💵</Text> */}
                <View className="bg-gray-100 p-2 rounded-full mr-3">
                  <icons.bankIcon
                    width={30}
                    height={30}
                    // style={{ marginRight: 16 }}
                  />
                </View>
                <View>
                  <Text className="text-lg font-NunitoBold text-gray-900">
                    Bank Transfer
                  </Text>
                  <NairaCurrency
                    value={totalAmount}
                    className="text-base text-gray-600"
                  />
                </View>
              </View>
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center">
                {selectedMethod === "transfer" && (
                  <View className="w-4 h-4 bg-red-500 rounded-full" />
                )}
              </View>
            </TouchableOpacity>

            {/* Card Option */}
            <TouchableOpacity
              onPress={() => handleSelectMethod("card")}
              className="flex-row items-center justify-between py-4"
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3 bg-gray-100 p-2 rounded-full">💳</Text>
                <View>
                  <Text className="text-lg font-NunitoBold text-gray-900">
                    Card
                  </Text>
                  <NairaCurrency
                    value={totalAmount}
                    className="text-base text-gray-600"
                  />
                </View>
              </View>
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center">
                {selectedMethod === "card" && (
                  <View className="w-4 h-4 bg-red-500 rounded-full" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Proceed Button */}
          <View className="p-6 pt-4 pb-8 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleProceed}
              className="bg-primary-500 py-4 px-6 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-NunitoBold text-lg">
                Proceed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;
