import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, withRepeat, withSequence, withTiming, useAnimatedStyle, useSharedValue, Layout } from 'react-native-reanimated';
import { 
  ClockIcon, 
  UserCircleIcon, 
  CalendarIcon, 
  TagIcon, 
  ShieldCheckIcon,
  InformationCircleIcon,
  UsersIcon,
  FireIcon,
  TrashIcon
} from 'react-native-heroicons/outline';

import { useProductBids, useDeleteBid } from '@/hooks/useProducts';
import { Alert } from 'react-native';
import { showToast } from '@/utils/toastUtils';

interface BidHistoryListProps {
  bids?: any[] | any;
}

const PulseCircle = () => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  return (
    <Animated.View 
      style={animatedStyle} 
      className="w-2 h-2 rounded-full bg-red-500 mr-1.5" 
    />
  );
};

const BidHistoryList: React.FC<BidHistoryListProps> = ({ bids: initialBids = [] }) => {
  const deleteBidMutation = useDeleteBid();
  const windowData = React.useMemo(() => {
    if (typeof initialBids === 'object' && !Array.isArray(initialBids)) {
      return initialBids;
    }
    return null;
  }, [initialBids]);

  const { data: bidsResponse, isLoading, error } = useProductBids(windowData?.id);

  const bids = React.useMemo(() => {
    if (!bidsResponse) return [];
    if (Array.isArray(bidsResponse)) return bidsResponse;
    if (Array.isArray(bidsResponse.data)) return bidsResponse.data;
    if (bidsResponse.data?.results && Array.isArray(bidsResponse.data.results)) {
      return bidsResponse.data.results;
    }
    if (bidsResponse.results && Array.isArray(bidsResponse.results)) {
      return bidsResponse.results;
    }
    return [];
  }, [bidsResponse]);

  const uniqueBiddersCount = React.useMemo(() => {
    const ids = new Set(bids.map((b: any) => b.bidder?.id || b.bidder_name));
    return ids.size;
  }, [bids]);

  const formatAuctionDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return formatAuctionDate(dateStr);
  };

  const renderAuctionDetails = () => {
    if (!windowData) return null;

    return (
      <Animated.View 
        entering={FadeInDown.duration(600)}
        className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm mb-8"
      >
        <View className="px-6 py-5 border-b border-gray-50 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-gray-50 items-center justify-center mr-3">
              <FireIcon size={20} color="#1F2937" />
            </View>
            <View>
              <Text className="text-[17px] font-NunitoExtraBold text-gray-900">Auction Dashboard</Text>
              <Text className="text-[11px] text-gray-400 font-NunitoBold uppercase tracking-widest mt-0.5">Real-time status</Text>
            </View>
          </View>
          
          <View className={`flex-row items-center px-3 py-1.5 rounded-full ${windowData.is_active ? 'bg-red-50' : 'bg-gray-100'}`}>
            {windowData.is_active && <PulseCircle />}
            <Text className={`text-[10px] font-NunitoExtraBold tracking-[1px] ${windowData.is_active ? 'text-red-600' : 'text-gray-500'}`}>
              {windowData.is_active ? 'LIVE AUCTION' : 'FINISHED'}
            </Text>
          </View>
        </View>
        
        <View className="p-6">
          <View className="flex-row mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <CalendarIcon size={12} color="#9CA3AF" />
                <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase tracking-[2px] ml-1.5 font-bold">Ends on</Text>
              </View>
              <Text className="text-[14px] text-gray-900 font-NunitoBold leading-5">{formatAuctionDate(windowData.end_time)}</Text>
            </View>
            
            <View className="flex-1 ml-4">
              <View className="flex-row items-center mb-1">
                <UsersIcon size={12} color="#9CA3AF" />
                <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase tracking-[2px] ml-1.5 font-bold">Bidders</Text>
              </View>
              <Text className="text-[14px] text-gray-900 font-NunitoBold leading-5">{uniqueBiddersCount} Total Participants</Text>
            </View>
          </View>
          
          <View className="flex-row pt-4 border-t border-gray-50">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <TagIcon size={12} color="#9CA3AF" />
                <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase tracking-[2px] ml-1.5 font-bold">Duration</Text>
              </View>
              <Text className="text-[14px] text-gray-900 font-NunitoBold leading-5">{windowData.duration_days} Days Total</Text>
            </View>
            
            <View className="flex-1 ml-4">
              <View className="flex-row items-center mb-1">
                <ShieldCheckIcon size={12} color="#9CA3AF" />
                <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase tracking-[2px] ml-1.5 font-bold">Security</Text>
              </View>
              <Text className="text-[14px] text-gray-900 font-NunitoBold leading-5">Verified Auction</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const sortedBids = React.useMemo(() => {
    return [...bids].sort((a: any, b: any) => {
      const amountA = parseFloat(a.amount || 0);
      const amountB = parseFloat(b.amount || 0);
      return amountB - amountA;
    });
  }, [bids]);

  return (
    <View className="mb-10">
      {renderAuctionDetails()}

      <View className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <View className="px-6 py-5 border-b border-gray-50 flex-row items-center justify-between">
          <View>
            <Text className="text-[17px] font-NunitoExtraBold text-gray-900">Bid History</Text>
            <Text className="text-[11px] text-gray-400 font-NunitoBold uppercase tracking-widest mt-0.5">{bids.length} Offers made</Text>
          </View>
          <View className="w-10 h-10 rounded-2xl bg-gray-50 items-center justify-center">
            <ClockIcon size={20} color="#9CA3AF" />
          </View>
        </View>
        
        <View className="p-3">
          {bids.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(400)} className="py-16 items-center justify-center">
              <View className="w-20 h-20 rounded-[30px] bg-gray-50 items-center justify-center mb-6">
                <ClockIcon size={40} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-NunitoExtraBold text-xl">No Bids Yet</Text>
              <Text className="text-gray-400 font-NunitoMedium mt-2 text-sm text-center px-12 leading-5">
                Join the auction early and be the first to secure this item!
              </Text>
            </Animated.View>
          ) : (
            sortedBids.slice(0, 10).map((bid: any, index: number) => {
              const isHighest = index === 0;
              
              return (
                <Animated.View 
                  key={bid.id || index.toString()} 
                  entering={FadeInDown.delay(index * 150).duration(500)}
                  layout={Layout.springify()}
                  className={`p-4 rounded-[24px] mb-3 border ${
                    isHighest 
                      ? 'bg-white border-primary-500/30 shadow-xl shadow-primary-500/10' 
                      : 'bg-white border-gray-50'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-14 h-14 rounded-[18px] items-center justify-center mr-4 ${
                      isHighest ? 'bg-primary-50' : 'bg-gray-50'
                    }`}>
                      {isHighest ? (
                        <View className="items-center justify-center">
                          <Text className="text-2xl mb-1">👑</Text>
                          <View className="absolute -bottom-1 px-2 bg-primary-500 rounded-lg">
                            <Text className="text-[8px] font-NunitoExtraBold text-white uppercase tracking-tighter">TOP</Text>
                          </View>
                        </View>
                      ) : (
                        <UserCircleIcon size={32} color="#D1D5DB" />
                      )}
                    </View>

                    <View className="flex-1 mr-2">
                      <View className="flex-col justify-center">
                        <Text 
                          className="font-NunitoExtraBold text-gray-900 text-[16px] mb-1 tracking-tight"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {bid.bidder_name || bid.bidder?.first_name || 'Anonymous Bidder'}
                        </Text>
                        
                        {isHighest && (
                          <View className="flex-row mb-1.5">
                            <View className="bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                              <Text className="text-[9px] font-NunitoExtraBold text-green-700 uppercase tracking-widest">Current highest</Text>
                            </View>
                          </View>
                        )}
                        
                        <View className="flex-row items-center">
                          <ClockIcon size={12} color="#9CA3AF" />
                          <Text className="text-[11px] text-gray-500 font-NunitoMedium ml-2 tracking-tight">
                            {getTimeAgo(bid.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-[9px] text-gray-400 font-NunitoExtraBold uppercase tracking-[2px] mb-1.5">Bid Amount</Text>
                      <View className="flex-row items-center">
                        <Text className={`text-[19px] font-NunitoExtraBold ${isHighest ? 'text-primary-600' : 'text-gray-900'} mr-3`}>
                          ₦{parseFloat(bid.amount || 0).toLocaleString()}
                        </Text>
                        {bid.is_me && bid.status?.toLowerCase() === 'pending' && (
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                "Retract Bid",
                                "Are you sure you want to retract your bid?",
                                [
                                  { text: "Cancel", style: "cancel" },
                                  { 
                                    text: "Retract", 
                                    style: "destructive",
                                    onPress: async () => {
                                      try {
                                        await deleteBidMutation.mutateAsync(bid.id);
                                        showToast.success("Bid retracted successfully");
                                      } catch (error) {
                                        showToast.error("Failed to retract bid");
                                      }
                                    }
                                  }
                                ]
                              );
                            }}
                            className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100"
                          >
                            {deleteBidMutation.isPending && deleteBidMutation.variables === bid.id ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <TrashIcon size={14} color="#EF4444" />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
};

export default BidHistoryList;