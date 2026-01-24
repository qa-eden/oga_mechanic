import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackArrowBtn from '@/components/BackArrowBtn';
import { router, useLocalSearchParams } from 'expo-router';
import { routes } from '@/constants/routes';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import { getErrorMessage } from '@/utils/errorMessages';
import { useUserRepairRequests } from '@/hooks/useRepairRequests';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import MechanicOrderCard, { MechanicOrder } from '@/components/cards/MechanicOrderCard';

type TabStatus = 'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

const MyMechanicOrders = () => {
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams<{ status?: string }>();
  
  // Get active tab from URL params, default to 'all'
  const activeTab: TabStatus = (params.status as TabStatus) || 'all';

  // Fetch user's repair requests from API with status filter
  const statusParam = activeTab === 'all' ? undefined : activeTab;
  const { 
    data: ordersData, 
    isLoading, 
    error, 
    refetch 
  } = useUserRepairRequests(statusParam);

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

  // Transform API data to local format
  const orders: MechanicOrder[] = (() => {
    try {
      if (!ordersData) {
        return [];
      }

      // The API response has the orders array in the 'data' property
      const ordersArray = (ordersData as any)?.data || (Array.isArray(ordersData) ? ordersData : []);

      if (!Array.isArray(ordersArray)) {
        return [];
      }

      return ordersArray.map((request: any) => {
        const mechanicName = request.mechanic
          ? `${request.mechanic.first_name || ''} ${request.mechanic.last_name || ''}`.trim() || 'Unknown Mechanic'
          : 'Unknown Mechanic';

        const makeId = request.vehicle_make;
        const modelId = request.vehicle_model;
        const makeName = getMakeName(makeId);
        const modelName = getModelName(makeId, modelId);

        return {
          id: request.id?.toString() || '',
          mechanicName: mechanicName,
          mechanicImage: request.mechanic?.selfie || request.mechanic_image || undefined,
          serviceType: request.service_type || '',
          vehicleMake: makeName,
          vehicleModel: modelName,
          vehicleYear: request.vehicle_year || 0,
          problemDescription: request.problem_description || request.description || '',
          serviceAddress: request.service_address || request.address || '',
          preferredDate: request.preferred_date || request.requested_at || '',
          preferredTimeSlot: request.preferred_time_slot || request.time_slot || '',
          status: (request.status || 'pending') as MechanicOrder['status'],
          createdAt: request.requested_at || request.created_at || request.createdAt || '',
          schedule: !!request.schedule,
          notes: request.notes || undefined,
        };
      });
    } catch (error) {
      console.error('Error transforming orders data:', error);
      return [];
    }
  })();

  // Orders are already filtered by the API based on status param
  const filteredOrders = orders;

  const handleTabChange = (tab: TabStatus) => {
    router.setParams({ status: tab });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <BackArrowBtn onPress={() => router.push(routes.services)} />
        <Text className="text-xl font-NunitoBold text-gray-900">
          My Mechanic Orders
        </Text>
        <View className="w-10" />
      </View>

      {/* Tabs */}
      <View className="bg-white px-5 py-3 border-b border-gray-100">
        {/* First Row: 3 tabs */}
        <View className="flex-row mb-2">
          {(['all', 'pending', 'accepted'] as TabStatus[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabChange(tab)}
              className={`flex-1 py-2 rounded-[.4rem] mx-0.5 ${
                activeTab === tab ? 'bg-primary-500' : 'bg-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-NunitoBold text-sm ${
                  activeTab === tab ? 'text-white' : 'text-gray-700'
                }`}
              >
                {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Second Row: 3 tabs */}
        <View className="flex-row">
          {(['in_progress', 'completed', 'cancelled'] as TabStatus[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabChange(tab)}
              className={`flex-1 py-2 rounded-[.4rem] mx-0.5 ${
                activeTab === tab ? 'bg-primary-500' : 'bg-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-NunitoBold text-sm ${
                  activeTab === tab ? 'text-white' : 'text-gray-700'
                }`}
              >
                {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
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
        {/* Loading State */}
        {isLoading && (
          <View className="flex-1 items-center justify-center py-20">
            <LoadingSpinner size="large" />
            <Text className="text-gray-600 mt-4 font-NunitoMedium">
              Loading orders...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View className="px-5 py-8">
            <AnimatedErrorCard
              emoji="🔧"
              title="Failed to load orders"
              message={getErrorMessage(error)}
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
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <View className="flex-1 justify-center items-center px-5 py-20">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">📋</Text>
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2 text-center">
              No orders found
            </Text>
            <Text className="text-gray-500 text-center font-NunitoMedium mb-6">
              {activeTab === 'all'
                ? "You haven't placed any mechanic orders yet"
                : `No ${activeTab} orders at the moment`}
            </Text>
            <TouchableOpacity
              onPress={() => router.push(routes.findMechanic)}
              className="bg-primary-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-NunitoBold">Find a Mechanic</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Orders List */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <View className="px-5 py-4">
            {filteredOrders.map((order) => (
              <MechanicOrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyMechanicOrders;