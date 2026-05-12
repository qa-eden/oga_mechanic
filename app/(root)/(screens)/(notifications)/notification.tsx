import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from 'react-native-heroicons/outline';
import {
  useInfiniteNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead
} from '@/hooks/useUserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import { getApiErrorMessage } from '@/utils/errorMessages';
import { routes } from '@/constants/routes';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
  action?: () => void;
}

const Notification = () => {
  const [filterUnread, setFilterUnread] = useState(false);

  // Fetch infinite notifications from API
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteNotifications({ 
    // category: 'admin_chat', 
    category: 'general', 
    is_read: filterUnread ? false : undefined 
  });

  // Mutation hooks
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // Transform API response to Notification interface
  const notifications: Notification[] = useMemo(() => {
    if (!data?.pages) return [];
    
    // Flat map all pages into a single array
    const notificationsArray = data.pages.flatMap((page: any) => {
      const pageData = page?.data || page;
      return Array.isArray(pageData) ? pageData : (pageData?.notifications || pageData?.results || []);
    });
    
    return notificationsArray.map((item: any) => {
      // Normalize notification type
      const rawType = (item.type || item.notification_type || 'info').toLowerCase();
      let normalizedType: 'success' | 'info' | 'warning' | 'error' = 'info';
      
      if (rawType.includes('success') || rawType.includes('complete')) {
        normalizedType = 'success';
      } else if (rawType.includes('error') || rawType.includes('fail')) {
        normalizedType = 'error';
      } else if (rawType.includes('warning') || rawType.includes('pending')) {
        normalizedType = 'warning';
      }
      
      return {
        id: item.id?.toString() || '',
        type: normalizedType,
        title: item.title || item.subject || 'Notification',
        message: item.message || item.body || item.description || item.content || '',
        time: item.created_at || item.timestamp || item.time || '',
        read: item.read || item.is_read || item.read_status || false,
        data: item,
      };
    });
  }, [data]);

  const firstPageData = data?.pages[0]?.data || data?.pages[0];
  const totalCount = firstPageData?.count || 0;
  const unreadCount = notifications.filter(n => !n.read).length; // Approximated from loaded pages, but could be fetched from API if available

  const handleRefresh = async () => {
    await refetch();
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    const itemData = notification.data;
    const type = itemData?.notification_type || itemData?.type;
    const relatedId = itemData?.related_object_id || itemData?.related_id;

    if (type === 'repair_update' && relatedId) {
      router.push({
        pathname: routes.trackMechanicOrder as any,
        params: { orderId: relatedId }
      });
    } else if (type === 'support_chat') {
      router.push({
        pathname: routes.chatSpecialist as any,
        params: { roomId: relatedId }
      });
    } else {
      router.push({
        pathname: routes.notificationDetail as any,
        params: { id: notification.id }
      });
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={24} color="#10B981" />;
      case 'error':
        return <ExclamationCircleIcon size={24} color="#EF4444" />;
      case 'warning':
        return <ExclamationCircleIcon size={24} color="#F59E0B" />;
      default:
        return <InformationCircleIcon size={24} color="#3B82F6" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const formatRelativeTime = (time: string) => {
    if (!time) return '';
    
    try {
      const date = new Date(time);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMins = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMs / 3600000);
      const diffInDays = Math.floor(diffInMs / 86400000);

      if (diffInMins < 1) return 'Just now';
      if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch (error) {
      return time;
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View className="h-20" />;
    return (
      <View className="py-6 items-center h-20">
        <ActivityIndicator size="small" color="#D30309" />
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <View className="flex-row items-center flex-1 justify-center">
            <Text className="text-xl font-NunitoBold text-gray-900">
              Notifications
            </Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
          <Text className="text-gray-600 mt-4 font-NunitoMedium">
            Loading notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <View className="flex-row items-center flex-1 justify-center">
            <Text className="text-xl font-NunitoBold text-gray-900">
              Notifications
            </Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="flex-1 px-5 py-8">
          <AnimatedErrorCard
            emoji="🔔"
            title="Failed to load notifications"
            message={getApiErrorMessage(error, 'general')}
            gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
            textColor="text-red-800"
            actionButton={{
              text: "Try Again",
              onPress: () => refetch(),
              backgroundColor: "#DC2626"
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <BackArrowBtn />
        <View className="flex-row items-center flex-1 justify-center">
          <Text className="text-xl font-NunitoBold text-gray-900">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View className="ml-3 bg-primary-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-NunitoBold">
                {totalCount > 0 ? totalCount : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <View className="">
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              className="px-2 py-1"
              disabled={markAllAsReadMutation.isPending}
            >
              <Text className={`text-sm font-NunitoMedium ${markAllAsReadMutation.isPending ? 'text-gray-400' : 'text-primary-500'}`}>
                {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all read'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View className="px-5 py-3 border-b border-gray-100 flex-row bg-white">
        <TouchableOpacity
          onPress={() => setFilterUnread(false)}
          className={`px-4 py-1.5 rounded-full mr-2 border ${!filterUnread ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}
        >
          <Text className={`text-sm font-NunitoBold ${!filterUnread ? 'text-primary-700' : 'text-gray-500'}`}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilterUnread(true)}
          className={`px-4 py-1.5 rounded-full border ${filterUnread ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}
        >
          <Text className={`text-sm font-NunitoBold ${filterUnread ? 'text-primary-700' : 'text-gray-500'}`}>Unread</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List using FlatList */}
      <FlatList
        className="flex-1 px-5 pt-4"
        data={notifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#D30309']}
            tintColor="#D30309"
          />
        }
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 mt-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <BellIcon size={40} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2">
              No Notifications
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500 text-center">
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            className={`mb-3 rounded-2xl border-2 p-4 ${
              item.read
                ? 'bg-white border-gray-100'
                : 'bg-primary-50 border-primary-200'
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row">
              {/* Icon */}
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center ${getNotificationBgColor(
                  item.type
                )}`}
              >
                {getNotificationIcon(item.type)}
              </View>

              {/* Content */}
              <View className="flex-1 ml-3">
                <View className="flex-row items-start justify-between mb-1">
                  <Text
                    className={`text-base font-NunitoBold flex-1 ${
                      item.read ? 'text-gray-900' : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </Text>
                  {!item.read && (
                    <View className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1" />
                  )}
                </View>
                <Text className="text-sm font-NunitoMedium text-gray-600 mb-2 leading-5">
                  {item.message}
                </Text>
                <Text className="text-xs font-NunitoMedium text-gray-400">
                  {formatRelativeTime(item.time)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Notification;
