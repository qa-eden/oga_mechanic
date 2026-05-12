import React from 'react';
import { View, Text } from 'react-native';
import { UserIcon } from 'react-native-heroicons/outline';

interface CustomerInfoCardProps {
  customer: any;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ customer }) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
          <UserIcon size={20} color="#374151" />
        </View>
        <Text className="text-lg font-NunitoBold text-gray-900">
          Customer
        </Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-3">
        <Text className="text-base font-NunitoBold text-gray-900">
          {customer?.first_name && customer?.last_name
            ? `${customer.first_name} ${customer.last_name}`
            : 'N/A'}
        </Text>
      </View>
    </View>
  );
};

export default CustomerInfoCard;
