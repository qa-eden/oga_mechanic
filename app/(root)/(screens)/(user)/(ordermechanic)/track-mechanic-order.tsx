import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import CustomButton from '@/components/CustomButton';
import { routes } from '@/constants/routes';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import { getErrorMessage } from '@/utils/errorMessages';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
import { 
  UserIcon, 
  WrenchScrewdriverIcon, 
  TruckIcon, 
  CalendarIcon, 
  MapPinIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from 'react-native-heroicons/outline';
import { useRepairRequestDetail, useCancelRepairRequest } from '@/hooks/useRepairRequests';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import MechanicReviewModal from '@/components/modals/MechanicReviewModal';
import CancelRequestModal from '@/components/modals/CancelRequestModal';
import { useCreateMechanicReview } from '@/hooks/useMechanics';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import CustomAlert from '@/components/CustomAlert';

interface OrderStatus {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string | null;
}

const TrackMechanicOrder = () => {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params?.orderId) ? params?.orderId[0] : (params?.orderId as string | undefined);
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>('');

  // Review mutation
  const createReviewMutation = useCreateMechanicReview();

  // Cancel request mutation
  const cancelRequestMutation = useCancelRepairRequest();

  // Custom Alert
  const { visible: alertVisible, alertConfig, hideAlert, showError, showSuccess, showInfo } = useCustomAlert();

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

  // Define status flow
  const statusFlow: OrderStatus[] = [
    {
      id: 'pending',
      label: 'Request Submitted',
      description: 'Your request has been sent to the mechanic',
      completed: false,
      active: false,
    },
    {
      id: 'accepted',
      label: 'Request Accepted',
      description: 'The mechanic has accepted your request',
      completed: false,
      active: false,
    },
    {
      id: 'on_way',
      label: 'Mechanic On The Way',
      description: 'The mechanic is coming to your location',
      completed: false,
      active: false,
    },
    {
      id: 'arrived',
      label: 'Mechanic Arrived',
      description: 'The mechanic has arrived at your location',
      completed: false,
      active: false,
    },
    {
      id: 'in_progress',
      label: 'Service In Progress',
      description: 'The mechanic is working on your vehicle',
      completed: false,
      active: false,
    },
    {
      id: 'completed',
      label: 'Service Completed',
      description: 'Your service has been completed',
      completed: false,
      active: false,
    },
  ];

  // Map API status to status flow
  const getStatusFlow = (currentStatus: string, orderTimestamps?: any) => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'accepted': 1,
      'on_way': 2,
      'arrived': 3,
      'in_progress': 4,
      'completed': 5,
      'cancelled': -1,
      'declined': -1,
    };

    const currentIndex = statusMap[currentStatus] ?? 0;

    // Map timestamps to status steps
    // Note: started_at might be used for multiple statuses (on_way, arrived, in_progress)
    // We'll use it for 'on_way' as it's the first status that requires the mechanic to start
    const timestampMap: Record<string, string | null> = {
      'pending': orderTimestamps?.requested_at || null,
      'accepted': orderTimestamps?.accepted_at || null,
      'on_way': orderTimestamps?.started_at || null,
      'arrived': orderTimestamps?.started_at || null,
      'in_progress': orderTimestamps?.started_at || null,
      'completed': orderTimestamps?.completed_at || null,
    };

    return statusFlow.map((status, index) => ({
      ...status,
      completed: index < currentIndex,
      active: index === currentIndex,
      timestamp: timestampMap[status.id] || null,
    }));
  };

  const mechanicId = orderData?.data?.mechanic?.id?.toString() || orderData?.data?.mechanic_id?.toString() || '';

  // Transform API data to component format
  const order = (() => {
    if (!orderData?.data) {
      return {
        id: orderId,
        mechanic_name: 'Loading...',
        mechanic_id: '',
        service_type: 'Loading...',
        vehicle_make: 'Loading...',
        vehicle_model: 'Loading...',
        vehicle_year: 0,
        problem_description: 'Loading...',
        service_address: 'Loading...',
        preferred_date: new Date().toISOString(),
        preferred_time_slot: 'Loading...',
        status: 'pending',
        notes: '',
      };
    }

    const request = orderData.data;
    const mechanicName = request.mechanic
      ? `${request.mechanic.first_name || ''} ${request.mechanic.last_name || ''}`.trim() || 'Unknown Mechanic'
      : 'Unknown Mechanic';

    const makeId = request.vehicle_make;
    const modelId = request.vehicle_model;
    const makeName = getMakeName(makeId);
    const modelName = getModelName(makeId, modelId);

    // Get mechanic ID from the mechanic object
    const mechanicId = request.mechanic?.id?.toString() || request.mechanic_id?.toString() || '';

    return {
      id: request.id?.toString() || orderId || '',
      mechanic_name: mechanicName,
      mechanic_id: mechanicId,
      service_type: request.service_type || '',
      vehicle_make: makeName,
      vehicle_model: modelName,
      vehicle_year: request.vehicle_year || 0,
      problem_description: request.problem_description || request.description || '',
      service_address: request.service_address || request.address || '',
      preferred_date: request.preferred_date || request.requested_at || new Date().toISOString(),
      preferred_time_slot: request.preferred_time_slot || request.time_slot || '',
      status: request.status || 'pending',
      notes: request.notes || '',
      // Status timestamps
      requested_at: request.requested_at || null,
      accepted_at: request.accepted_at || null,
      started_at: request.started_at || null,
      completed_at: request.completed_at || null,
      cancelled_at: request.cancelled_at || null,
    };
  })();

  const currentStatus = order.status || 'pending';
  const statusSteps = getStatusFlow(currentStatus, {
    requested_at: (order as any).requested_at,
    accepted_at: (order as any).accepted_at,
    started_at: (order as any).started_at,
    completed_at: (order as any).completed_at,
    cancelled_at: (order as any).cancelled_at,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedCancelReason && !cancelReason.trim()) {
      showError('Reason Required', 'Please select or provide a reason for cancellation.');
      return;
    }

    if (!orderId) {
      showError('Error', 'Order ID is missing. Cannot cancel request.');
      return;
    }

    try {
      setIsLoading(true);
      const finalReason = selectedCancelReason === 'Other' ? cancelReason.trim() : selectedCancelReason;
      
      await cancelRequestMutation.mutateAsync({
        requestId: orderId,
        cancellationReason: finalReason,
      });

      showSuccess('Request Cancelled', 'Your repair request has been cancelled.');
      setShowCancelModal(false);
      setSelectedCancelReason('');
      setCancelReason('');
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      showError('Error', 'Failed to cancel request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    // Get mechanic ID directly from API response (UUID string)
    const mechanicIdFromResponse = orderData?.data?.mechanic?.id?.toString() || '';
    
    if (!mechanicIdFromResponse) {
      showError('Error', 'Mechanic information not available.');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        mechanicId: mechanicIdFromResponse,
        payload: {
          data: {
            mechanic_id: mechanicIdFromResponse, // Use UUID string directly
            rating: rating,
            comment: comment,
          },
          requestType: 'inbound',
        },
      });
      showSuccess('Review Submitted', 'Thank you for your review!');
      setShowReviewModal(false);
    } catch (error) {
      showError('Error', 'Failed to submit review. Please try again.');
      throw error;
    }
  };

  const handleEdit = () => {
    setShowEditConfirmModal(true);
  };

  const handleConfirmEdit = () => {
    setShowEditConfirmModal(false);
    // Navigate to edit page with order ID
    router.push({
      pathname: routes.orderMechanic,
      params: {
        orderId: orderId || '',
        editMode: 'true',
        mechanicId: order.mechanic_id || '',
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'on_way':
      case 'arrived':
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
      case 'on_way':
        return 'On The Way';
      case 'arrived':
        return 'Arrived';
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

  if (isLoadingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">
            Track Order
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
          <Text className="text-gray-600 mt-4 font-NunitoMedium">
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">
            Track Order
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 px-5 py-8">
          <AnimatedErrorCard
            emoji="🔧"
            title="Failed to load order"
            message={getErrorMessage(errorData)}
            gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
            textColor="text-red-800"
            actionButton={{
              text: "Try Again",
              onPress: () => {
                refetch();
              },
              backgroundColor: "#DC2626"
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const canEdit = ['pending', 'accepted'].includes(currentStatus);
  const canCancel = !['completed', 'cancelled', 'declined'].includes(currentStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <BackArrowBtn onPress={() => router.push(routes.myMechanicOrders)} />
        <Text className="text-xl font-NunitoBold text-gray-900">
          Track Order
        </Text>
        {/* <View className="w-10" /> */}
        {/* Status Badge */}
        <View className={`self-center px-4 py-2 rounded-full ${getStatusColor(currentStatus)}`}>
            <Text className={`text-base font-NunitoBold`}>
              {getStatusLabel(currentStatus)}
            </Text>
          </View>
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
        showsVerticalScrollIndicator={false}
      >
        

        {/* Status Timeline */}
        <View className="px-5 py-4 bg-white mx-5 rounded-2xl my-4 border border-gray-200">
          <Text className="text-xl font-NunitoBold text-gray-900 mb-4">
            Order Status
          </Text>
          
          {statusSteps.map((step, index) => (
            <View key={step.id} className="flex-row mb-4 last:mb-0">
              {/* Timeline Line */}
              <View className="items-center mr-4">
                {step.completed ? (
                  <CheckCircleIconSolid size={24} color="#10B981" />
                ) : step.active ? (
                  <View className="w-6 h-6 rounded-full border-2 border-primary-500 bg-primary-50 items-center justify-center">
                    <View className="w-2 h-2 rounded-full bg-primary-500" />
                  </View>
                ) : (
                  <View className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
                )}
                {index < statusSteps.length - 1 && (
                  <View
                    className={`w-0.5 flex-1 mt-2 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ minHeight: 40 }}
                  />
                )}
              </View>

              {/* Status Info */}
              <View className="flex-1 pb-4">
                <Text
                  className={`text-lg font-NunitoBold mb-1 ${
                    step.active ? 'text-primary-600' : step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </Text>
                <Text className="text-base font-NunitoMedium text-gray-600 mb-1">
                  {step.description}
                </Text>
                {step.timestamp && (step.completed || step.active) && (
                  <Text className="text-xs font-NunitoMedium text-gray-500">
                    {new Date(step.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Order Details */}
        <View className="px-5 py-4 bg-white mx-5 rounded-2xl mb-4 border border-gray-200">
          <Text className="text-xl font-NunitoBold text-gray-900 mb-4">
            Order Details
          </Text>

          {/* Mechanic Info Section */}
          <View className="mb-4 pb-4 border-b border-gray-200">
            <Text className="text-base font-NunitoBold text-primary-600 mb-3">
              Mechanic Information
            </Text>
            <View className="flex-row items-center">
              <UserIcon size={20} color="#6B7280" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-NunitoMedium text-gray-500 mb-1">
                  Mechanic Name
                </Text>
                <Text className="text-base font-NunitoBold text-gray-900">
                  {order.mechanic_name || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Car Info Section */}
          <View className="mb-4 pb-4 border-b border-gray-200">
            <Text className="text-base font-NunitoBold text-primary-600 mb-3">
              Vehicle Information
            </Text>
            <View className="space-y-2.5">
              <View className="flex-row items-center">
                <TruckIcon size={20} color="#6B7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-NunitoMedium text-gray-500 mb-1">
                    Vehicle
                  </Text>
                  <Text className="text-base font-NunitoBold text-gray-900">
                    {order.vehicle_make} {order.vehicle_model} {order.vehicle_year > 0 && `(${order.vehicle_year})`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Service Details Section */}
          <View>
            <Text className="text-base font-NunitoBold text-primary-600 mb-4">
              Service Details
            </Text>
            <View className=" space-y-4">
              {/* Service Type */}
              <View className="flex-row items-center">
                <WrenchScrewdriverIcon size={20} color="#6B7280" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-NunitoMedium text-gray-500 mb-1">
                    Service Type
                  </Text>
                  <Text className="text-base font-NunitoBold text-gray-900">
                    {order.service_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Problem Description */}
              {order.problem_description && (
                <View className="flex-row items-start my-4">
                  <DocumentTextIcon size={20} color="#6B7280" style={{ marginTop: 2 }} />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-NunitoMedium text-gray-500 mb-1.5">
                      Problem Description
                    </Text>
                    <Text className="text-base font-NunitoMedium text-gray-900 leading-5">
                      {order.problem_description}
                    </Text>
                  </View>
                </View>
              )}

              {/* Schedule Section */}
              <View className="pt-3 border-t border-gray-100">
                <Text className="text-sm font-NunitoBold text-primary-600 mb-3 uppercase">
                  Schedule
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <CalendarIcon size={20} color="#6B7280" />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-NunitoMedium text-gray-500 mb-1">
                        Date & Time
                      </Text>
                      <Text className="text-base font-NunitoBold text-gray-900">
                        {new Date(order.preferred_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                      {order.preferred_time_slot && (
                        <Text className="text-sm font-NunitoMedium text-gray-600 mt-1">
                          {order.preferred_time_slot.charAt(0).toUpperCase() + order.preferred_time_slot.slice(1)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-start my-4">
                    <MapPinIcon size={20} color="#6B7280" style={{ marginTop: 2 }} />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-NunitoMedium text-gray-500 mb-1">
                        Service Address
                      </Text>
                      <Text className="text-base font-NunitoMedium text-gray-900 leading-5">
                        {order.service_address || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Additional Notes */}
              {order.notes && (
                <View className="pt-3 border-t border-gray-100">
                  <View className="flex-row items-start">
                    <ClipboardDocumentListIcon size={20} color="#6B7280" style={{ marginTop: 2 }} />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-NunitoMedium text-gray-500 mb-1.5">
                        Additional Notes
                      </Text>
                      <Text className="text-base font-NunitoMedium text-gray-900 leading-5">
                        {order.notes}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-5 pb-6">
          <View className="flex-row gap-2 space-x-3 mb-3">
            {canEdit && (
              <View className="flex-1">
                <CustomButton
                  title="Edit Request"
                  onPress={handleEdit}
                  bgVariant="outline"
                  textVariant='outline'
                  className="py-3"
                />
              </View>
            )}
            {canCancel && (
              <View className="flex-1">
                <CustomButton
                  title="Cancel Request"
                  onPress={handleCancel}
                  bgVariant="danger"
                  className="py-3"
                  disabled={isLoading}
                  loading={isLoading}
                />
              </View>
            )}
          </View>
          
          {/* Review Button - Only show for completed orders */}
          {currentStatus === 'completed' && order.mechanic_id && (
            <CustomButton
              title="Give Review"
              onPress={() => setShowReviewModal(true)}
              bgVariant="primary"
              className="py-3"
            />
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <MechanicReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        mechanicId={order.mechanic_id || ''}
        mechanicName={order.mechanic_name}
        onSubmit={handleReviewSubmit}
        isLoading={createReviewMutation.isPending}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type || 'info'}
        onClose={hideAlert}
        autoDismiss={alertConfig?.autoDismiss}
        autoDismissDelay={alertConfig?.autoDismissDelay}
      />

      {/* Edit Confirmation Modal */}
      <Modal
        visible={showEditConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditConfirmModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowEditConfirmModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-white rounded-t-3xl">
              <View className="p-5 pb-[3rem]">
                <Text className="text-xl font-NunitoBold text-gray-900 mb-2 text-center">
                  Edit Request
                </Text>
                <Text className="text-base font-NunitoMedium text-gray-600 mb-6 text-center">
                  Are you sure you want to edit this request?
                </Text>
                
                <View className="flex-row gap-2 space-x-3">
                  <View className="flex-1">
                    <CustomButton
                      title="No"
                      onPress={() => setShowEditConfirmModal(false)}
                      bgVariant="outline"
                      textVariant="outline"
                      className="py-3"
                    />
                  </View>
                  <View className="flex-1">
                    <CustomButton
                      title="Yes, Edit"
                      onPress={handleConfirmEdit}
                      bgVariant="primary"
                      className="py-3"
                    />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Cancel Modal */}
      <CancelRequestModal
        visible={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedCancelReason('');
          setCancelReason('');
        }}
        onConfirm={handleCancelSubmit}
        cancelReason={cancelReason}
        selectedCancelReason={selectedCancelReason}
        onReasonChange={setCancelReason}
        onSelectedReasonChange={setSelectedCancelReason}
        isLoading={isLoading || cancelRequestMutation.isPending}
      />
    </SafeAreaView>
  );
};

export default TrackMechanicOrder;

