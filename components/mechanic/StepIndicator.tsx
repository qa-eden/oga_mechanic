import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';

interface StepIndicatorProps {
  currentStep: 1 | 2;
  hasCarList: boolean;
}

/**
 * Step indicator component showing progress through the form
 * Only displayed when user has a car list
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, hasCarList }) => {
  if (!hasCarList) return null;

  return (
    <View className="flex-row items-center justify-center mb-6">
      <View className="flex-row items-center">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            currentStep >= 1 ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          {currentStep > 1 ? (
            <CheckCircleIcon size={20} color="#FFFFFF" />
          ) : (
            <Text
              className={`text-sm font-NunitoBold ${
                currentStep >= 1 ? 'text-white' : 'text-gray-500'
              }`}
            >
              1
            </Text>
          )}
        </View>
        <View
          className={`h-1 w-12 mx-2 ${
            currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        />
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <Text
            className={`text-sm font-NunitoBold ${
              currentStep >= 2 ? 'text-white' : 'text-gray-500'
            }`}
          >
            2
          </Text>
        </View>
      </View>
    </View>
  );
};
