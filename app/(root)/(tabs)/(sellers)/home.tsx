"use client";

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CalendarIcon, ChevronDownIcon, ChevronRightIcon } from "react-native-heroicons/outline";
// import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { router } from "expo-router";
import Navbar from "@/components/Navbar";
import RentalAnalyticsChart from "@/components/charts/RentalAnalyticsChart";
import AndroidNavBarSpacer from "@/components/AndroidNavBarSpacer";
import CustomerInsightsChart from "@/components/charts/CustomerInsightsChart";
import ProductPerformanceChart from "@/components/charts/ProductPerformanceChart";
import { useMerchantAnalytics } from "@/hooks/useMerchantAnalytics";
import LoadingSpinner from "@/components/LoadingSpinner";
import LoadingErrorWrapper from "@/components/LoadingErrorWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePrimaryUserProfile, useMerchantProfile } from "@/hooks/useUserProfile";
import { useProfileStore } from "@/hooks/useProfileStore";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import KYCBanner from "@/components/KYCBanner";
import BiddingCarousel from "@/components/bidding/BiddingCarousel";
import SpecialistIconBtn from "@/components/SpecialistIconBtn";

const SellerHome = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const setIsProfileComplete = useProfileStore((state) => state.setIsProfileComplete);
  const isNewSwitch = useProfileStore((state) => state.isNewSwitch);
  const setIsNewSwitch = useProfileStore((state) => state.setIsNewSwitch);
  const isProfileComplete = useProfileStore((state) => state.isProfileComplete);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch primary profile data
  const { data: primaryProfileData, isLoading: isProfileLoading, refetch: refetchProfile } = usePrimaryUserProfile();

  // Extract active role with fallback
  const activeRole = primaryProfileData?.active_role || primaryProfileData?.data?.active_role || 'merchant';

  // Fetch specific merchant profile to check KYC status - ensure enabled on mount
  const merchantProfileQuery = useMerchantProfile(activeRole === 'merchant' || activeRole === 'seller');

  // Extract merchant ID safely from different profile structures
  const profileData = primaryProfileData;
  const merchantId = activeRole === 'merchant'
    ? (profileData?.data as any)?.user?.id || (profileData?.data as any)?.user_id
    : (profileData?.data as any)?.user_id;

  // Fetch merchant analytics data
  const { data: analyticsData, isLoading, error, refetch: refetchAnalytics } = useMerchantAnalytics();



  const hasShownModalRef = React.useRef(false);
  const timerIdRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check profile status using the specific merchant profile endpoint
  React.useEffect(() => {
    if (merchantProfileQuery.data && !merchantProfileQuery.isLoading) {
      const isComplete = merchantProfileQuery.data?.data?.kyc?.is_complete ?? false;
      const isApproved = merchantProfileQuery.data?.data?.merchant_profile?.is_approved ?? false;
      
      setIsProfileComplete(isComplete);
      
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
  }, [merchantProfileQuery.data, merchantProfileQuery.isLoading, setIsProfileComplete, isNewSwitch]);

  const isPendingApproval = Boolean(
    merchantProfileQuery.data?.data?.kyc?.is_complete && 
    !merchantProfileQuery.data?.data?.merchant_profile?.is_approved
  );

  // Debug: Log profile data
  React.useEffect(() => {
    if (profileData) {
      // Profile data loaded
    }
    if (isProfileLoading) {
      // Loading profile
    }
  }, [profileData, activeRole, isProfileLoading]);

  // Add error handling for missing user data
  React.useEffect(() => {
    if (error) {
      // If it's a 401 or 403 error, the user might be deleted
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) {
        // You can add a logout function here or redirect to login
      }
    }
  }, [error]);


  // Extract analytics data with fallbacks
  const totalProducts = analyticsData?.product_count || 0;

  // Debug: Log analytics data (not rendered)
  React.useEffect(() => {
    if (analyticsData) {
      // Analytics data loaded
    }
    if (error) {
    }
    if (isLoading) {
      // Loading analytics
    }
  }, [analyticsData, error, isLoading]);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchProfile()
      ]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [refetchAnalytics, refetchProfile]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Floating Chat Specialist */}
      <View style={{ position: 'absolute', bottom: 100, right: 20, zIndex: 1000 }}>
        <SpecialistIconBtn isFloating={true} />
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D30309"
            colors={['#D30309']}
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >

        <Navbar />

        <View className=" py-4">
          <KYCBanner 
            isVisible={!isProfileComplete || isPendingApproval} 
            role="seller" 
            isPending={isPendingApproval}
          />

          {/* Add Bidding Carousel */}
          <BiddingCarousel containerPadding={20} />

        </View>

        {/* Key Metrics Cards - Full Width */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-[#D3C8E4] rounded-xl p-4">
            <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
              Total Products
            </Text>
            <Text className="text-2xl font-NunitoBold text-gray-800">
              {analyticsData?.product_count || 0}
            </Text>
          </View>
        </View>

        {/* Analytics Charts with Error Handling */}
        <LoadingErrorWrapper
          isLoading={isLoading}
          error={error}
          onRetry={refetchAnalytics}
          loadingMessage="Loading Analytics"
          loadingSubMessage="Fetching your business insights..."
          className="mb-6"
        >
          <View className="space-y-4">
            {/* Customer Insights Chart */}
            {analyticsData?.customer_insights && (
              <CustomerInsightsChart data={analyticsData.customer_insights} />
            )}

            {/* Product Performance Chart */}
            {analyticsData?.product_performance && (
              <ProductPerformanceChart data={analyticsData.product_performance} />
            )}

            {/* Rental Analytics Chart */}
            {analyticsData?.rental_analytics && (
              <RentalAnalyticsChart data={analyticsData.rental_analytics} />
            )}
          </View>
        </LoadingErrorWrapper>

      </ScrollView>

      {/* Bottom Drawer Modal */}
      <Modal
        visible={showDrawer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowDrawer(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
              Select Time Period
            </Text>

            {['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year', 'All time'].map((period, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 border-b border-gray-100 last:border-b-0"
                onPress={() => {
                  setShowDrawer(false);
                  // Handle period selection here
                }}
              >
                <Text className="text-base font-NunitoMedium text-gray-900">
                  {period}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Android Navigation Bar Spacer */}
            <AndroidNavBarSpacer />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isVisible={showProfileModal}
        roleName="seller"
        onComplete={() => setShowProfileModal(false)}
        onClose={() => setShowProfileModal(false)}
        isPending={isPendingApproval}
      />
    </SafeAreaView>
  );
};

export default SellerHome