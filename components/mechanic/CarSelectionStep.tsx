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
    <View>
      <Text className="text-xl font-NunitoBold text-gray-900 mb-2 text-center">
        Select a Vehicle
      </Text>
      <Text className="text-base text-gray-600 font-NunitoMedium mb-6 text-center">
        Choose a saved vehicle or add a new one
      </Text>

      <View className="flex-row gap-4">
        {/* Yes Option Card */}
        <TouchableOpacity
          onPress={onSelectYes}
          className={`flex-1 p-5 rounded-3xl border-2 ${
            carSelection === 'Yes'
              ? 'bg-primary-500 border-primary-500 shadow-lg'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
          activeOpacity={0.8}
          style={{
            shadowColor: carSelection === 'Yes' ? '#D30309' : '#000',
            shadowOffset: { width: 0, height: carSelection === 'Yes' ? 4 : 2 },
            shadowOpacity: carSelection === 'Yes' ? 0.2 : 0.1,
            shadowRadius: carSelection === 'Yes' ? 8 : 4,
            elevation: carSelection === 'Yes' ? 5 : 2,
          }}
        >
          <View className="items-center">
            <View
              className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${
                carSelection === 'Yes' ? 'bg-white/20' : 'bg-gray-100'
              }`}
            >
              {carSelection === 'Yes' ? (
                <CheckCircleIcon size={28} color="#FFFFFF" />
              ) : (
                <FolderIcon size={28} color="#6B7280" />
              )}
            </View>
            <Text
              className={`text-base font-NunitoBold mb-1 ${
                carSelection === 'Yes' ? 'text-white' : 'text-gray-800'
              }`}
            >
              Saved Cars
            </Text>
            <Text
              className={`text-xs font-NunitoMedium text-center px-2 ${
                carSelection === 'Yes' ? 'text-white/90' : 'text-gray-600'
              }`}
            >
              Choose from your list
            </Text>
          </View>
        </TouchableOpacity>

        {/* No Option Card */}
        <TouchableOpacity
          onPress={onSelectNo}
          className={`flex-1 p-5 rounded-3xl border-2 ${
            carSelection === 'No'
              ? 'bg-primary-500 border-primary-500 shadow-lg'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
          activeOpacity={0.8}
          style={{
            shadowColor: carSelection === 'No' ? '#D30309' : '#000',
            shadowOffset: { width: 0, height: carSelection === 'No' ? 4 : 2 },
            shadowOpacity: carSelection === 'No' ? 0.2 : 0.1,
            shadowRadius: carSelection === 'No' ? 8 : 4,
            elevation: carSelection === 'No' ? 5 : 2,
          }}
        >
          <View className="items-center">
            <View
              className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${
                carSelection === 'No' ? 'bg-white/20' : 'bg-gray-100'
              }`}
            >
              {carSelection === 'No' ? (
                <CheckCircleIcon size={28} color="#FFFFFF" />
              ) : (
                <PlusCircleIcon size={28} color="#6B7280" />
              )}
            </View>
            <Text
              className={`text-base font-NunitoBold mb-1 ${
                carSelection === 'No' ? 'text-white' : 'text-gray-800'
              }`}
            >
              Add New
            </Text>
            <Text
              className={`text-xs font-NunitoMedium text-center px-2 ${
                carSelection === 'No' ? 'text-white/90' : 'text-gray-600'
              }`}
            >
              Enter details manually
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
