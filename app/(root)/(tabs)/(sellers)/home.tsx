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
  ActivityIndicator,
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
import { usePrimaryUserProfile, useMerchantProfile, useVehicleRentalProfile } from "@/hooks/useUserProfile";
import { useProfileStore } from "@/hooks/useProfileStore";
import { useMerchantOrders } from "@/hooks/useOrders";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import KYCBanner from "@/components/KYCBanner";
import BiddingCarousel from "@/components/bidding/BiddingCarousel";
import SpecialistIconBtn from "@/components/SpecialistIconBtn";
import { sellerRoutes } from "@/constants/routes";

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
  const activeRoleRaw = primaryProfileData?.active_role || primaryProfileData?.data?.active_role || (primaryProfileData?.data as any)?.current_role;
  const activeRole = typeof activeRoleRaw === 'object' ? activeRoleRaw?.name : activeRoleRaw;
  const isVehicleRental = activeRole === 'vehicle_rental';
  const isSeller = activeRole === 'merchant' || activeRole === 'seller';

  // Fetch specific profile to check KYC status
  const merchantProfileQuery = useMerchantProfile(isSeller);
  const vehicleRentalProfileQuery = useVehicleRentalProfile(isVehicleRental);
  
  const activeProfileQuery = isVehicleRental ? vehicleRentalProfileQuery : merchantProfileQuery;

  // Extract merchant ID safely from different profile structures
  const profileData = primaryProfileData;
  const merchantId = (activeRole === 'merchant' || activeRole === 'vehicle_rental')
    ? (profileData?.data as any)?.user?.id || (profileData?.data as any)?.user_id
    : (profileData?.data as any)?.user_id;

  // Fetch merchant analytics data
  const { data: analyticsData, isLoading, error, refetch: refetchAnalytics } = useMerchantAnalytics(isSeller || isVehicleRental);

  // Fetch recent orders
  const { data: ordersData, isLoading: isLoadingOrders } = useMerchantOrders(merchantId);
  const recentOrders = ordersData?.data?.slice(0, 3) || [];



  const hasShownModalRef = React.useRef(false);
  const timerIdRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check profile status using the specific profile endpoint
  React.useEffect(() => {
    if (activeProfileQuery.data && !activeProfileQuery.isLoading) {
      const isComplete = activeProfileQuery.data?.data?.kyc?.is_complete ?? false;
      const isApproved = (activeProfileQuery.data?.data as any)?.merchant_profile?.is_approved || (activeProfileQuery.data?.data as any)?.vehicle_rental_profile?.is_approved || false;
      
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
  }, [activeProfileQuery.data, activeProfileQuery.isLoading, setIsProfileComplete, isNewSwitch]);

  const isPendingApproval = Boolean(
    activeProfileQuery.data?.data?.kyc?.is_complete && 
    !((activeProfileQuery.data?.data as any)?.merchant_profile?.is_approved || (activeProfileQuery.data?.data as any)?.vehicle_rental_profile?.is_approved)
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
        refetchProfile(),
        activeProfileQuery.refetch()
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
            isVisible={!activeProfileQuery.isLoading && (!isProfileComplete || isPendingApproval)} 
            role={isVehicleRental ? "vehicle_rental" : "seller"} 
            isPending={isPendingApproval}
          />
          {/* Add Bidding Carousel - Enabled for all roles as requested */}
          <BiddingCarousel containerPadding={20} />

          {!isVehicleRental && (
            <>
              {/* Specialty Buttons */}
              {/* <SpecialistIconBtn /> */}
            </>
          )}

        </View>

        {/* Key Metrics Cards - Full Width */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-[#F0FDF4] rounded-2xl p-5 border border-[#DCFCE7]">
            <Text className="text-gray-600 text-xs font-NunitoBold uppercase tracking-wider mb-2">
              {isVehicleRental ? "Active Rentals" : "Total Products"}
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-NunitoExtraBold text-gray-900">
                {isVehicleRental 
                  ? (analyticsData?.rental_analytics?.active_rentals || 0) 
                  : (analyticsData?.product_count || 0)}
              </Text>
              {isVehicleRental && (
                <Text className="text-xs font-NunitoSemiBold text-green-600 ml-2">Currently Rented</Text>
              )}
            </View>
          </View>

          {isVehicleRental && (
            <View className="flex-1 bg-[#EFF6FF] rounded-2xl p-5 border border-[#DBEAFE]">
              <Text className="text-gray-600 text-xs font-NunitoBold uppercase tracking-wider mb-2">
                Pending Requests
              </Text>
              <View className="flex-row items-baseline">
                <Text className="text-3xl font-NunitoExtraBold text-gray-900">
                  {analyticsData?.rental_analytics?.pending_rentals || 0}
                </Text>
                <Text className="text-xs font-NunitoSemiBold text-blue-600 ml-2">Awaiting Action</Text>
              </View>
            </View>
          )}
        </View>

        {isVehicleRental && (
           <View className="flex-row gap-4 mb-6">
             <View className="flex-1 bg-[#FFFBEB] rounded-2xl p-5 border border-[#FEF3C7]">
               <Text className="text-gray-600 text-xs font-NunitoBold uppercase tracking-wider mb-2">
                 Total Fleet
               </Text>
               <Text className="text-3xl font-NunitoExtraBold text-gray-900">
                 {analyticsData?.rental_analytics?.total_rentals || 0}
               </Text>
             </View>
             <View className="flex-1 bg-[#FDF2F2] rounded-2xl p-5 border border-[#FEE2E2]">
               <Text className="text-gray-600 text-xs font-NunitoBold uppercase tracking-wider mb-2">
                 Completion Rate
               </Text>
               <Text className="text-3xl font-NunitoExtraBold text-gray-900">
                 {Math.round((analyticsData?.rental_analytics?.completion_rate || 0) * 100)}%
               </Text>
             </View>
           </View>
        )}

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
            {/* Customer Insights Chart */}
            {/* {analyticsData?.customer_insights && (
              <CustomerInsightsChart data={analyticsData.customer_insights} />
            )} */}

            {/* Product Performance Chart - Only for Sellers */}
            {isSeller && analyticsData?.product_performance && (
              <ProductPerformanceChart data={analyticsData.product_performance} />
            )}

            {/* Rental Analytics Chart - Only for Vehicle Rental */}
            {isVehicleRental && analyticsData?.rental_analytics && (
              <RentalAnalyticsChart data={analyticsData.rental_analytics} />
            )}

            {/* Recent Activity Section */}
            {/* <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-NunitoBold text-gray-900">
                  {isVehicleRental ? "Recent Rental Requests" : "Recent Orders"}
                </Text>
                <TouchableOpacity onPress={() => router.push(isVehicleRental ? sellerRoutes.allRentedCars as any : sellerRoutes.products as any)}>
                  <Text className="text-primary-500 font-NunitoBold text-sm">See All</Text>
                </TouchableOpacity>
              </View>

              {recentOrders.length > 0 ? (
                <View className="space-y-4">
                  {recentOrders.map((order: any, index: number) => (
                    <TouchableOpacity
                      key={order.id || index}
                      onPress={() => router.push({
                        pathname: isVehicleRental ? sellerRoutes.rentedCarDetail as any : sellerRoutes.orderDetail as any,
                        params: { id: order.id }
                      })}
                      className={`flex-row items-center p-3 rounded-xl ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white border border-gray-50'}`}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isVehicleRental ? 'bg-blue-100' : 'bg-red-100'}`}>
                        {isVehicleRental ? (
                          <TruckIcon size={20} color="#3B82F6" />
                        ) : (
                          <ShoppingBagIcon size={20} color="#EF4444" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-NunitoBold text-sm" numberOfLines={1}>
                          {isVehicleRental ? (order.car?.name || "Rental Request") : (order.product?.name || "Product Order")}
                        </Text>
                        <Text className="text-gray-500 font-NunitoMedium text-[10px]">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'} • {order.customer_name || 'Customer'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-900 font-NunitoBold text-sm">
                          ₦{(order.total_amount || order.price || 0).toLocaleString()}
                        </Text>
                        <View className={`mt-1 px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                          <Text className={`text-[8px] font-NunitoBold ${order.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                            {order.status?.toUpperCase() || 'PENDING'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="items-center py-6">
                  <Text className="text-gray-400 font-NunitoMedium text-center">
                    No recent {isVehicleRental ? "rentals" : "orders"} found.
                  </Text>
                </View>
              )}
            </View> */}
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
        roleName={isVehicleRental ? "vehicle_rental" : "seller"}
        onComplete={() => setShowProfileModal(false)}
        onClose={() => setShowProfileModal(false)}
        isPending={isPendingApproval}
      />
    </SafeAreaView>
  );
};

export default SellerHome