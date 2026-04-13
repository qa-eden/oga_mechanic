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
import OrderItemCard from "@/components/cards/OrderItemCard";
import RentalAnalyticsChart from "@/components/charts/RentalAnalyticsChart";
import AndroidNavBarSpacer from "@/components/AndroidNavBarSpacer";
import CustomerInsightsChart from "@/components/charts/CustomerInsightsChart";
import ProductPerformanceChart from "@/components/charts/ProductPerformanceChart";
import { useMerchantAnalytics } from "@/hooks/useMerchantAnalytics";
import LoadingSpinner from "@/components/LoadingSpinner";
import LoadingErrorWrapper from "@/components/LoadingErrorWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePrimaryUserProfile, useMerchantProfile } from "@/hooks/useUserProfile";
import { useMerchantOrders } from "@/hooks/useOrders";
import { useProfileStore } from "@/hooks/useProfileStore";
import ProfileCompletionModal from "@/components/modals/ProfileCompletionModal";
import KYCBanner from "@/components/KYCBanner";
import BiddingCarousel from "@/components/bidding/BiddingCarousel";

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

  // Fetch merchant orders for recent orders section
  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useMerchantOrders(merchantId?.toString() || '');


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

  // Transform real orders data to match OrderItem interface
  const transformOrderItem = (order: any, item: any) => ({
    id: `${order.id}-${item.id}`,
    productName: item.product?.name || 'Unknown Product',
    orderDate: new Date(order.created_at).toLocaleDateString('en-GB'),
    price: parseFloat(item.price || 0),
    totalAmount: parseFloat(order.total_amount || 0),
    status: order.status,
    quantity: item.quantity || 1,
    image: item.product?.images?.[0]?.image || null,
    deliveryDate: 'TBD',
    paymentStatus: ['paid', 'shipped', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? 'Paid' :
                   order.status === 'cancelled' ? 'Cancelled' :
                   order.status === 'refunded' ? 'Refunded' : 'Pending',
    orderId: order.id,
    itemId: item.id,
    category: item.product?.category?.name || 'Unknown',
    merchant_email: item.product?.merchant_email || '',
  });

  // Process real orders data - flatten items from all orders
  const orders = ordersResponse?.data || [];
  const allOrderItems: any[] = [];

  orders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      allOrderItems.push(transformOrderItem(order, item));
    });
  });

  // Get recent orders (latest 3) sorted by creation date
  const recentOrders = allOrderItems
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3);

  // Extract analytics data with fallbacks
  const totalSales = analyticsData?.total_sales || 0;
  const totalOrders = analyticsData?.order_count || 0;
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

          {/* Total Sales Section */}
          <View className=" mb-2 mt-2">
            <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
              Total Sales
            </Text>
            <View className="flex-row items-end justify-between">
              <Text className="text-[1.8rem] font-NunitoBold text-gray-900">
                ₦{analyticsData?.total_sales?.toLocaleString() || '0.00'}
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-300  bg-gray-100 px-3 py-2 rounded-[.4rem]"
                onPress={() => setShowDrawer(true)}
              >
                <CalendarIcon size={16} color="#0A6DEE" />
                <Text className="text-sm text-[#0A6DEE] font-NunitoMedium ml-2">
                  Last 7 days
                </Text>
                <ChevronDownIcon size={16} color="#0A6DEE" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Key Metrics Cards - Full Width */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-[#B1E5FB] rounded-xl p-4">
            <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
              Orders
            </Text>
            <Text className="text-2xl font-NunitoBold text-gray-800">
              {analyticsData?.order_count || 0}
            </Text>
          </View>
          <View className="flex-1 bg-[#D3C8E4] rounded-xl p-4">
            <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
              Products sold
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

        {/* Recent Orders with Error Handling */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-NunitoBold text-gray-900">
              Recent Orders
            </Text>
            <TouchableOpacity className="flex-row items-center gap-1"
              onPress={() => router.push("/(root)/(tabs)/(sellers)/?tab=orders" as any)}
            >
              <Text className="text-primary-500 font-NunitoMedium flex-row text-lg items-center">See All</Text>
              <ChevronRightIcon size={20} color="#D30309" />
            </TouchableOpacity>
          </View>

          <ErrorBoundary
            error={ordersError}
            onRetry={refetchOrders}
            compact={true}
          >
            {recentOrders?.length > 0 ? (
              recentOrders.slice(0, 3).map((order) => (
                <OrderItemCard
                  key={order.id}
                  order={order}
                />
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 font-NunitoMedium text-center">
                  No recent orders found.
                </Text>
              </View>
            )}
          </ErrorBoundary>
        </View>
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