"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { useLocalSearchParams, router } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import CustomAlert from '@/components/CustomAlert';
import MechanicActionConfirmationModal, { MechanicActionType } from '@/components/modals/MechanicActionConfirmationModal';
import MechanicCancelRequestModal from '@/components/modals/MechanicCancelRequestModal';
import JobCompletedModal from '@/components/modals/JobCompletedModal';
import JobCompletionFormModal from '@/components/modals/JobCompletionFormModal';
import MechanicOTPVerificationModal from '@/components/modals/MechanicOTPVerificationModal';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useRepairRequestDetail, useAcceptRepairRequest, useDeclineRepairRequest, useUpdateRepairRequestStatus, useCancelRepairRequest, useUpdateRepairRequest, useVerifyRepairRequestOtp } from '@/hooks/useRepairRequests';
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
  ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from 'react-native-heroicons/solid';
import MapView, { Marker } from '@/components/MapComponent';
import { PhoneIcon, ChatBubbleLeftRightIcon } from 'react-native-heroicons/outline';
import { routes } from '@/constants/routes';

const MechanicOrderDetails = () => {
  const params = useLocalSearchParams();
  const orderId = useMemo(() => Array.isArray(params?.orderId) ? params?.orderId[0] : (params?.orderId as string | undefined), [params?.orderId]);
  
  const isFocused = useIsFocused();
  const pollInterval = isFocused ? 25000 : 0;

  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<MechanicActionType | null>(null);
  const [jobCompletedModalVisible, setJobCompletedModalVisible] = useState(false);
  const [completionFormVisible, setCompletionFormVisible] = useState(false);
  const [isFinishingJob, setIsFinishingJob] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const { showSuccess, showError, showWarning, visible, alertConfig, hideAlert } = useCustomAlert();
  
  // Copy to clipboard state
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);



  // Location tracking state
  const [mechanicLocation, setMechanicLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Fetch repair request detail from API
  const { 
    data: orderData, 
    isLoading: isLoadingData, 
    error: errorData, 
    refetch 
  } = useRepairRequestDetail(orderId, pollInterval);


  // Fetch vehicle makes to resolve make/model names
  const { data: vehicleMakes } = useVehicleMakes();

  const request = orderData?.data;
  const customer = request?.customer;
  const status = request?.status || 'pending';

  // Auto-show OTP modal when status is arrived and not verified
  useEffect(() => {
    if (status === 'arrived' && !request?.is_otp_verified) {
      setOtpModalVisible(true);
    }
  }, [status, request?.is_otp_verified]);

  // Mutations for accepting/declining requests
  const acceptRequestMutation = useAcceptRepairRequest();
  const declineRequestMutation = useDeclineRepairRequest();
  const updateStatusMutation = useUpdateRepairRequestStatus();
  const cancelRequestMutation = useCancelRepairRequest();
  const updateRepairRequestMutation = useUpdateRepairRequest();
  const verifyOtpMutation = useVerifyRepairRequestOtp();

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

  // Track location when in transit
  useEffect(() => {
    let isMounted = true;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            showError('Permission Denied', 'Location permission is required for live tracking.');
            return;
        }

        // Initial location with fallback to last known if current fails
        let location;
        try {
            location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
        } catch (err) {
            console.warn('Failed to get current position, trying last known:', err);
            location = await Location.getLastKnownPositionAsync({});
        }

        if (isMounted && location) {
            setMechanicLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        }

        // Watch location if in transit
        if (orderData?.data?.status === 'in_transit') {
            try {
                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 10000,
                        distanceInterval: 10,
                    },
                    (location) => {
                        if (isMounted) {
                            setMechanicLocation({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            });
                        }
                    }
                );
            } catch (err) {
                console.error('Error starting location watch:', err);
            }
        }
      } catch (error) {
        console.error('General location error:', error);
      }
    };

    if (orderId && (orderData?.data?.status === 'accepted' || orderData?.data?.status === 'in_transit')) {
        startTracking();
    }

    return () => {
        isMounted = false;
        if (locationSubscription.current) {
            locationSubscription.current.remove();
        }
    };
  }, [orderId, orderData?.data?.status]);

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        showError('Error', 'Unable to initiate phone call');
    });
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed' || status === 'verify_completed') {
      return (status === 'verify_completed' || request?.verify_completed_at) ? 'Job Verified' : 'Awaiting Verification';
    }
    switch (status) {
      case 'pending':
        return 'New Request';
      case 'accepted':
        return 'Accepted';
      case 'in_transit':
        return 'In Transit';
      case 'arrived':
        return 'Arrived';
      case 'in_progress':
        return 'In Progress';
      case 'cancelled':
        return 'Cancelled';
      case 'declined':
        return 'Declined';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  const getOtpDisplayValue = (otp: string | number | undefined): string => {
    if (!otp) return '------';
    const otpStr = otp.toString();
    return otpStr.length >= 6 ? otpStr : otpStr.padStart(6, '0');
  };

  const handleVerifyOtp = async (otp: string | number) => {
    if (!orderId) return;
    
    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      await verifyOtpMutation.mutateAsync({ 
        requestId: orderId, 
        otpCode: otp.toString() 
      });
      
      setIsVerifyingOtp(false);
      setOtpModalVisible(false);
      showSuccess('Verified', 'Arrival code verified successfully. Starting repair...');
      
      // Auto-trigger status update to in_progress
      try {
        await updateStatusMutation.mutateAsync({ 
          requestId: orderId, 
          status: 'in_progress' 
        });
        await refetch();
      } catch (statusError) {
        console.error('Failed to auto-update status:', statusError);
        // We don't show an error here because OTP was verified successfully, 
        // the mechanic can still manually update status if needed.
      }
      
    } catch (error: any) {
      setIsVerifyingOtp(false);
      const errorMessage = getApiErrorMessage(error);
      setOtpError(errorMessage || 'Invalid verification code. Please ask the customer for the correct 6-digit code.');
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
      if (!text || text.trim() === '') {
        return;
      }
      await Clipboard.setStringAsync(text);
      setIsCopied(true);
      
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      
      // Reset after 3 seconds
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

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
        // Show job completion form instead of immediate update for completed status
        if (actionType === 'completed') {
          setActionModalVisible(false);
          setActionType(null);
          setCompletionFormVisible(true);
          return;
        }

        // Status updates: in_transit, in_progress, completed
        await updateStatusMutation.mutateAsync({ requestId: orderId, status: actionType });

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

  const handleFinalizeJob = async (resolutions: any[]) => {
    if (!orderId) return;
    
    setIsFinishingJob(true);
    try {
      await updateRepairRequestMutation.mutateAsync({
        requestId: orderId,
        payload: {
          data: {
            status: 'completed',
            problem_resolutions: resolutions
          },
          requestType: 'inbound'
        }
      });
      
      setCompletionFormVisible(false);
      await refetch();
      setJobCompletedModalVisible(true);
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error);
      showError('Update Failed', errorMessage);
    } finally {
      setIsFinishingJob(false);
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

          {/* Live Tracking Map for Mechanic */}
          {(status === 'accepted' || status === 'in_transit' || status === 'arrived') && request.service_latitude && request.service_longitude && (
            <View className="rounded-2xl overflow-hidden h-64 mb-5 border-2 border-gray-100 shadow-sm">
                <MapView
                    initialRegion={{
                        latitude: request.service_latitude,
                        longitude: request.service_longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    style={{ flex: 1 }}
                >
                    {/* Destination Marker (User) */}
                    <Marker coordinate={{ latitude: request.service_latitude, longitude: request.service_longitude }}>
                        <View className="bg-red-500 p-2 rounded-full border-2 border-white shadow-md">
                            <UserIcon size={20} color="#FFFFFF" />
                        </View>
                    </Marker>

                    {/* Current Position Marker (Mechanic) */}
                    {mechanicLocation && (
                        <Marker coordinate={mechanicLocation}>
                            <View className="bg-gray-900 p-2 rounded-full border-2 border-white shadow-md">
                                <TruckIcon size={20} color="#FFFFFF" />
                            </View>
                        </Marker>
                    )}
                </MapView>
                <View className="absolute bottom-3 left-3 right-3 bg-white/95 p-3 rounded-lg border border-gray-100 flex-row items-center">
                    <MapPinIcon size={16} color="#6B7280" />
                    <Text className="text-xs font-NunitoMedium text-gray-600 ml-2 flex-1" numberOfLines={1}>
                        Destination: {request.service_address || 'Customer Location'}
                    </Text>
                </View>
            </View>
          )}

          {/* Action Buttons for communication */}
          {(status === 'accepted' || status === 'in_transit' || status === 'arrived') && (
            <View className="flex-row items-center justify-between mb-5 gap-3">
              <TouchableOpacity
                onPress={() => handleCall(customer?.phone_number || '')}
                className="flex-1 flex-row items-center justify-center bg-gray-50 py-3 rounded-xl border border-gray-200"
              >
                <PhoneIcon size={18} color="#374151" />
                <Text className="text-sm font-NunitoBold text-gray-700 ml-2">Call Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(routes.chatSeller as any)}
                className="flex-1 flex-row items-center justify-center bg-blue-600 py-3 rounded-xl shadow-sm"
              >
                <ChatBubbleLeftRightIcon size={18} color="#FFFFFF" />
                <Text className="text-sm font-NunitoBold text-white ml-2">Chat Support</Text>
              </TouchableOpacity>
            </View>
          )}

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

          {/* Arrival Verification OTP */}
          {(status === 'accepted' || status === 'in_transit' || status === 'arrived') && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <ShieldCheckIcon size={20} color="#374151" />
                  </View>
                  <Text className="text-lg font-NunitoBold text-gray-900">Verification OTP</Text>
                </View>
                {request?.is_otp_verified ? (
                  <View className="bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    <Text className="text-[10px] font-NunitoBold text-green-700">VERIFIED</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(request?.otp_code?.toString() || '')}
                    className={`p-2 rounded-lg border ${isCopied ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <ClipboardDocumentIcon size={18} color={isCopied ? "#10B981" : "#6B7280"} />
                  </TouchableOpacity>
                )}
              </View>

              <View className="bg-gray-50 rounded-xl p-4 items-center">
                <Text className="text-xs font-NunitoBold text-gray-400 uppercase tracking-widest mb-3">
                  Customer Verification Code
                </Text>
                <View className="flex-row items-center space-x-2 gap-2">
                  {getOtpDisplayValue(request?.otp_code).split('').map((digit, i) => (
                    <View key={i} className={`w-9 h-11 ${request?.is_otp_verified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'} border rounded-lg items-center justify-center shadow-sm`}>
                      <Text className={`text-xl font-NunitoExtraBold ${request?.is_otp_verified ? 'text-green-700' : 'text-gray-900'}`}>{digit}</Text>
                    </View>
                  ))}
                </View>
                {!request?.is_otp_verified && (
                  <Text className="text-[10px] font-NunitoMedium text-gray-400 mt-2 text-center">
                    Ask the customer for the verification code once you arrive.
                  </Text>
                )}
              </View>
            </View>
          )}

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
                  className={`flex-row items-center justify-center ${isCopied ? 'bg-green-100' : 'bg-gray-100'} px-4 py-3 rounded-xl`}
                >
                  {isCopied ? (
                    <Text className="text-sm font-NunitoSemiBold text-green-700">
                      Copied
                    </Text>
                  ) : (
                    <>
                      <ClipboardDocumentIcon size={18} color="#6B7280" />
                      <Text className="text-sm font-NunitoSemiBold text-gray-700 ml-2">
                        Copy
                      </Text>
                    </>
                  )}
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
                <View className="flex-1">
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

          {/* Cost Information */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                <Text className="text-lg">₦</Text>
              </View>
              <Text className="text-lg font-NunitoBold text-gray-900">
                Cost Information
              </Text>
            </View>

            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
              <Text className="text-xs font-NunitoMedium text-red-700 uppercase tracking-wider">
                Estimated Cost
              </Text>
              {request.estimated_cost ? (
                <Text className="text-2xl font-NunitoExtraBold text-red-700 mt-1">
                  ₦{parseFloat(request.estimated_cost).toLocaleString()}
                </Text>
              ) : (
                <Text className="text-sm font-NunitoBold text-red-600 mt-1">
                  Awaiting estimate
                </Text>
              )}
            </View>

            <View className="bg-gray-100 rounded-xl p-3">
              <Text className="text-xs font-NunitoMedium text-gray-600 uppercase tracking-wider">
                Final Amount
              </Text>
              {request.actual_cost ? (
                <Text className="text-lg font-NunitoBold text-gray-900 mt-1">
                  ₦{parseFloat(request.actual_cost).toLocaleString()}
                </Text>
              ) : (
                <Text className="text-sm font-NunitoBold text-gray-500 mt-1">
                  Not set yet
                </Text>
              )}
            </View>
          </View>

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
      {orderId && (status === 'pending' || status === 'accepted' || status === 'in_transit' || status === 'arrived' || status === 'in_progress') && (
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

            {/* In Transit: Confirm Arrival and Cancel */}
            {status === 'in_transit' && (
              <>
                <TouchableOpacity
                  onPress={() => openActionConfirmation('arrived')}
                  disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                  className={`flex-1 flex-row items-center justify-center bg-purple-100 border border-purple-600 rounded-[.4rem] py-3 ${
                    updateStatusMutation.isPending || cancelRequestMutation.isPending
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <MapPinIcon size={18} color="#7C3AED" />
                  <Text className="text-purple-700 font-NunitoSemiBold ml-2">
                    Confirm Arrival
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

            {/* Arrived: Verify OTP, then Start Work and Cancel */}
            {status === 'arrived' && (
              <>
                {!request?.is_otp_verified ? (
                  <TouchableOpacity
                    onPress={() => setOtpModalVisible(true)}
                    disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                    className={`flex-1 flex-row items-center justify-center bg-blue-100 border border-blue-600 rounded-[.4rem] py-3 ${
                      updateStatusMutation.isPending || cancelRequestMutation.isPending
                        ? 'opacity-50'
                        : ''
                    }`}
                  >
                    <ShieldCheckIcon size={18} color="#2563EB" />
                    <Text className="text-blue-700 font-NunitoSemiBold ml-2">
                      Verify Arrival
                    </Text>
                  </TouchableOpacity>
                ) : (
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
                )}

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

      {/* OTP Verification Modal */}
      <MechanicOTPVerificationModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        onVerify={handleVerifyOtp}
        isVerifying={isVerifyingOtp}
        error={otpError}
      />

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

      {/* Job Completion Form Modal */}
      <JobCompletionFormModal
        visible={completionFormVisible}
        onClose={() => setCompletionFormVisible(false)}
        onSubmit={handleFinalizeJob}
        isLoading={isFinishingJob}
      />

      {/* Action Confirmation Modal */}
      <MechanicActionConfirmationModal
        visible={actionModalVisible}
        actionType={actionType}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelActionModal}
        isLoading={isActionPending()}
      />

      {/* Job Success Modal */}
      <JobCompletedModal
        visible={jobCompletedModalVisible}
        onClose={() => setJobCompletedModalVisible(false)}
      />

      <CustomAlert
        visible={visible}
        title={alertConfig?.title || 'Alert'}
        message={alertConfig?.message || ''}
        type={alertConfig?.type || 'info'}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

export default MechanicOrderDetails;