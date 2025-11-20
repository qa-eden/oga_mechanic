"use client";

import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import { useRepairRequestDetail } from '@/hooks/useRepairRequests';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { 
  UserIcon, 
  TruckIcon, 
  CalendarIcon, 
  MapPinIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ClockIcon
} from 'react-native-heroicons/outline';

const MechanicOrderDetails = () => {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params?.orderId) ? params?.orderId[0] : (params?.orderId as string | undefined);
  
  const [refreshing, setRefreshing] = useState(false);

  // Fetch repair request detail from API
  const { 
    data: orderData, 
    isLoading: isLoadingData, 
    error: errorData, 
    refetch 
  } = useRepairRequestDetail(orderId);

  // Fetch vehicle makes to resolve make/model names
  const { data: vehicleMakes } = useVehicleMakes();

  // Helper function to get make name from ID
  const getMakeName = (makeId: string | number) => {
    if (!vehicleMakes || !makeId) return 'N/A';
    const make = vehicleMakes.find((m) => m.id.toString() === makeId.toString());
    return make?.name || `Make ID: ${makeId}`;
  };

  // Helper function to get model name from ID
  const getModelName = (makeId: string | number, modelId: string | number) => {
    if (!vehicleMakes || !makeId || !modelId) return 'N/A';
    const make = vehicleMakes.find((m) => m.id.toString() === makeId.toString());
    const model = make?.models?.find((m) => m.id.toString() === modelId.toString());
    return model?.name || `Model ID: ${modelId}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot: string) => {
    if (!timeSlot) return 'N/A';
    return timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1);
  };

  if (isLoadingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">
            Order Details
          </Text>
          <View className="w-12" />
        </View>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (errorData || !orderData?.data) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">
            Order Details
          </Text>
          <View className="w-12" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <AnimatedErrorCard
            emoji="🔧"
            title="Unable to load order details"
            message={errorData ? "Failed to fetch order details. Please try again." : "Order details not found."}
            gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
            textColor="text-red-800"
            actionButton={{
              text: "Retry",
              onPress: () => refetch(),
              backgroundColor: "#DC2626"
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const request = orderData.data;
  const customer = request.customer;
  const status = request.status || 'pending';
  const makeName = getMakeName(request.vehicle_make);
  const modelName = getModelName(request.vehicle_make, request.vehicle_model);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
          Order Details
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#A80207']}
            tintColor="#A80207"
          />
        }
      >
        <View className="px-5 py-4">
          {/* Status Badge */}
          <View className="mb-6">
            <View className={`self-start px-4 py-2 rounded-full ${getStatusColor(status)}`}>
              <Text className={`text-sm font-NunitoBold`}>
                {getStatusLabel(status)}
              </Text>
            </View>
          </View>

          {/* Customer Information */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <UserIcon size={20} color="#6B7280" />
              </View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Customer Information
              </Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-sm font-NunitoMedium text-gray-600">Name</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {customer?.first_name && customer?.last_name
                    ? `${customer.first_name} ${customer.last_name}`
                    : 'N/A'}
                </Text>
              </View>
              
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-sm font-NunitoMedium text-gray-600">Email</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {customer?.email || 'N/A'}
                </Text>
              </View>
              
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-NunitoMedium text-gray-600">Phone</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {customer?.phone_number || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Vehicle Information */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <TruckIcon size={20} color="#6B7280" />
              </View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Vehicle Information
              </Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-sm font-NunitoMedium text-gray-600">Make</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {makeName}
                </Text>
              </View>
              
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-sm font-NunitoMedium text-gray-600">Model</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {modelName}
                </Text>
              </View>
              
              {request.vehicle_year && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Year</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {request.vehicle_year}
                  </Text>
                </View>
              )}
              
              {request.vehicle_registration && (
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Registration</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {request.vehicle_registration}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Service Details */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <WrenchScrewdriverIcon size={20} color="#6B7280" />
              </View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Service Details
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="py-2 border-b border-gray-100">
                <Text className="text-sm font-NunitoMedium text-gray-600 mb-1">Service Type</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                  {request.service_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                </Text>
              </View>
              
              <View className="py-2 border-b border-gray-100">
                <Text className="text-sm font-NunitoMedium text-gray-600 mb-1">Problem Description</Text>
                <Text className="text-sm font-NunitoMedium text-gray-900 leading-5">
                  {request.problem_description || 'N/A'}
                </Text>
              </View>
              
              <View className="py-2 border-b border-gray-100">
                <View className="flex-row items-center mb-2">
                  <View className="mr-2">
                    <CalendarIcon size={16} color="#6B7280" />
                  </View>
                  <Text className="text-sm font-NunitoMedium text-gray-600">Schedule</Text>
                </View>
                <Text className="text-sm font-NunitoBold text-gray-900 ml-6">
                  {formatDate(request.preferred_date || request.requested_at)}
                </Text>
                <Text className="text-sm font-NunitoMedium text-gray-600 ml-6 mt-1">
                  {formatTime(request.preferred_time_slot)}
                </Text>
              </View>
              
              <View className="py-2 border-b border-gray-100">
                <View className="flex-row items-center mb-2">
                  <View className="mr-2">
                    <MapPinIcon size={16} color="#6B7280" />
                  </View>
                  <Text className="text-sm font-NunitoMedium text-gray-600">Service Address</Text>
                </View>
                <Text className="text-sm font-NunitoMedium text-gray-900 ml-6 leading-5">
                  {request.service_address || 'N/A'}
                </Text>
              </View>
              
              {request.notes && (
                <View className="py-2">
                  <View className="flex-row items-center mb-2">
                    <View className="mr-2">
                      <DocumentTextIcon size={16} color="#6B7280" />
                    </View>
                    <Text className="text-sm font-NunitoMedium text-gray-600">Additional Notes</Text>
                  </View>
                  <Text className="text-sm font-NunitoMedium text-gray-900 ml-6 leading-5">
                    {request.notes}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Order Timeline */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <ClockIcon size={20} color="#6B7280" />
              </View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Order Timeline
              </Text>
            </View>
            
            <View className="space-y-3">
              {request.requested_at && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Requested At</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {formatDate(request.requested_at)}
                  </Text>
                </View>
              )}
              
              {request.accepted_at && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Accepted At</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {formatDate(request.accepted_at)}
                  </Text>
                </View>
              )}
              
              {request.started_at && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Started At</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {formatDate(request.started_at)}
                  </Text>
                </View>
              )}
              
              {request.completed_at && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Completed At</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {formatDate(request.completed_at)}
                  </Text>
                </View>
              )}
              
              {request.cancelled_at && (
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm font-NunitoMedium text-gray-600">Cancelled At</Text>
                  <Text className="text-sm font-NunitoBold text-gray-900">
                    {formatDate(request.cancelled_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Cost Information */}
          {(request.estimated_cost || request.actual_cost) && (
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
                Cost Information
              </Text>
              
              <View className="space-y-2">
                {request.estimated_cost && (
                  <View className="flex-row justify-between py-2 border-b border-gray-100">
                    <Text className="text-sm font-NunitoMedium text-gray-600">Estimated Cost</Text>
                    <Text className="text-sm font-NunitoBold text-gray-900">
                      ₦{parseFloat(request.estimated_cost).toLocaleString()}
                    </Text>
                  </View>
                )}
                
                {request.actual_cost && (
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm font-NunitoMedium text-gray-600">Actual Cost</Text>
                    <Text className="text-sm font-NunitoBold text-gray-900">
                      ₦{parseFloat(request.actual_cost).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Cancellation Reason */}
          {request.cancellation_reason && (
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
                Cancellation Reason
              </Text>
              <Text className="text-sm font-NunitoMedium text-gray-900">
                {request.cancellation_reason}
              </Text>
            </View>
          )}

          <View className="h-10" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MechanicOrderDetails;

