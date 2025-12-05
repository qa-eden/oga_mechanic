"use client";

import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import CustomButton from '@/components/CustomButton';
import TextArea from '@/components/forms/TextArea';
import CustomAlert from '@/components/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useRepairRequestDetail, useAcceptRepairRequest, useDeclineRepairRequest, useUpdateRepairRequestStatus, useCancelRepairRequest } from '@/hooks/useRepairRequests';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { getErrorMessage } from '@/utils/errorMessages';
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
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { showSuccess, showError, showWarning, visible, alertConfig, hideAlert } = useCustomAlert();

  // Fetch repair request detail from API
  const { 
    data: orderData, 
    isLoading: isLoadingData, 
    error: errorData, 
    refetch 
  } = useRepairRequestDetail(orderId);

  // Fetch vehicle makes to resolve make/model names
  const { data: vehicleMakes } = useVehicleMakes();

  // Mutations for accepting/declining requests
  const acceptRequestMutation = useAcceptRepairRequest();
  const declineRequestMutation = useDeclineRepairRequest();
  const updateStatusMutation = useUpdateRepairRequestStatus();
  const cancelRequestMutation = useCancelRepairRequest();

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
      case 'in_transit':
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
        return 'Accepted User Request';
      case 'in_transit':
        return 'In Transit to Customer';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed by Mechanic';
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

  // Helper function to extract error message from API response
  const getApiErrorMessage = (error: any): string => {
    // Check for API response with status: false and message field
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Check for error in response data directly (in case response is successful HTTP but business logic failed)
    if (error?.response?.data?.status === false && error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Fallback to generic error message handler
    return getErrorMessage(error, 'general');
  };

  const handleAccept = async () => {
    if (!orderId) return;
    
    try {
      await acceptRequestMutation.mutateAsync(orderId);
      refetch(); // Refetch to get updated status
      showSuccess(
        'Success',
        'Repair request accepted successfully.'
      );
    } catch (error: any) {
      try {
        const errorMessage = getApiErrorMessage(error);
        showError('Accept failed', errorMessage);
      } catch (alertError) {
        console.error('Error displaying error message:', alertError);
        showError('Accept failed', 'An error occurred. Please try again.');
      }
    }
  };

  const handleDecline = async () => {
    if (!orderId) return;
    
    try {
      await declineRequestMutation.mutateAsync(orderId);
      refetch(); // Refetch to get updated status
      showSuccess(
        'Success',
        'Repair request declined successfully.'
      );
    } catch (error: any) {
      try {
        const errorMessage = getApiErrorMessage(error);
        showError('Decline failed', errorMessage);
      } catch (alertError) {
        console.error('Error displaying error message:', alertError);
        showError('Decline failed', 'An error occurred. Please try again.');
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!orderId) return;
    
    try {
      await updateStatusMutation.mutateAsync({ requestId: orderId, status });
      refetch();
      showSuccess(
        'Success',
        'Status updated successfully.'
      );
    } catch (error: any) {
      try {
        const errorMessage = getApiErrorMessage(error);
        showError('Update failed', errorMessage);
      } catch (alertError) {
        console.error('Error displaying error message:', alertError);
        showError('Update failed', 'An error occurred. Please try again.');
      }
    }
  };

  const handleCancelRequest = async () => {
    if (!orderId || !cancelReason.trim()) {
      showWarning('Validation', 'Please provide a reason for cancellation.');
      return;
    }
    
    try {
      await cancelRequestMutation.mutateAsync({ requestId: orderId, reason: cancelReason.trim() });
      setCancelModalVisible(false);
      setCancelReason('');
      refetch();
      showSuccess(
        'Success',
        'Repair request cancelled successfully.'
      );
    } catch (error: any) {
      try {
        const errorMessage = getApiErrorMessage(error);
        showError('Cancellation failed', errorMessage);
      } catch (alertError) {
        console.error('Error displaying error message:', alertError);
        showError('Cancellation failed', 'An error occurred. Please try again.');
      }
    }
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
            colors={['#D30309']}
            tintColor="#D30309"
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

          <View className="" />
        </View>
      </ScrollView>

      {/* Action Buttons - Conditional based on status */}
      {orderId && (status === 'pending' || status === 'accepted' || status === 'in_transit' || status === 'in_progress') && (
        <View className="bg-white border-t border-gray-200 px-5 py-4 pb-12">
          <View className="flex-row space-x-3 gap-3">
            {/* Pending: Accept and Decline */}
            {status === 'pending' && (
              <>
                <TouchableOpacity
                  onPress={handleAccept}
                  disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
                  className={`flex-1 bg-green-100 border border-[#00984C] rounded-[.4rem] py-3 ${
                    acceptRequestMutation.isPending || declineRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <Text className="text-green-700 font-NunitoSemiBold text-center">
                    {acceptRequestMutation.isPending ? 'Accepting...' : '✓ Accept'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDecline}
                  disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
                  className={`flex-1 bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                    acceptRequestMutation.isPending || declineRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <Text className="text-[#E10000] font-NunitoSemiBold text-center">
                    {declineRequestMutation.isPending ? 'Declining...' : '✗ Decline'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Accepted: In Transit and Cancel */}
            {status === 'accepted' && (
              <>
                <TouchableOpacity
                  onPress={() => handleUpdateStatus('in_transit')}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 bg-blue-100 border border-blue-600 rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <Text className="text-blue-700 font-NunitoSemiBold text-center">
                    {updateStatusMutation.isPending ? 'Updating...' : '🚚 In Transit'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCancelModalVisible(true)}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <Text className="text-[#E10000] font-NunitoSemiBold text-center">
                    ✗ Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* In Transit: In Progress and Cancel */}
            {status === 'in_transit' && (
              <>
                <TouchableOpacity
                  onPress={() => handleUpdateStatus('in_progress')}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 bg-green-100 border border-green-600 rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <Text className="text-green-700 font-NunitoSemiBold text-center">
                    {updateStatusMutation.isPending ? 'Updating...' : '🔧 In Progress'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCancelModalVisible(true)}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <Text className="text-[#E10000] font-NunitoSemiBold text-center">
                    ✗ Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* In Progress: Cancel only */}
            {status === 'in_progress' && (
              <TouchableOpacity
                onPress={() => setCancelModalVisible(true)}
                disabled={cancelRequestMutation.isPending}
                className={`flex-1 bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                  cancelRequestMutation.isPending ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-[#E10000] font-NunitoSemiBold text-center">
                  {cancelRequestMutation.isPending ? 'Cancelling...' : '✗ Cancel'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Cancel Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            {/* Backdrop - tap to dismiss keyboard */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="absolute inset-0 bg-black/50" />
            </TouchableWithoutFeedback>
            
            {/* Modal Content */}
            <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8 max-h-[80%]">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
              >
                {/* Drawer Handle */}
                <View className="items-center mb-6">
                  <View className="w-12 h-1 bg-gray-300 rounded-full" />
                </View>

                {/* Icon */}
                <View className="items-center mb-4">
                  <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                    <Text className="text-red-600 text-2xl font-bold">✗</Text>
                  </View>
                </View>

                {/* Title */}
                <Text className="text-xl font-NunitoBold text-left text-gray-800 mb-3">
                  Cancel Repair Request
                </Text>

                {/* Message */}
                <Text className="text-gray-600 text-left mb-6 font-NunitoRegular leading-6">
                  Please provide a reason for cancelling this repair request. This action cannot be undone.
                </Text>

                {/* Reason Input */}
                <View className="mb-6">
                  <TextArea
                    label="Cancellation Reason"
                    placeholder="Enter reason for cancellation..."
                    value={cancelReason}
                    onChangeText={setCancelReason}
                    rows={4}
                    required
                  />
                </View>

                {/* Buttons */}
                <View className="space-y-3 pb-4">
                  <CustomButton
                    onPress={handleCancelRequest}
                    title="Cancel Request"
                    bgVariant="danger"
                    textVariant="default"
                    className=""
                    loading={cancelRequestMutation.isPending}
                    loadingText="Cancelling"
                    disabled={!cancelReason.trim() || cancelRequestMutation.isPending}
                  />

                  <CustomButton
                    onPress={() => {
                      Keyboard.dismiss();
                      setCancelModalVisible(false);
                      setCancelReason('');
                    }}
                    title="Back"
                    bgVariant="outline"
                    textVariant="outline"
                    className="mt-3"
                    disabled={cancelRequestMutation.isPending}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={visible}
        title={alertConfig?.title || ""}
        message={alertConfig?.message || ""}
        type={alertConfig?.type || 'info'}
        onClose={hideAlert}
        autoDismiss={alertConfig?.autoDismiss}
        autoDismissDelay={alertConfig?.autoDismissDelay}
      />
    </SafeAreaView>
  );
};

export default MechanicOrderDetails;