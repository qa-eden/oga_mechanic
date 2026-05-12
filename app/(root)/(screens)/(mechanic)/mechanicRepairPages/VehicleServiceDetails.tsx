import React from 'react';
import { View, Text } from 'react-native';
import { TruckIcon, WrenchScrewdriverIcon, DocumentTextIcon } from 'react-native-heroicons/outline';

interface VehicleServiceDetailsProps {
  request: any;
  makeName: string;
  modelName: string;
}

const VehicleServiceDetails: React.FC<VehicleServiceDetailsProps> = ({ request, makeName, modelName }) => {
  return (
    <>
      {/* Vehicle Information */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <TruckIcon size={20} color="#374151" />
          </View>
          <Text className="text-lg font-NunitoBold text-gray-900">
            Vehicle Details
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-3">
          <Text className="text-base font-NunitoBold text-gray-900">
            {makeName} {modelName}
          </Text>
          <View className="flex-row items-center mt-2 flex-wrap gap-2">
            {request.vehicle_year && (
              <View className="bg-gray-200 px-3 py-1 rounded-full">
                <Text className="text-xs font-NunitoSemiBold text-gray-700">
                  {request.vehicle_year}
                </Text>
              </View>
            )}
            {request.vehicle_registration && (
              <View className="bg-gray-200 px-3 py-1 rounded-full">
                <Text className="text-xs font-NunitoSemiBold text-gray-700">
                  {request.vehicle_registration}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Service Type & Problem */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <WrenchScrewdriverIcon size={20} color="#374151" />
          </View>
          <Text className="text-lg font-NunitoBold text-gray-900">
            Service Required
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <Text className="text-xs font-NunitoMedium text-gray-500 uppercase tracking-wider mb-1">
            Service Type
          </Text>
          <Text className="text-base font-NunitoBold text-gray-900">
            {request.service_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-3">
          <Text className="text-xs font-NunitoMedium text-gray-500 uppercase tracking-wider mb-1">
            Problem Description
          </Text>
          <Text className="text-sm font-NunitoMedium text-gray-800 leading-5">
            {request.problem_description || 'No description provided'}
          </Text>
        </View>

        {request.notes && (
          <View className="bg-gray-100 rounded-xl p-3 mt-3">
            <View className="flex-row items-center mb-1">
              <DocumentTextIcon size={14} color="#6B7280" />
              <Text className="text-xs font-NunitoBold text-gray-600 ml-1 uppercase">Notes</Text>
            </View>
            <Text className="text-sm font-NunitoMedium text-gray-700">{request.notes}</Text>
          </View>
        )}
      </View>
    </>
  );
};

export default VehicleServiceDetails;
