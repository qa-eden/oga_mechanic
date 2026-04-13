import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FunnelIcon, XMarkIcon } from 'react-native-heroicons/outline';
import DatePicker from './DatePicker';
import { format, parse } from 'date-fns';

interface WithdrawalFilterBarProps {
  onFilterChange: (filters: { status?: string; start_date?: string; end_date?: string }) => void;
  activeFilters: { status?: string; start_date?: string; end_date?: string };
}

const STATUS_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const WithdrawalFilterBar: React.FC<WithdrawalFilterBarProps> = ({ onFilterChange, activeFilters }) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusSelect = (status: string | undefined) => {
    onFilterChange({ ...activeFilters, status });
  };

  const handleDateSelect = (date: string, type: 'start' | 'end') => {
    // DatePicker returns DD/MM/YYYY, we need YYYY-MM-DD for the API
    try {
      const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
      const formattedDate = format(parsedDate, 'yyyy-MM-dd');
      
      if (type === 'start') {
        onFilterChange({ ...activeFilters, start_date: formattedDate });
      } else {
        onFilterChange({ ...activeFilters, end_date: formattedDate });
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

  const clearDateFilters = () => {
    onFilterChange({ ...activeFilters, start_date: undefined, end_date: undefined });
  };

  return (
    <View className="bg-white border-b border-gray-100">
      <View className="flex-row items-center px-5 py-3">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="flex-1"
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => handleStatusSelect(option.value)}
              className={`px-4 py-2 rounded-full mr-2 border ${
                activeFilters.status === option.value
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-NunitoSemiBold ${
                  activeFilters.status === option.value ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          className={`ml-2 p-2 rounded-lg ${isExpanded ? 'bg-red-50' : 'bg-gray-100'}`}
        >
          <FunnelIcon size={20} color={isExpanded ? '#EF4444' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View className="px-5 pb-4 bg-gray-50/50">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-NunitoBold text-gray-700">Date Range</Text>
            {(activeFilters.start_date || activeFilters.end_date) && (
              <TouchableOpacity onPress={clearDateFilters} className="flex-row items-center">
                <Text className="text-xs font-NunitoMedium text-red-500 mr-1">Clear Dates</Text>
                <XMarkIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setShowStartDatePicker(true)}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-3 mr-3"
            >
              <Text className="text-xs text-gray-500 font-NunitoMedium mb-1">Start Date</Text>
              <Text className="text-sm text-gray-900 font-NunitoSemiBold">
                {activeFilters.start_date || 'YYYY-MM-DD'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowEndDatePicker(true)}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-3"
            >
              <Text className="text-xs text-gray-500 font-NunitoMedium mb-1">End Date</Text>
              <Text className="text-sm text-gray-900 font-NunitoSemiBold">
                {activeFilters.end_date || 'YYYY-MM-DD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <DatePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onDateSelect={(date) => handleDateSelect(date, 'start')}
        title="Start Date"
        maxYear={new Date().getFullYear()}
      />

      <DatePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onDateSelect={(date) => handleDateSelect(date, 'end')}
        title="End Date"
        maxYear={new Date().getFullYear()}
      />
    </View>
  );
};

export default WithdrawalFilterBar;
