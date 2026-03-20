"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import OrderCard, { Order } from "@/components/OrderCard";
import CustomerReviewCard from "@/components/CustomerReviewCard";
import { router } from "expo-router";
import { icons } from "@/constants";
import { usePrimaryUserProfile, useMechanicProfile } from "@/hooks/useUserProfile";
import { useProfileStore } from "@/hooks/useProfileStore";
import { mechanicRoutes } from "@/constants/routes";
import Navbar from "@/components/Navbar";
import MechanicActionConfirmationModal, { MechanicActionType } from "@/components/modals/MechanicActionConfirmationModal";
import { useRepairRequests, useAcceptRepairRequest, useDeclineRepairRequest, useMechanicAnalytics } from "@/hooks/useRepairRequests";
import { useQuery } from "@tanstack/react-query";
import { mechanicAPI } from "@/lib/api/mechanic";
import AnimatedErrorCard from "@/components/AnimatedErrorCard";
import { useVehicleMakes } from "@/hooks/useVehicleMakes";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import KYCBanner from "@/components/KYCBanner";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";

// Metric Card Skeleton Loader
const MetricCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View className="flex-1 bg-gray-200 rounded-[.4rem] p-4">
      {/* Label skeleton */}
      <Animated.View style={[shimmerStyle]} className="h-4 bg-gray-300 rounded mb-4 w-3/4" />
      {/* Number skeleton */}
      <Animated.View style={[shimmerStyle]} className="h-8 bg-gray-300 rounded w-16" />
    </View>
  );
};

// Order Card Skeleton Loader
const OrderCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View className="bg-white mb-4 p-4 rounded-[.4rem] border border-gray-200">
      {/* Header skeleton */}
      <View className="flex-row justify-between items-start mb-3">
        <Animated.View style={[shimmerStyle]} className="h-5 bg-gray-300 rounded w-2/3" />
        <Animated.View style={[shimmerStyle]} className="h-4 bg-gray-300 rounded w-16" />
      </View>

      {/* Car type skeleton */}
      <Animated.View style={[shimmerStyle]} className="h-4 bg-gray-300 rounded mb-2 w-1/2" />

      {/* Car issue skeleton */}
      <Animated.View style={[shimmerStyle]} className="h-4 bg-gray-300 rounded mb-4 w-3/4" />

      {/* Buttons skeleton */}
      <View className="flex-row space-x-3 gap-3">
        <Animated.View style={[shimmerStyle]} className="flex-1 h-12 bg-gray-300 rounded-[.4rem]" />
        <Animated.View style={[shimmerStyle]} className="flex-1 h-12 bg-gray-300 rounded-[.4rem]" />
      </View>
    </View>
  );
};

const MechanicHome = () => {
  const primaryProfile = usePrimaryUserProfile();
  const mechanicProfile = useMechanicProfile(true); // Always enabled on mechanic home

  const profileData = (mechanicProfile.data || primaryProfile.data) as any;
  const profileLoading = mechanicProfile.isLoading && !mechanicProfile.data; // Only show strictly loading if we have no data
  const isMechanic = true;

  const isProfileComplete = useProfileStore((state) => state.isProfileComplete);
  const setIsProfileComplete = useProfileStore((state) => state.setIsProfileComplete);
  const isNewSwitch = useProfileStore((state) => state.isNewSwitch);
  const setIsNewSwitch = useProfileStore((state) => state.setIsNewSwitch);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const hasShownModalRef = useRef(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // Check profile status on load
  useEffect(() => {
    if (profileData && !profileLoading) {
      const isComplete = profileData.data?.kyc?.is_complete ?? false;
      setIsProfileComplete(isComplete);
      
      const isApproved = profileData.data?.mechanic_profile?.is_approved ?? false;
      const isPending = isComplete && !isApproved;
      
      // ONLY show automatically if we just switched roles and it's not complete
      if (isNewSwitch && !isComplete && !hasShownModalRef.current) {
        // Start timer only if not already started
        if (!timerIdRef.current) {
          timerIdRef.current = setTimeout(() => {
            setShowProfileModal(true);
            hasShownModalRef.current = true;
            setIsNewSwitch(false); // Reset the switch flag
            timerIdRef.current = null;
          }, 3000); // Reduced to 3 seconds
        }
      } else if (!isNewSwitch) {
          // If not a new switch, make sure timer is cleared
          if (timerIdRef.current) {
              clearTimeout(timerIdRef.current);
              timerIdRef.current = null;
          }
      }
    }

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [profileData, profileLoading, setIsProfileComplete, isNewSwitch]);

  const isPendingApproval = Boolean(profileData?.data?.kyc?.is_complete && !profileData?.data?.mechanic_profile?.is_approved);

  // Fetch repair requests from API with status="pending" filter
  const {
    data: pendingRequestsData,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending
  } = useRepairRequests('pending', isMechanic);

  // Check if pending requests are empty (only check after loading is done)
  const hasPendingRequests = !pendingLoading && pendingRequestsData?.data && Array.isArray(pendingRequestsData.data) && pendingRequestsData.data.length > 0;

  // Fetch all repair requests if no pending requests available (conditionally enabled)
  const {
    data: allRequestsData,
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll
  } = useQuery({
    queryKey: ['mechanic', 'repair-requests', 'all-fallback'],
    queryFn: () => mechanicAPI.getRepairRequests(undefined),
    enabled: !pendingLoading && !hasPendingRequests, // Only fetch if pending is done and empty
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    networkMode: 'online',
  });

  // Determine which data to use
  const repairRequestsData = hasPendingRequests ? pendingRequestsData : allRequestsData;
  const requestsLoading = hasPendingRequests ? pendingLoading : (pendingLoading || allLoading);
  const requestsError = hasPendingRequests ? pendingError : allError;

  // Combined refetch function
  const refetchRequests = () => {
    refetchPending();
    if (!hasPendingRequests) {
      refetchAll();
    }
  };

  // Fetch mechanic analytics from API
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = useMechanicAnalytics(isMechanic);

  // Fetch vehicle makes to resolve make/model names
  const { data: vehicleMakes } = useVehicleMakes();

  // Mutations for accepting/declining requests
  const acceptRequestMutation = useAcceptRepairRequest();
  const declineRequestMutation = useDeclineRepairRequest();

  // State for confirmation modal
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<MechanicActionType | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  // Transform API data to match OrderCard interface
  const currentOrders: Order[] = (() => {
    try {
      if (!repairRequestsData?.data) {
        return [];
      }

      const ordersArray = Array.isArray(repairRequestsData.data) 
        ? repairRequestsData.data 
        : [];

      return ordersArray.map((request: any) => {
        // Get customer name
        const customerName = request.customer
          ? `${request.customer.first_name || ''} ${request.customer.last_name || ''}`.trim() || 'Unknown Customer'
          : 'Unknown Customer';

        // Get phone number
        const phoneNumber = request.customer?.phone_number || 'N/A';

        // Get vehicle make and model names
        const makeId = request.vehicle_make;
        const modelId = request.vehicle_model;
        const makeName = getMakeName(makeId);
        const modelName = getModelName(makeId, modelId);
        const carType = `${makeName} ${modelName}`.trim() || 'Unknown Vehicle';

        // Map API status to Order status
        const mapStatus = (status: string): Order['status'] => {
          switch (status) {
            case 'pending':
              return 'current';
            case 'accepted':
            case 'in_transit':
            case 'arrived':
            case 'in_progress':
              return 'ongoing';
            case 'completed':
              return 'completed';
            case 'declined':
            case 'cancelled':
              return 'declined';
            default:
              return 'current';
          }
        };

        return {
          id: request.id?.toString() || '',
          clientName: customerName,
          phoneNumber: phoneNumber,
          carType: carType,
          carIssue: request.problem_description || request.issue_description || 'Repair needed',
          status: mapStatus(request.status || 'pending'),
          apiStatus: request.status || 'pending', // Actual API status for display
        };
      });
    } catch (error) {
      console.error('Error transforming orders data:', error);
      return [];
    }
  })();

  const openActionConfirmation = (action: MechanicActionType, orderId: string) => {
    setActionType(action);
    setSelectedOrderId(orderId);
    setActionModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedOrderId || !actionType) return;

    try {
      if (actionType === 'accept') {
        await acceptRequestMutation.mutateAsync(selectedOrderId);
        console.log("Request accepted:", selectedOrderId);
      } else if (actionType === 'decline') {
        await declineRequestMutation.mutateAsync(selectedOrderId);
        console.log("Request declined:", selectedOrderId);
      }

      setActionModalVisible(false);
      setActionType(null);
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error processing action:", error);
    }
  };

  const handleCancelActionModal = () => {
    setActionModalVisible(false);
    setActionType(null);
    setSelectedOrderId(null);
  };

  const handleAccept = (orderId: string) => {
    if (!isProfileComplete || isPendingApproval) {
      setShowProfileModal(true);
      return;
    }
    openActionConfirmation('accept', orderId);
  };

  const handleDecline = (orderId: string) => {
    if (!isProfileComplete || isPendingApproval) {
      setShowProfileModal(true);
      return;
    }
    openActionConfirmation('decline', orderId);
  };

  const handleView = (orderId: string) => {
    if (!isProfileComplete || isPendingApproval) {
      setShowProfileModal(true);
      return;
    }
    router.push({
      pathname: mechanicRoutes.orderDetails,
      params: {
        orderId: orderId,
      },
    });
  };

  // Transform rating distribution from API to ratingData format
  const ratingData = (() => {
    const distribution = analyticsData?.data?.ratings?.rating_distribution || {};
    const totalReviews = analyticsData?.data?.ratings?.total_reviews || 0;
    
    return [
      { 
        stars: 5, 
        count: distribution['5'] || 0, 
        percentage: totalReviews > 0 ? ((distribution['5'] || 0) / totalReviews) * 100 : 0, 
        color: "bg-green-500" 
      },
      { 
        stars: 4, 
        count: distribution['4'] || 0, 
        percentage: totalReviews > 0 ? ((distribution['4'] || 0) / totalReviews) * 100 : 0, 
        color: "bg-blue-500" 
      },
      { 
        stars: 3, 
        count: distribution['3'] || 0, 
        percentage: totalReviews > 0 ? ((distribution['3'] || 0) / totalReviews) * 100 : 0, 
        color: "bg-purple-500" 
      },
      { 
        stars: 2, 
        count: distribution['2'] || 0, 
        percentage: totalReviews > 0 ? ((distribution['2'] || 0) / totalReviews) * 100 : 0, 
        color: "bg-orange-500" 
      },
      { 
        stars: 1, 
        count: distribution['1'] || 0, 
        percentage: totalReviews > 0 ? ((distribution['1'] || 0) / totalReviews) * 100 : 0, 
        color: "bg-red-500" 
      },
    ];
  })();

  // Get average rating from API, default to 0
  const averageRating = analyticsData?.data?.ratings?.avg_rating ?? 0;

  // Get total reviews count from API
  const totalReviews = String(analyticsData?.data?.ratings?.total_reviews || 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={requestsLoading || analyticsLoading}
            onRefresh={() => {
              refetchRequests();
              refetchAnalytics();
            }}
            colors={['#D30309']}
            tintColor="#D30309"
          />
        }
      >
        <AnimatedPageContainer animationType="fadeInDown" duration={500}>
          <Navbar />

          <View className="py-4">
          <KYCBanner isVisible={!isProfileComplete || isPendingApproval} role="mechanic" isPending={isPendingApproval} />

          {/* Let's fix some cars card */}
          {/* <View className="rounded-2xl mb-6 overflow-hidden">
            <ImageBackground
              source={images?.adsbackground}
              className="w-full h-[150px] bg-cover bg-center"
              resizeMode="cover"
            >
              <View className="bg-black/40 flex-1 justify-center items-start p-6">
                <View className="items-start">
                  <Text className="text-white text-[1.4rem] font-NunitoBold mb-2 text-start">
                    Let's fix some cars
                  </Text>
                  <Text className="text-gray-300 text-md font-NunitoMedium text-start">
                    Connecting with car owners
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View> */}

          {/* Key Metrics Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-NunitoBold text-gray-900">
              Key Metrics
            </Text>
            {!analyticsLoading && analyticsData?.data?.time_window && (
              <Text className="text-xs text-gray-500 font-NunitoMedium">
                Last 7 days: {analyticsData.data.time_window.last_7_days_requests || 0}
              </Text>
            )}
          </View>

          {/* Metrics */}
          <View className="flex-row gap-4 space-x-4 mb-4">
            {analyticsLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <View className="flex-1 gradient-to-t from-[#C9E6E5] to-[#B1E5FB] bg-[#B1E5FB] rounded-[.4rem] p-4">
                  <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                    Total Requests
                  </Text>
                  <Text className="text-2xl font-NunitoBold text-gray-900">
                    {analyticsData?.data?.summary?.total_repair_requests || 0}
                  </Text>
                </View>
                <View className="flex-1 gradient-to-r from-[#D7CFF1] to-[#D3C8E4] bg-[#D3C8E4] rounded-[.4rem] p-4">
                  <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                    Completed
                  </Text>
                  <Text className="text-2xl font-NunitoBold text-gray-900 text-end">
                    {analyticsData?.data?.summary?.completed_repair_requests || 0}
                  </Text>
                </View>
                <View className="flex-1 gradient-to-r from-[#FED7D7] to-[#FEB2B2] bg-[#FEB2B2] rounded-[.4rem] p-4">
                  <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                    In Progress
                  </Text>
                  <Text className="text-2xl font-NunitoBold text-gray-900">
                    {analyticsData?.data?.summary?.in_progress_repair_requests || 0}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Additional Metrics Row */}
          {!analyticsLoading && (
            <View className="flex-row gap-4 space-x-4 mb-4">
              <View className="flex-1 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] bg-[#FDE68A] rounded-[.4rem] p-4">
                <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                  Completion Rate
                </Text>
                <Text className="text-2xl font-NunitoBold text-gray-900">
                  {analyticsData?.data?.summary?.completion_rate 
                    ? `${(analyticsData.data.summary.completion_rate * 100).toFixed(1)}%`
                    : '0%'}
                </Text>
              </View>
              <View className="flex-1 bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] bg-[#A7F3D0] rounded-[.4rem] p-4">
                <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                  Total Customers
                </Text>
                <Text className="text-2xl font-NunitoBold text-gray-900">
                  {analyticsData?.data?.summary?.distinct_customers || 0}
                </Text>
              </View>
            </View>
          )}

          {/* Customer Reviews */}
          <CustomerReviewCard
            totalReviews={totalReviews}
            averageRating={averageRating}
            ratingData={ratingData}
          />

          {/* Repair Requests Section */}
          <View>
            <View className="flex-row items-center justify-between my-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Recent Repair Requests
              </Text>
              <TouchableOpacity onPress={() => router?.push("./order")}>
                <Text className="text-red-600 font-NunitoBold">View All</Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {requestsLoading && (
              <View className="">
                {[1, 2, 3].map((index) => (
                  <OrderCardSkeleton key={`skeleton-${index}`} />
                ))}
              </View>
            )}

            {/* Error State */}
            {requestsError && !requestsLoading && (
              <AnimatedErrorCard
                emoji="🔧"
                title="No repair requests available"
                message="No repair requests found at the moment. Pull down to refresh or check back later!"
                gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
                textColor="text-red-800"
                actionButton={{
                  text: "Refresh",
                  onPress: () => refetchRequests(),
                  backgroundColor: "#DC2626"
                }}
              />
            )}

            {/* Success State - Show Orders */}
            {!requestsLoading && !requestsError && currentOrders.length > 0 && (
              <View className="">
                {currentOrders.slice(0, 3).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    type="current"
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onView={handleView}
                  />
                ))}
              </View>
            )}

            {/* Empty State */}
            {!requestsLoading && !requestsError && currentOrders.length === 0 && (
              <AnimatedErrorCard
                emoji="🚗"
                title="No repair requests yet"
                message="You'll see repair requests from customers here. Pull down to refresh!"
                gradientColors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
                textColor="text-blue-800"
              />
            )}
          </View>

          {/* <View className="h-10" /> */}
          </View>
        </AnimatedPageContainer>
      </ScrollView>

      {/* Action Confirmation Modal */}
      <MechanicActionConfirmationModal
        visible={actionModalVisible}
        actionType={actionType}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelActionModal}
        isLoading={acceptRequestMutation.isPending || declineRequestMutation.isPending}
      />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isVisible={showProfileModal}
        roleName="mechanic"
        onComplete={() => setShowProfileModal(false)}
        onClose={() => setShowProfileModal(false)}
        isPending={isPendingApproval}
      />
    </SafeAreaView>
  );
};

export default MechanicHome;