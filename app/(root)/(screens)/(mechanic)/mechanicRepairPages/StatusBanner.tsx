import React from 'react';
import { View, Text } from 'react-native';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from 'react-native-heroicons/solid';

interface StatusBannerProps {
  status: string;
  request: any;
  getStatusLabel: (status: string) => string;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ status, request, getStatusLabel }) => {
  return (
    <View className={`rounded-2xl p-4 mb-5 ${
      status === 'pending' ? 'bg-amber-50 border-2 border-amber-200' :
      status === 'accepted' ? 'bg-blue-50 border-2 border-blue-200' :
      status === 'in_transit' ? 'bg-indigo-50 border-2 border-indigo-200' :
      status === 'arrived' ? 'bg-purple-50 border-2 border-purple-200' :
      status === 'in_progress' ? 'bg-orange-50 border border-orange-200' :
      (status === 'completed' || status === 'verify_completed') ? 
          ((status === 'verify_completed' || request?.verify_completed_at) ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200') :
      status === 'cancelled' || status === 'declined' ? 'bg-red-50 border-2 border-red-200' :
      'bg-gray-50 border-2 border-gray-200'
    }`}>
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
          status === 'pending' ? 'bg-amber-100' :
          status === 'accepted' ? 'bg-blue-100' :
          status === 'in_transit' ? 'bg-indigo-100' :
          status === 'arrived' ? 'bg-purple-100' :
          status === 'in_progress' ? 'bg-orange-100' :
          (status === 'completed' || status === 'verify_completed') ? 
              ((status === 'verify_completed' || request?.verify_completed_at) ? 'bg-green-100' : 'bg-blue-100') :
          status === 'cancelled' || status === 'declined' ? 'bg-red-100' :
          'bg-gray-100'
        }`}>
          {status === 'pending' && <ClockIcon size={24} color="#D97706" />}
          {status === 'accepted' && <CheckCircleIcon size={24} color="#2563EB" />}
          {status === 'in_transit' && <TruckIcon size={24} color="#4F46E5" />}
          {status === 'arrived' && <MapPinIcon size={24} color="#7C3AED" />}
          {status === 'in_progress' && <WrenchScrewdriverIcon size={20} color="#EA580C" />}
          {(status === 'completed' || status === 'verify_completed') && (
            (status === 'verify_completed' || request?.verify_completed_at) ? 
            <CheckCircleSolidIcon size={20} color="#16A34A" /> : 
            <ClockIcon size={20} color="#2563EB" />
          )}
          {(status === 'cancelled' || status === 'declined') && <XCircleIcon size={24} color="#DC2626" />}
        </View>
        <View className="flex-1">
          <Text className={`text-lg font-NunitoBold ${
            status === 'pending' ? 'text-amber-800' :
            status === 'accepted' ? 'text-blue-800' :
            status === 'in_transit' ? 'text-indigo-800' :
            status === 'arrived' ? 'text-purple-800' :
            status === 'in_progress' ? 'text-orange-800' :
            (status === 'completed' || status === 'verify_completed') ? 
                ((status === 'verify_completed' || request?.verify_completed_at) ? 'text-green-800' : 'text-blue-800') :
            status === 'cancelled' || status === 'declined' ? 'text-red-800' :
            'text-gray-800'
          }`}>
            {getStatusLabel(status)}
          </Text>
          <Text className={`text-sm font-NunitoRegular mt-0.5 ${
            status === 'pending' ? 'text-amber-600' :
            status === 'accepted' ? 'text-blue-600' :
            status === 'in_transit' ? 'text-indigo-600' :
            status === 'arrived' ? 'text-purple-600' :
            status === 'in_progress' ? 'text-orange-600' :
            status === 'completed' ? 'text-green-600' :
            status === 'cancelled' || status === 'declined' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {status === 'pending' && 'Waiting for your response'}
            {status === 'accepted' && 'Head to customer location'}
            {status === 'in_transit' && 'On your way to customer'}
            {status === 'arrived' && 'You have reached the customer'}
            {status === 'in_progress' && 'Working on the repair'}
            {(status === 'completed' || status === 'verify_completed') && 
              ((status === 'verify_completed' || request?.verify_completed_at) ? 'The customer has verified this job.' : 'Waiting for the customer to verify completion.')}
            {status === 'cancelled' && 'This request was cancelled.'}
            {status === 'declined' && 'You declined this request'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StatusBanner;
