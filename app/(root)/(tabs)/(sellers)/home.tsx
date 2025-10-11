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
import CustomerInsightsChart from "@/components/charts/CustomerInsightsChart";
import ProductPerformanceChart from "@/components/charts/ProductPerformanceChart";
import { useMerchantAnalytics } from "@/hooks/useMerchantAnalytics";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useActiveRoleProfile } from "@/hooks/useUserProfile";

const SellerHome = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch merchant profile based on active role
  const { data: profileData, activeRole, isLoading: isProfileLoading, refetch: refetchProfile } = useActiveRoleProfile();
  
  // Fetch merchant analytics data
  const { data: analyticsData, isLoading, error, refetch: refetchAnalytics } = useMerchantAnalytics();

  // Debug: Log profile data
  React.useEffect(() => {
    if (profileData) {
      console.log('👤 Seller Home - Profile Data:', profileData);
      console.log('👤 Seller Home - Active Role:', activeRole);
      console.log('👤 Seller Home - Is Merchant Profile:', activeRole === 'merchant');
    }
    if (isProfileLoading) {
      console.log('⏳ Seller Home - Loading profile...');
    }
  }, [profileData, activeRole, isProfileLoading]);

  // Add error handling for missing user data
  React.useEffect(() => {
    if (error) {
      console.error('❌ Analytics Error:', error);
      // If it's a 401 or 403 error, the user might be deleted
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) {
        console.log('🔐 User authentication failed - redirecting to login');
        // You can add a logout function here or redirect to login
      }
    }
  }, [error]);

  // Transform analytics data to match OrderItem interface with new design fields
  const recentOrders = analyticsData?.best_selling_products?.map((product, index) => ({
    id: product.id || `product-${index}`,
    productName: product.name,
    orderDate: new Date().toISOString().split('T')[0],
    price: product.revenue,
    status: "Delivered",
    quantity: product.quantity_sold,
    image: null, // Will show placeholder if no image
    deliveryDate: new Date().toISOString().split('T')[0],
    paymentStatus: "Paid",
  })) || [];

  // Extract analytics data with fallbacks
  const totalSales = analyticsData?.total_sales || 0;
  const totalOrders = analyticsData?.order_count || 0;
  const totalProducts = analyticsData?.product_count || 0;

  // Debug: Log analytics data (not rendered)
  React.useEffect(() => {
    if (analyticsData) {
      console.log('📊 Merchant Analytics Data:', analyticsData);
    }
    if (error) {
      console.error('❌ Merchant Analytics Error:', error);
    }
    if (isLoading) {
      console.log('⏳ Loading merchant analytics...');
    }
  }, [analyticsData, error, isLoading]);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Pull-to-refresh triggered - refetching analytics and profile...');
      await Promise.all([
        refetchAnalytics(),
        refetchProfile()
      ]);
      console.log('✅ Analytics and profile refreshed successfully');
    } catch (error) {
      console.error('❌ Error during refresh:', error);
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
            tintColor="#0A6DEE"
            colors={['#0A6DEE']}
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >

        <Navbar />

        <View className=" py-4">
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

        <View className="">
          {/* Loading State */}
          {isLoading && (
            <View className="mb-6">
              <LoadingSpinner 
                message="Loading Analytics"
                subMessage="Fetching your business insights..."
                size="medium"
                logoSize={40}
              />
            </View>
          )}

          {/* Customer Insights Chart */}
          {!isLoading && analyticsData?.customer_insights && (
            <CustomerInsightsChart data={analyticsData.customer_insights} />
          )}

          {/* Product Performance Chart */}
          {!isLoading && analyticsData?.product_performance && (
            <ProductPerformanceChart data={analyticsData.product_performance} />
          )}

          {/* Rental Analytics Chart */}
          {!isLoading && analyticsData?.rental_analytics && (
            <RentalAnalyticsChart data={analyticsData.rental_analytics} />
          )}

          {/* Error State */}
          {!isLoading && error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-800 font-NunitoBold text-center">
                Unable to load analytics data
              </Text>
              <Text className="text-red-600 font-NunitoMedium text-center mt-1">
                Please check your connection or try logging in again
              </Text>
            </View>
          )}

          {/* Recent Orders */}
          <View className="">
            <View className="flex-row items-center justify-between my-4">
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

            {recentOrders?.slice(0, 3)?.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
              />
            ))}
          </View>
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
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SellerHome