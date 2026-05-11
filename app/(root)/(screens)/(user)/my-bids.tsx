import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeftIcon, ArrowPathIcon, TagIcon, ClockIcon, TrashIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useMyBids, useDeleteBid } from '@/hooks/useProducts';
import { routes } from '@/constants/routes';
import AnimatedPageContainer from '@/components/AnimatedPageContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { Alert } from 'react-native';

const MyBids = () => {
  const { data: myBidsResponse, isLoading, refetch, isRefetching } = useMyBids();
  const deleteBidMutation = useDeleteBid();

  const handleDeleteBid = (bidId: string, productName: string) => {
    Alert.alert(
      "Retract Bid",
      `Are you sure you want to retract your bid for "${productName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Retract", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBidMutation.mutateAsync(bidId);
              showToast.success("Bid retracted successfully");
            } catch (error) {
              showToast.error("Failed to retract bid");
            }
          }
        }
      ]
    );
  };

  const bids = React.useMemo(() => {
    if (!myBidsResponse) return [];
    if (Array.isArray(myBidsResponse)) return myBidsResponse;
    if (Array.isArray(myBidsResponse.data)) return myBidsResponse.data;
    if (myBidsResponse.data?.results && Array.isArray(myBidsResponse.data.results)) {
      return myBidsResponse.data.results;
    }
    return [];
  }, [myBidsResponse]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
      case 'rejected':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
      default: // pending
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
    }
  };

  const formatBidDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const renderBidCard = (bid: any, index: number) => {
    const statusStyle = getStatusColor(bid.status);
    // Fallback if product name isn't directly in the bid object
    const productName = bid.product_name || bid.bidding_window_name || `Bid on Windows #${bid.bidding_window?.slice(0, 8)}`;
    const isDeleting = deleteBidMutation.isPending && deleteBidMutation.variables === bid.id;
    
    return (
      <Animated.View
        key={bid.id || index.toString()}
        entering={FadeInDown.delay(index * 100).duration(500)}
        layout={Layout.springify()}
        className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm"
      >
        <TouchableOpacity 
          activeOpacity={0.7}
          disabled={isDeleting}
          onPress={() => {
            // If we have a product ID, we can navigate to detail
            if (bid.product_id) {
              router.push(`${routes.biddingDetail}?id=${bid.product_id}` as any);
            }
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-[17px] font-NunitoExtraBold text-gray-900 leading-6 mb-1">
                {productName}
              </Text>
              <View className="flex-row items-center">
                <ClockIcon size={12} color="#9CA3AF" />
                <Text className="text-[11px] text-gray-500 font-NunitoMedium ml-1.5 uppercase tracking-wider">
                  Placed on {formatBidDate(bid.created_at)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className={`${statusStyle.bg} ${statusStyle.border} border px-3 py-1 rounded-full mr-2`}>
                <Text className={`${statusStyle.text} text-[10px] font-NunitoExtraBold uppercase tracking-widest`}>
                  {bid.status || 'PENDING'}
                </Text>
              </View>
              {bid.status?.toLowerCase() === 'pending' && (
                <TouchableOpacity 
                  onPress={() => handleDeleteBid(bid.id, productName)}
                  disabled={isDeleting}
                  className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <TrashIcon size={16} color="#EF4444" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
            <View>
              <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase tracking-[2px] mb-1">My Bid Amount</Text>
              <Text className="text-[20px] font-NunitoExtraBold text-primary-600">
                ₦{parseFloat(bid.amount || 0).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity 
                className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"
                disabled={isDeleting}
                onPress={() => {
                    if (bid.product_id) {
                        router.push(`${routes.biddingDetail}?id=${bid.product_id}` as any);
                    }
                }}
            >
              <Text className="text-[12px] font-NunitoBold text-gray-600">View Product</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="bg-gray-50 flex-1" edges={['top']}>
      <View className="px-5 py-4 flex-row items-center justify-between bg-white border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
        >
          <ChevronLeftIcon size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoExtraBold text-gray-900">My Bidding History</Text>
        <TouchableOpacity 
          onPress={() => refetch()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
        >
          <ArrowPathIcon size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#D30309" />
        }
      >
        <AnimatedPageContainer animationType="fadeInDown" duration={600}>
          {isLoading ? (
            <View className="py-20">
              <ActivityIndicator size="large" color="#D30309" />
              <Text className="text-center mt-4 text-gray-400 font-NunitoBold">Fetching your bids...</Text>
            </View>
          ) : bids.length === 0 ? (
            <View className="py-24 items-center justify-center">
              <View className="w-24 h-24 rounded-[40px] bg-white shadow-sm items-center justify-center mb-6">
                <TagIcon size={48} color="#D1D5DB" />
              </View>
              <Text className="text-xl font-NunitoExtraBold text-gray-900">No Bids Placed Yet</Text>
              <Text className="text-gray-400 font-NunitoMedium mt-3 text-sm text-center px-10 leading-6">
                You haven't participated in any auctions yet. Start bidding on items to see your history here!
              </Text>
            </View>
          ) : (
            <View>
              {bids.map((bid: any, index: number) => renderBidCard(bid, index))}
            </View>
          )}
        </AnimatedPageContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyBids;
