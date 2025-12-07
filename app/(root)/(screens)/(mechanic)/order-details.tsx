"use client";

import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import CustomAlert from '@/components/CustomAlert';
import MechanicActionConfirmationModal, { MechanicActionType } from '@/components/modals/MechanicActionConfirmationModal';
import MechanicCancelRequestModal from '@/components/modals/MechanicCancelRequestModal';
import JobCompletedModal from '@/components/modals/JobCompletedModal';
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
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from 'react-native-heroicons/solid';

const MechanicOrderDetails = () => {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params?.orderId) ? params?.orderId[0] : (params?.orderId as string | undefined);

  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<MechanicActionType | null>(null);
  const [jobCompletedModalVisible, setJobCompletedModalVisible] = useState(false);
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Copy address to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      // Using React Native's deprecated Clipboard API as fallback
      // In production, use expo-clipboard
      await Linking.openURL(`clipboard:${text}`);
      showSuccess('Copied!', 'Address copied to clipboard');
    } catch {
      // Fallback: show the address in an alert for manual copying
      Alert.alert('Address', text, [{ text: 'OK' }]);
    }
  };

  // Open address in maps
  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });

    Linking.openURL(url as string).catch(() => {
      showError('Error', 'Unable to open maps application');
    });
  };

  // Add to calendar
  const addToCalendar = (date: string, timeSlot: string, address: string, serviceType: string) => {
    const eventDate = new Date(date);

    // Create calendar event URL (works with Google Calendar)
    const title = encodeURIComponent(`Repair Job - ${serviceType}`);
    const location = encodeURIComponent(address || 'Customer Location');
    const details = encodeURIComponent(`Scheduled repair job. Time slot: ${timeSlot}`);

    // Format dates for Google Calendar
    const startDate = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}&sf=true&output=xml`;

    Linking.openURL(calendarUrl).catch(() => {
      showError('Error', 'Unable to open calendar');
    });
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

  const openActionConfirmation = (action: MechanicActionType) => {
    setActionType(action);
    setActionModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!orderId || !actionType) return;

    try {
      if (actionType === 'accept') {
        await acceptRequestMutation.mutateAsync(orderId);
        // Await refetch to ensure data is updated before showing success alert
        await refetch();
        setActionModalVisible(false);
        setActionType(null);
        showSuccess('Success', 'Repair request accepted successfully.');
      } else if (actionType === 'decline') {
        await declineRequestMutation.mutateAsync(orderId);
        // Await refetch to ensure data is updated before showing success alert
        await refetch();
        setActionModalVisible(false);
        setActionType(null);
        showSuccess('Success', 'Repair request declined successfully.');
      } else {
        // Status updates: in_transit, in_progress, completed
        await updateStatusMutation.mutateAsync({ requestId: orderId, status: actionType });

        // Show job completed modal for completed status
        if (actionType === 'completed') {
          setActionModalVisible(false);
          setActionType(null);
          // Await refetch before showing modal
          await refetch();
          setJobCompletedModalVisible(true);
          return;
        }

        // Await refetch to ensure data is updated before showing success alert
        await refetch();
        setActionModalVisible(false);
        setActionType(null);
        showSuccess('Success', 'Status updated successfully.');
      }
    } catch (error: any) {
      try {
        const errorMessage = getApiErrorMessage(error);
        showError('Action failed', errorMessage);
      } catch (alertError) {
        console.error('Error displaying error message:', alertError);
        showError('Action failed', 'An error occurred. Please try again.');
      }
    }
  };

  const handleCancelActionModal = () => {
    setActionModalVisible(false);
    setActionType(null);
  };

  const isActionPending = () => {
    return acceptRequestMutation.isPending ||
           declineRequestMutation.isPending ||
           updateStatusMutation.isPending;
  };

  const handleCancelRequest = async () => {
    // Determine the reason to send
    const reason = selectedCancelReason === 'Other' ? cancelReason.trim() : selectedCancelReason;

    if (!orderId || !reason) {
      showWarning('Validation', 'Please select a reason for cancellation.');
      return;
    }

    try {
      await cancelRequestMutation.mutateAsync({ requestId: orderId, reason });
      setCancelModalVisible(false);
      setCancelReason('');
      setSelectedCancelReason('');
      // Await refetch to ensure data is updated before showing success alert
      await refetch();
      showSuccess(
        'Job Cancelled',
        'The repair request has been cancelled successfully.'
      );
    } catch (error: any) {
      try {
        const errorMessage = getApiErrorMessage(error);
        showError('Cancellation Failed', errorMessage);
      } catch (alertError) {
        console.error('Error displaying error message:', alertError);
        showError('Cancellation Failed', 'An error occurred. Please try again.');
      }
    }
  };

  const handleCloseCancelModal = () => {
    setCancelModalVisible(false);
    setCancelReason('');
    setSelectedCancelReason('');
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
          {/* Status Banner */}
          <View className={`rounded-2xl p-4 mb-5 ${
            status === 'pending' ? 'bg-amber-50 border-2 border-amber-200' :
            status === 'accepted' ? 'bg-blue-50 border-2 border-blue-200' :
            status === 'in_transit' ? 'bg-indigo-50 border-2 border-indigo-200' :
            status === 'in_progress' ? 'bg-orange-50 border-2 border-orange-200' :
            status === 'completed' ? 'bg-green-50 border-2 border-green-200' :
            status === 'cancelled' || status === 'declined' ? 'bg-red-50 border-2 border-red-200' :
            'bg-gray-50 border-2 border-gray-200'
          }`}>
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                status === 'pending' ? 'bg-amber-100' :
                status === 'accepted' ? 'bg-blue-100' :
                status === 'in_transit' ? 'bg-indigo-100' :
                status === 'in_progress' ? 'bg-orange-100' :
                status === 'completed' ? 'bg-green-100' :
                status === 'cancelled' || status === 'declined' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {status === 'pending' && <ClockIcon size={24} color="#D97706" />}
                {status === 'accepted' && <CheckCircleIcon size={24} color="#2563EB" />}
                {status === 'in_transit' && <TruckIcon size={24} color="#4F46E5" />}
                {status === 'in_progress' && <WrenchScrewdriverIcon size={24} color="#EA580C" />}
                {status === 'completed' && <CheckCircleSolidIcon size={24} color="#16A34A" />}
                {(status === 'cancelled' || status === 'declined') && <XCircleIcon size={24} color="#DC2626" />}
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-NunitoBold ${
                  status === 'pending' ? 'text-amber-800' :
                  status === 'accepted' ? 'text-blue-800' :
                  status === 'in_transit' ? 'text-indigo-800' :
                  status === 'in_progress' ? 'text-orange-800' :
                  status === 'completed' ? 'text-green-800' :
                  status === 'cancelled' || status === 'declined' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {getStatusLabel(status)}
                </Text>
                <Text className={`text-sm font-NunitoRegular mt-0.5 ${
                  status === 'pending' ? 'text-amber-600' :
                  status === 'accepted' ? 'text-blue-600' :
                  status === 'in_transit' ? 'text-indigo-600' :
                  status === 'in_progress' ? 'text-orange-600' :
                  status === 'completed' ? 'text-green-600' :
                  status === 'cancelled' || status === 'declined' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {status === 'pending' && 'Waiting for your response'}
                  {status === 'accepted' && 'Head to customer location'}
                  {status === 'in_transit' && 'On your way to customer'}
                  {status === 'in_progress' && 'Working on the repair'}
                  {status === 'completed' && 'Job successfully completed'}
                  {status === 'cancelled' && 'This job was cancelled'}
                  {status === 'declined' && 'You declined this request'}
                </Text>
              </View>
            </View>
          </View>

          {/* Customer Information Card */}
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
                  <Text className="text-xs font-NunitoMedium text-gray-500 uppercase tracking-wider ml-1">
                    Additional Notes
                  </Text>
                </View>
                <Text className="text-sm font-NunitoMedium text-gray-800 leading-5">
                  {request.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Schedule Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <CalendarIcon size={20} color="#374151" />
                </View>
                <Text className="text-lg font-NunitoBold text-gray-900">
                  Schedule
                </Text>
              </View>
              {/* Add to Calendar Button */}
              <TouchableOpacity
                onPress={() => addToCalendar(
                  request.preferred_date || request.requested_at,
                  request.preferred_time_slot,
                  request.service_address,
                  request.service_type || 'Repair'
                )}
                className="flex-row items-center bg-gray-900 px-3 py-2 rounded-lg"
              >
                <CalendarDaysIcon size={16} color="#FFFFFF" />
                <Text className="text-xs font-NunitoSemiBold text-white ml-1">
                  Add to Calendar
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                {formatDate(request.preferred_date || request.requested_at)}
              </Text>
              <View className="flex-row items-center mt-2">
                <ClockIcon size={16} color="#6B7280" />
                <Text className="text-sm font-NunitoSemiBold text-gray-600 ml-2">
                  {formatTime(request.preferred_time_slot)} slot
                </Text>
              </View>
            </View>
          </View>

          {/* Service Address Card */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <MapPinIcon size={20} color="#374151" />
              </View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Service Location
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-3 mb-3">
              <Text className="text-sm font-NunitoMedium text-gray-800 leading-5">
                {request.service_address || 'No address provided'}
              </Text>
            </View>

            {/* Action Buttons */}
            {request.service_address && (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => openInMaps(request.service_address)}
                  className="flex-1 flex-row items-center justify-center bg-gray-900 py-3 rounded-xl"
                >
                  <MapPinIcon size={18} color="#FFFFFF" />
                  <Text className="text-sm font-NunitoSemiBold text-white ml-2">
                    View on Map
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => copyToClipboard(request.service_address)}
                  className="flex-row items-center justify-center bg-gray-100 px-4 py-3 rounded-xl"
                >
                  <ClipboardDocumentIcon size={18} color="#6B7280" />
                  <Text className="text-sm font-NunitoSemiBold text-gray-700 ml-2">
                    Copy
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Order Timeline - Visual Tracker */}
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
                    request.in_progress_at ? 'bg-green-500' : 'bg-gray-200'
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

              {/* Step 4: Work Started */}
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
                    request.completed_at ? 'bg-green-500' :
                    request.cancelled_at ? 'bg-red-500' : 'bg-gray-200'
                  }`}>
                    {request.completed_at ? (
                      <CheckCircleSolidIcon size={20} color="#FFFFFF" />
                    ) : request.cancelled_at ? (
                      <XCircleIcon size={20} color="#FFFFFF" />
                    ) : (
                      <View className="w-3 h-3 rounded-full bg-gray-400" />
                    )}
                  </View>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-NunitoBold ${
                    request.completed_at ? 'text-green-700' :
                    request.cancelled_at ? 'text-red-700' : 'text-gray-400'
                  }`}>
                    {request.cancelled_at ? 'Job Cancelled' : 'Job Completed'}
                  </Text>
                  <Text className="text-xs font-NunitoRegular text-gray-500 mt-0.5">
                    {request.completed_at ? formatDateTime(request.completed_at) :
                     request.cancelled_at ? formatDateTime(request.cancelled_at) : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cost Information */}
          {(request.estimated_cost || request.actual_cost) && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-lg">₦</Text>
                </View>
                <Text className="text-lg font-NunitoBold text-gray-900">
                  Earnings
                </Text>
              </View>

              <View className="flex-row gap-3">
                {request.estimated_cost && (
                  <View className="flex-1 bg-gray-50 rounded-xl p-3">
                    <Text className="text-xs font-NunitoMedium text-gray-500 uppercase tracking-wider">
                      Estimated
                    </Text>
                    <Text className="text-lg font-NunitoBold text-gray-900 mt-1">
                      ₦{parseFloat(request.estimated_cost).toLocaleString()}
                    </Text>
                  </View>
                )}

                {request.actual_cost && (
                  <View className="flex-1 bg-gray-100 rounded-xl p-3">
                    <Text className="text-xs font-NunitoMedium text-gray-600 uppercase tracking-wider">
                      Final Amount
                    </Text>
                    <Text className="text-lg font-NunitoBold text-gray-900 mt-1">
                      ₦{parseFloat(request.actual_cost).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Cancellation Reason - keeping red since it's important status */}
          {request.cancellation_reason && (
            <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-2">
                  <XCircleIcon size={18} color="#374151" />
                </View>
                <Text className="text-base font-NunitoBold text-gray-900">
                  Cancellation Reason
                </Text>
              </View>
              <Text className="text-sm font-NunitoMedium text-gray-700 leading-5">
                {request.cancellation_reason}
              </Text>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-4" />
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
                  onPress={() => openActionConfirmation('accept')}
                  disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-green-100 border border-[#00984C] rounded-[.4rem] py-3 ${
                    acceptRequestMutation.isPending || declineRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <CheckCircleIcon size={18} color="#16A34A" />
                  <Text className="text-green-700 font-NunitoSemiBold ml-2">
                    Accept
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openActionConfirmation('decline')}
                  disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                    acceptRequestMutation.isPending || declineRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <XCircleIcon size={18} color="#DC2626" />
                  <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                    Decline
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Accepted: In Transit and Cancel */}
            {status === 'accepted' && (
              <>
                <TouchableOpacity
                  onPress={() => openActionConfirmation('in_transit')}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-blue-100 border border-blue-600 rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <TruckIcon size={18} color="#1D4ED8" />
                  <Text className="text-blue-700 font-NunitoSemiBold ml-2">
                    Start Transit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCancelModalVisible(true)}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <XCircleIcon size={18} color="#DC2626" />
                  <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                    Cancel Job
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* In Transit: In Progress and Cancel */}
            {status === 'in_transit' && (
              <>
                <TouchableOpacity
                  onPress={() => openActionConfirmation('in_progress')}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-green-100 border border-green-600 rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <WrenchScrewdriverIcon size={18} color="#16A34A" />
                  <Text className="text-green-700 font-NunitoSemiBold ml-2">
                    Start Work
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCancelModalVisible(true)}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <XCircleIcon size={18} color="#DC2626" />
                  <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                    Cancel Job
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* In Progress: Complete */}
            {status === 'in_progress' && (
              <TouchableOpacity
                onPress={() => openActionConfirmation('completed')}
                disabled={updateStatusMutation.isPending}
                className={`flex-1 flex-row items-center justify-center bg-green-100 border border-[#00984C] rounded-[.4rem] py-3 ${
                  updateStatusMutation.isPending ? 'opacity-50' : ''
                }`}
              >
                <CheckCircleIcon size={18} color="#16A34A" />
                <Text className="text-green-700 font-NunitoSemiBold ml-2">
                  Job Completed
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Cancel Modal */}
      <MechanicCancelRequestModal
        visible={cancelModalVisible}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelRequest}
        cancelReason={cancelReason}
        selectedCancelReason={selectedCancelReason}
        onReasonChange={setCancelReason}
        onSelectedReasonChange={setSelectedCancelReason}
        isLoading={cancelRequestMutation.isPending}
      />

      {/* Action Confirmation Modal */}
      <MechanicActionConfirmationModal
        visible={actionModalVisible}
        actionType={actionType}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelActionModal}
        isLoading={isActionPending()}
      />

      {/* Job Completed Success Modal */}
      <JobCompletedModal
        visible={jobCompletedModalVisible}
        onClose={() => setJobCompletedModalVisible(false)}
        showViewEarnings={true}
      />

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