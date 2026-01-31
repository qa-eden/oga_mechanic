import React from 'react';
import { View, Text, Switch } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import DateInput from '@/components/forms/DateInput';
import { CalendarDaysIcon, ClockIcon } from 'react-native-heroicons/outline';

interface SelectOption {
  label: string;
  value: string;
}

interface SchedulingSectionProps {
  isScheduled: boolean;
  setIsScheduled: (value: boolean) => void;
  preferredDate: Date | null;
  setPreferredDate: (value: Date | null) => void;
  preferredTimeSlot: string;
  setPreferredTimeSlot: (value: string) => void;
  timeSlotOptions: SelectOption[];
}

/**
 * Reusable component for scheduling toggle, date/time selection, and notes
 * Used in multiple places in the find-mechanic flow
 */
export const SchedulingSection: React.FC<SchedulingSectionProps> = ({
  isScheduled,
  setIsScheduled,
  preferredDate,
  setPreferredDate,
  preferredTimeSlot,
  setPreferredTimeSlot,
  timeSlotOptions,
}) => {
  return (
    <View className="mt-2">
      {/* Section Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 bg-primary-50 rounded-full items-center justify-center mr-3">
          <CalendarDaysIcon size={18} color="#D30309" />
        </View>
        <Text className="text-base font-NunitoBold text-gray-900">Scheduling</Text>
      </View>

      {/* Schedule Booking Toggle */}
      <View className="flex-row items-center justify-between mb-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
        <View className="flex-1 mr-3">
          <Text className="text-base font-NunitoBold text-gray-900">Schedule for later</Text>
          <Text className="text-sm font-NunitoRegular text-gray-500 mt-0.5">
            Book a mechanic for a specific date & time
          </Text>
        </View>
        <Switch
          value={isScheduled}
          onValueChange={setIsScheduled}
          trackColor={{ false: '#D1D5DB', true: '#D30309' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {isScheduled && (
        <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          {/* Date & Time Row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <DateInput
                label="Date"
                placeholder="Select date"
                value={preferredDate}
                onDateChange={setPreferredDate}
                required
                minimumDate={new Date()}
                showTodayButton
              />
            </View>

            <View className="flex-1">
              <SelectField
                name="timeSlot"
                label="Time Slot"
                placeholder="Select time"
                options={timeSlotOptions}
                value={preferredTimeSlot}
                onValueChange={setPreferredTimeSlot}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
