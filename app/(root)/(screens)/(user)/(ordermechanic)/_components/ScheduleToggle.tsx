import React from 'react';
import { View, Text, Switch } from 'react-native';

interface ScheduleToggleProps {
  isScheduled: boolean;
  onToggle: (value: boolean) => void;
}

/**
 * Reusable toggle component for scheduling bookings
 */
export const ScheduleToggle: React.FC<ScheduleToggleProps> = ({ isScheduled, onToggle }) => {
  return (
    <View className="flex-row items-center justify-between mb-4 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
      <View>
        <Text className="text-base font-NunitoBold text-gray-900">Schedule for later</Text>
        <Text className="text-sm font-NunitoMedium text-gray-500">
          Book a mechanic for a future date
        </Text>
      </View>
      <Switch
        value={isScheduled}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: '#D30309' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};
