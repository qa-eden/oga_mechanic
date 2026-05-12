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
    <View className="flex-row items-center justify-center mb-10 mt-2">
      <View className="flex-row items-center">
        <View
          className={`w-10 h-10 rounded-2xl items-center justify-center ${
            currentStep >= 1 ? 'bg-gray-900 shadow-lg shadow-gray-200' : 'bg-gray-100'
          }`}
        >
          {currentStep > 1 ? (
            <CheckCircleIcon size={20} color="#FFFFFF" />
          ) : (
            <Text
              className={`text-sm font-NunitoExtraBold ${
                currentStep >= 1 ? 'text-white' : 'text-gray-400'
              }`}
            >
              01
            </Text>
          )}
        </View>
        
        <View className="w-12 h-[2px] mx-3 bg-gray-100 overflow-hidden">
          <View 
            className={`h-full ${currentStep >= 2 ? 'bg-gray-900 w-full' : 'bg-gray-100 w-0'}`}
          />
        </View>

        <View
          className={`w-10 h-10 rounded-2xl items-center justify-center ${
            currentStep >= 2 ? 'bg-gray-900 shadow-lg shadow-gray-200' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-sm font-NunitoExtraBold ${
              currentStep >= 2 ? 'text-white' : 'text-gray-400'
            }`}
          >
            02
          </Text>
        </View>
      </View>
    </View>
  );
};
