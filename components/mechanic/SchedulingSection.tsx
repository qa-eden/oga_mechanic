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
    <View className="mt-2 mb-2">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100">
          <CalendarDaysIcon size={20} color="#111827" />
        </View>
        <Text className="text-lg font-NunitoExtraBold text-gray-900">Scheduling</Text>
      </View>

      {/* Schedule Booking Toggle */}
      <View className="flex-row items-center justify-between mb-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
        <View className="flex-1 mr-4">
          <Text className="text-base font-NunitoExtraBold text-gray-900">Book for later</Text>
          <Text className="text-xs font-NunitoMedium text-gray-400 mt-1 leading-5">
            Prefer a specific date? Toggle this to schedule.
          </Text>
        </View>
        <Switch
          value={isScheduled}
          onValueChange={setIsScheduled}
          trackColor={{ false: '#F3F4F6', true: '#111827' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {isScheduled && (
        <View className="bg-gray-50/30 p-5 rounded-[32px] border border-gray-100 mb-2">
          {/* Date & Time Row */}
          <View className="flex-col gap-4">
            <View className="flex-1">
              <DateInput
                label="Preferred Date"
                placeholder="Select appointment date"
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
                label="Arrival Window"
                placeholder="Select time slot"
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
