import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackArrowBtn from '@/components/BackArrowBtn';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from 'react-native-heroicons/outline';
import { useNotifications } from '@/hooks/useUserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';
import { getErrorMessage } from '@/utils/errorMessages';
import { useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: () => void;
}

const Notification = () => {
  const queryClient = useQueryClient();
  
  // Fetch notifications from API
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useNotifications();

  // Transform API response to Notification interface
  const notifications: Notification[] = useMemo(() => {
    if (!notificationsData) return [];
    
    // Handle different possible response structures
    const data = notificationsData?.data || notificationsData;
    const notificationsArray = Array.isArray(data) ? data : (data?.notifications || data?.results || []);
    
    if (!Array.isArray(notificationsArray)) return [];

    return notificationsArray.map((item: any) => {
      // Map API fields to our Notification interface
      // Normalize notification type to match our interface
      const rawType = (item.type || item.notification_type || item.category || 'info').toLowerCase();
      let normalizedType: 'success' | 'info' | 'warning' | 'error' = 'info';
      
      if (rawType.includes('success') || rawType.includes('complete')) {
        normalizedType = 'success';
      } else if (rawType.includes('error') || rawType.includes('fail')) {
        normalizedType = 'error';
      } else if (rawType.includes('warning') || rawType.includes('pending')) {
        normalizedType = 'warning';
      }
      
      return {
        id: item.id?.toString() || item.notification_id?.toString() || '',
        type: normalizedType,
        title: item.title || item.subject || item.heading || 'Notification',
        message: item.message || item.body || item.description || item.content || '',
        time: item.created_at || item.timestamp || item.time || item.date || '',
        read: item.read || item.is_read || item.read_status || false,
        action: item.action_url ? () => {
          // TODO: Handle navigation based on action_url
          console.log('Navigate to:', item.action_url);
        } : undefined,
      };
    });
  }, [notificationsData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRefresh = async () => {
    await refetch();
  };

  const handleNotificationPress = (notification: Notification) => {
    // TODO: Implement mark as read API call when endpoint is available
    // For now, just handle action if exists
    if (notification.action) {
      notification.action();
    }
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read API call when endpoint is available
    console.log('Mark all as read - API call needed');
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
      
      // For older notifications, show date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch (error) {
      return time;
    }
  };

  // Loading state
  if (isLoading && !notificationsData) {
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
            message={getErrorMessage(error, 'general')}
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
                {unreadCount} new
              </Text>
            </View>
          )}
        </View>
        <View className="w-10">
          {/* {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="px-2 py-1"
            >
              <Text className="text-primary-500 text-sm font-NunitoMedium">
                Mark all read
              </Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#D30309']}
            tintColor="#D30309"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {notifications.length === 0 ? (
          <View className="items-center justify-center py-16 px-5 mt-20">
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
        ) : (
          <View className="px-5 pt-4">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`mb-3 rounded-2xl border-2 p-4 ${
                  notification.read
                    ? 'bg-white border-gray-100'
                    : 'bg-primary-50 border-primary-200'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  {/* Icon */}
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center ${getNotificationBgColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </View>

                  {/* Content */}
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text
                        className={`text-base font-NunitoBold flex-1 ${
                          notification.read ? 'text-gray-900' : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1" />
                      )}
                    </View>
                    <Text className="text-sm font-NunitoMedium text-gray-600 mb-2 leading-5">
                      {notification.message}
                    </Text>
                    <Text className="text-xs font-NunitoMedium text-gray-400">
                      {formatRelativeTime(notification.time)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;
