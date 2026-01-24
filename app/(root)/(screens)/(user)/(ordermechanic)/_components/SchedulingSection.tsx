import React from 'react';
import { View, Text, Switch } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import DateInput from '@/components/forms/DateInput';

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
    <>
      {/* Schedule Booking Toggle */}
      <View className="flex-row items-center justify-between mb-4 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <View>
          <Text className="text-base font-NunitoBold text-gray-900">Schedule for later</Text>
          <Text className="text-sm font-NunitoMedium text-gray-500">Book a mechanic for a future date</Text>
        </View>
        <Switch
          value={isScheduled}
          onValueChange={setIsScheduled}
          trackColor={{ false: '#D1D5DB', true: '#D30309' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {isScheduled && (
        <>
          <View className="">
            <DateInput
              label="Preferred Date"
              placeholder="Select date"
              value={preferredDate}
              onDateChange={setPreferredDate}
              required
              minimumDate={new Date()}
              showTodayButton
            />
          </View>

          <View className="">
            <SelectField
              name="timeSlot"
              label="Preferred Time Slot"
              placeholder="Select a time slot"
              options={timeSlotOptions}
              value={preferredTimeSlot}
              onValueChange={setPreferredTimeSlot}
            />
          </View>
        </>
      )}
    </>
  );
};
