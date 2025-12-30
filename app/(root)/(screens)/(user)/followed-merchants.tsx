import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ChevronLeftIcon, UserIcon } from 'react-native-heroicons/outline';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useFollowedMerchants, useUnfollowMerchant } from '@/hooks/useUserProfile';
import { showToast } from '@/utils/toastUtils';
import { routes } from '@/constants/routes';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FollowedMerchants = () => {
  const { data: followedMerchantsData, isLoading, refetch } = useFollowedMerchants();
  const unfollowMutation = useUnfollowMerchant();

  const followedMerchants = followedMerchantsData?.data || [];

  const handleUnfollow = async (merchantId: string) => {
    try {
      await unfollowMutation.mutateAsync(merchantId);
      showToast.success('Unfollowed seller');
      refetch(); // Refresh list
    } catch (error) {
      showToast.error('Failed to unfollow seller');
    }
  };

  const renderMerchantItem = ({ item }: { item: any }) => {
    // API Response Structure:
    // item.merchant -> User object (first_name, last_name, id (uuid), etc)
    // item.merchant_profile -> Profile object (profile_picture, business_address, etc)
    
    const merchantUser = item.merchant || item.merchant_profile?.user || {};
    const merchantProfile = item.merchant_profile || {};
    
    const displayName = merchantUser.business_name || `${merchantUser.first_name || ''} ${merchantUser.last_name || ''}`.trim() || 'Unknown Merchant';
    const profileImage = merchantProfile.profile_picture || merchantUser.profile_image || merchantUser.profile_picture;
    const merchantUuid = merchantUser.id;

    return (
      <Animated.View entering={FadeInDown.duration(400)} className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity 
          className="flex-row items-center flex-1"
          onPress={() => {
            if (merchantUuid) {
               router.push({
                pathname: routes.merchantProfile,
                params: { merchantId: merchantUuid }
              });
            }
          }}
        >
          <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center overflow-hidden mr-3">
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            ) : (
              <UserIcon size={24} color="#9CA3AF" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-NunitoBold text-base">{displayName}</Text>
            <View className="flex-row items-center">
                <Text className="text-gray-500 text-xs font-NunitoMedium">View Profile</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => merchantUuid && handleUnfollow(merchantUuid)}
          className="bg-gray-100 px-3 py-1.5 rounded-lg ml-2"
        >
          <Text className="text-gray-600 font-NunitoBold text-xs">Unfollow</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900 ml-2">Followed Sellers</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message="Loading followed sellers..." />
      ) : (
        <FlatList
          data={followedMerchants}
          renderItem={renderMerchantItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#D30309" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <UserIcon size={48} color="#D1D5DB" />
              <Text className="text-gray-500 font-NunitoBold text-lg mt-4">No followed sellers</Text>
              <Text className="text-gray-400 font-NunitoMedium text-center mt-2 px-10">
                You haven't followed any sellers yet. Visit merchant profiles to follow them.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FollowedMerchants;
