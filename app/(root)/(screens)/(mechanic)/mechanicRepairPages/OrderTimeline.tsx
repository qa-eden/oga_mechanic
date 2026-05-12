import React from 'react';
import { View, Text } from 'react-native';
import {
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from 'react-native-heroicons/solid';

interface OrderTimelineProps {
  request: any;
  status: string;
  formatDateTime: (date: string | null | undefined) => string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ request, status, formatDateTime }) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-5">
        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
          <ClockIcon size={20} color="#374151" />
        </View>
        <Text className="text-lg font-NunitoBold text-gray-900">
          Job Progress
        </Text>
      </View>

      {/* Timeline Steps */}
      <View className="pl-2">
        {/* Step 1: Request Received */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              request.requested_at ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              {request.requested_at ? (
                <CheckCircleSolidIcon size={20} color="#FFFFFF" />
              ) : (
                <View className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </View>
            <View className={`w-0.5 h-12 ${
              request.accepted_at ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-NunitoBold ${
              request.requested_at ? 'text-gray-900' : 'text-gray-400'
            }`}>
              Request Received
            </Text>
            <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
              {request.requested_at ? formatDateTime(request.requested_at) : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Step 2: Job Accepted */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              request.accepted_at ? 'bg-green-500' :
              status === 'declined' ? 'bg-red-500' : 'bg-gray-200'
            }`}>
              {request.accepted_at ? (
                <CheckCircleSolidIcon size={20} color="#FFFFFF" />
              ) : status === 'declined' ? (
                <XCircleIcon size={20} color="#FFFFFF" />
              ) : (
                <View className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </View>
            <View className={`w-0.5 h-12 ${
              request.in_transit_at ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-NunitoBold ${
              request.accepted_at || status === 'declined' ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {status === 'declined' ? 'Request Declined' : 'Job Accepted'}
            </Text>
            <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
              {request.accepted_at ? formatDateTime(request.accepted_at) :
               status === 'declined' ? 'Declined' : 'Waiting'}
            </Text>
          </View>
        </View>

        {/* Step 3: In Transit */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              request.in_transit_at ? 'bg-green-500' :
              status === 'in_transit' ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              {request.in_transit_at ? (
                <CheckCircleSolidIcon size={20} color="#FFFFFF" />
              ) : status === 'in_transit' ? (
                <TruckIcon size={16} color="#FFFFFF" />
              ) : (
                <View className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </View>
            <View className={`w-0.5 h-12 ${
              request.arrived_at ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-NunitoBold ${
              request.in_transit_at || status === 'in_transit' ? 'text-gray-900' : 'text-gray-400'
            }`}>
              On The Way
            </Text>
            <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
              {request.in_transit_at ? formatDateTime(request.in_transit_at) :
               status === 'in_transit' ? 'In Progress' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Step 4: Arrived */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              request.arrived_at ? 'bg-green-500' :
              status === 'arrived' ? 'bg-purple-500' : 'bg-gray-200'
            }`}>
              {request.arrived_at ? (
                <CheckCircleSolidIcon size={20} color="#FFFFFF" />
              ) : status === 'arrived' ? (
                <MapPinIcon size={16} color="#FFFFFF" />
              ) : (
                <View className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </View>
            <View className={`w-0.5 h-12 ${
              request.in_progress_at ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-NunitoBold ${
              request.arrived_at || status === 'arrived' ? 'text-gray-900' : 'text-gray-400'
            }`}>
              Arrived At Location
            </Text>
            <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
              {request.arrived_at ? formatDateTime(request.arrived_at) :
               status === 'arrived' ? 'Reached' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Step 5: Work Started */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              request.in_progress_at ? 'bg-green-500' :
              status === 'in_progress' ? 'bg-orange-500' : 'bg-gray-200'
            }`}>
              {request.in_progress_at && status === 'completed' ? (
                <CheckCircleSolidIcon size={20} color="#FFFFFF" />
              ) : status === 'in_progress' ? (
                <WrenchScrewdriverIcon size={16} color="#FFFFFF" />
              ) : (
                <View className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </View>
            <View className={`w-0.5 h-12 ${
              request.completed_at ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-NunitoBold ${
              request.in_progress_at || status === 'in_progress' ? 'text-gray-900' : 'text-gray-400'
            }`}>
              Repair In Progress
            </Text>
            <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
              {request.in_progress_at ? formatDateTime(request.in_progress_at) :
               status === 'in_progress' ? 'Working on it' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Step 5: Completed or Cancelled */}
        <View className="flex-row">
          <View className="items-center mr-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              (request.completed_at || status === 'verify_completed') ? 'bg-green-500' :
              request.cancelled_at ? 'bg-red-500' : 'bg-gray-200'
            }`}>
              {(request.completed_at || status === 'verify_completed') ? (
                <CheckCircleSolidIcon size={20} color="#FFFFFF" />
              ) : request.cancelled_at ? (
                <XCircleIcon size={20} color="#FFFFFF" />
              ) : (
                <View className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </View>
            {!request.cancelled_at && (
              <View className={`w-0.5 h-12 ${
                (request.verify_completed_at || status === 'verify_completed') ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </View>
          <View className="flex-1 pb-4">
            <Text className={`text-sm font-NunitoBold ${
              (request.completed_at || status === 'verify_completed') ? 'text-green-700' :
              request.cancelled_at ? 'text-red-700' : 'text-gray-400'
            }`}>
              {request.cancelled_at ? 'Job Cancelled' : 'Job Completed'}
            </Text>
            <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
              {(request.completed_at || status === 'verify_completed') ? formatDateTime(request.completed_at || request.verify_completed_at) :
               request.cancelled_at ? formatDateTime(request.cancelled_at) : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Step 6: User Verified */}
        {!request.cancelled_at && (
          <View className="flex-row">
            <View className="items-center mr-4">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                (request.verify_completed_at || status === 'verify_completed') ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {(request.verify_completed_at || status === 'verify_completed') ? (
                  <CheckCircleSolidIcon size={20} color="#FFFFFF" />
                ) : (
                  <View className="w-3 h-3 rounded-full bg-gray-400" />
                )}
              </View>
            </View>
            <View className="flex-1">
              <Text className={`text-sm font-NunitoBold ${
                (request.verify_completed_at || status === 'verify_completed') ? 'text-green-700' : 'text-gray-400'
              }`}>
                User Verified Completion
              </Text>
              <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
                {(request.verify_completed_at || status === 'verify_completed') ? formatDateTime(request.verify_completed_at) : 'Awaiting confirmation'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderTimeline;
