import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface FeatureBadgeProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const FeatureBadge: React.FC<FeatureBadgeProps> = ({ label, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-3 rounded-lg border mr-3 mb-3 ${
        isSelected 
          ? 'bg-orange-500 border-orange-500' 
          : 'bg-white border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <Text className={`text-sm font-NunitoSemiBold text-center ${
        isSelected ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface FeatureBadgesProps {
  features: string[];
  selectedFeatures: string[];
  onFeatureToggle: (feature: string) => void;
  label?: string;
}

const FeatureBadges: React.FC<FeatureBadgesProps> = ({
  features,
  selectedFeatures,
  onFeatureToggle,
  label = "Features"
}) => {
  return (
    <View className="mb-4">
      <Text className="text-base font-NunitoSemiBold text-gray-700 mb-3">
        {label}
      </Text>
      <Text className="text-sm text-gray-500 font-NunitoMedium mb-4">
        Select all features that apply to your car
      </Text>
      <View className="flex-row flex-wrap">
        {features.map((feature) => (
          <FeatureBadge
            key={feature}
            label={feature}
            isSelected={selectedFeatures.includes(feature)}
            onPress={() => onFeatureToggle(feature)}
          />
        ))}
      </View>
    </View>
  );
};

export default FeatureBadges;
