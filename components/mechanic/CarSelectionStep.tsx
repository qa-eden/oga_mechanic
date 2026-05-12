import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircleIcon, FolderIcon, PlusCircleIcon } from 'react-native-heroicons/solid';

interface CarSelectionStepProps {
  carSelection: 'Yes' | 'No' | null;
  onSelectYes: () => void;
  onSelectNo: () => void;
}

/**
 * Step 1: Car selection UI component
 * Displays Yes/No cards for selecting whether user has a saved car
 */
export const CarSelectionStep: React.FC<CarSelectionStepProps> = ({
  carSelection,
  onSelectYes,
  onSelectNo,
}) => {
  return (
    <View className="px-1">
      <View className="mb-10 items-center">
        <Text className="text-2xl font-NunitoExtraBold text-gray-900 mb-2">
          Select a Vehicle
        </Text>
        <Text className="text-sm text-gray-400 font-NunitoMedium text-center px-4 leading-5">
          Choose a saved vehicle from your profile or add a new one for this request.
        </Text>
      </View>

      <View className="flex-row gap-4">
        {/* Yes Option Card */}
        <TouchableOpacity
          onPress={onSelectYes}
          className={`flex-1 p-6 rounded-[32px] border ${
            carSelection === 'Yes'
              ? 'bg-gray-900 border-gray-900 shadow-xl shadow-gray-200'
              : 'bg-white border-gray-100'
          }`}
          activeOpacity={0.9}
        >
          <View className="items-center">
            <View
              className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${
                carSelection === 'Yes' ? 'bg-white/10' : 'bg-gray-50'
              }`}
            >
              {carSelection === 'Yes' ? (
                <CheckCircleIcon size={28} color="#FFFFFF" />
              ) : (
                <FolderIcon size={28} color="#9CA3AF" />
              )}
            </View>
            <Text
              className={`text-base font-NunitoExtraBold mb-1 ${
                carSelection === 'Yes' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Saved List
            </Text>
            <Text
              className={`text-[10px] font-NunitoBold uppercase tracking-wider text-center ${
                carSelection === 'Yes' ? 'text-white/60' : 'text-gray-400'
              }`}
            >
              From Profile
            </Text>
          </View>
        </TouchableOpacity>

        {/* No Option Card */}
        <TouchableOpacity
          onPress={onSelectNo}
          className={`flex-1 p-6 rounded-[32px] border ${
            carSelection === 'No'
              ? 'bg-gray-900 border-gray-900 shadow-xl shadow-gray-200'
              : 'bg-white border-gray-100'
          }`}
          activeOpacity={0.9}
        >
          <View className="items-center">
            <View
              className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${
                carSelection === 'No' ? 'bg-white/10' : 'bg-gray-50'
              }`}
            >
              {carSelection === 'No' ? (
                <CheckCircleIcon size={28} color="#FFFFFF" />
              ) : (
                <PlusCircleIcon size={28} color="#9CA3AF" />
              )}
            </View>
            <Text
              className={`text-base font-NunitoExtraBold mb-1 ${
                carSelection === 'No' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Add New
            </Text>
            <Text
              className={`text-[10px] font-NunitoBold uppercase tracking-wider text-center ${
                carSelection === 'No' ? 'text-white/60' : 'text-gray-400'
              }`}
            >
              Manual Entry
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
