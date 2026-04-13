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
      className={`flex-row items-center justify-center px-4 py-2.5 rounded-full border mr-2.5 mb-3 ${
        isSelected 
          ? 'bg-[#FCF3F2] border-[#D30309]/20' 
          : 'bg-white border-[#E5E7EB]'
      }`}
      activeOpacity={0.7}
      style={isSelected ? { shadowColor: '#D30309', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 0 } : {}}
    >
      {isSelected && (
        <View className="w-1.5 h-1.5 rounded-full bg-[#D30309] mr-2" />
      )}
      <Text className={`text-[13px] font-NunitoSemiBold ${
        isSelected ? 'text-[#D30309]' : 'text-[#6B7280]'
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
  label
}) => {
  return (
    <View className="mb-2">
      {label && (
        <Text className="text-[13px] text-gray-500 font-NunitoMedium mb-4 pl-1">
          {label}
        </Text>
      )}
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
