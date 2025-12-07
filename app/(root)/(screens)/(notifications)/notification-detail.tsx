import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import BackArrowBtn from '@/components/BackArrowBtn';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { 
  useNotifications, 
  useMarkNotificationAsRead 
} from '@/hooks/useUserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedErrorCard from '@/components/AnimatedErrorCard';

interface NotificationDetail {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  readAt?: string | null;
}

const NotificationDetailScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const notificationId = params?.id;

  // Fetch notifications to get the specific one
  const { data: notificationsData, isLoading, error, refetch } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  // Find the specific notification
  const notification: NotificationDetail | null = useMemo(() => {
    if (!notificationsData || !notificationId) return null;
    
    const data = notificationsData?.data || notificationsData;
    const notificationsArray = Array.isArray(data) ? data : (data?.notifications || data?.results || []);
    
    if (!Array.isArray(notificationsArray)) return null;

    const item = notificationsArray.find((n: any) => 
      n.id?.toString() === notificationId || n.notification_id?.toString() === notificationId
    );

    if (!item) return null;

    // Normalize notification type
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
      readAt: item.read_at || null,
    };
  }, [notificationsData, notificationId]);

  // Mark as read when viewing
  useEffect(() => {
    if (notification && !notification.read && notificationId) {
      markAsReadMutation.mutate(notificationId);
    }
  }, [notification?.id, notification?.read]);

  const getNotificationIcon = (type: string, size: number = 32) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={size} color="#10B981" />;
      case 'error':
        return <ExclamationCircleIcon size={size} color="#EF4444" />;
      case 'warning':
        return <ExclamationCircleIcon size={size} color="#F59E0B" />;
      default:
        return <InformationCircleIcon size={size} color="#3B82F6" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      default:
        return 'border-blue-200';
    }
  };

  const formatDateTime = (time: string) => {
    if (!time) return '';
    
    try {
      const date = new Date(time);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  };

  // Loading state
  if (isLoading && !notificationsData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900 flex-1 text-center">
            Notification
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Error or not found state
  if (error || !notification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900 flex-1 text-center">
            Notification
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 px-5 py-8">
          <AnimatedErrorCard
            emoji="🔔"
            title="Notification not found"
            message="This notification may have been deleted or is no longer available."
            gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
            textColor="text-red-800"
            actionButton={{
              text: "Go Back",
              onPress: () => router.back(),
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
        <Text className="text-xl font-NunitoBold text-gray-900 flex-1 text-center">
          Notification
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Notification Card */}
        <View className={`bg-white rounded-2xl border-2 ${getNotificationBorderColor(notification.type)} overflow-hidden`}>
          {/* Type Banner */}
          <View className={`${getNotificationBgColor(notification.type)} px-5 py-4 flex-row items-center`}>
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center mr-4">
              {getNotificationIcon(notification.type)}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-NunitoBold text-gray-900">
                {notification.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <ClockIcon size={14} color="#6B7280" />
                <Text className="text-sm font-NunitoMedium text-gray-500 ml-1">
                  {formatDateTime(notification.time)}
                </Text>
              </View>
            </View>
          </View>

          {/* Message Content */}
          <View className="px-5 py-5">
            <Text className="text-base font-NunitoMedium text-gray-700 leading-6">
              {notification.message}
            </Text>
          </View>

          {/* Status Footer */}
          <View className="px-5 py-4 border-t border-gray-100 bg-gray-50">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${notification.read ? 'bg-green-500' : 'bg-primary-500'}`} />
                <Text className="text-sm font-NunitoMedium text-gray-500">
                  {notification.read ? 'Read' : 'Unread'}
                </Text>
              </View>
              {notification.readAt && (
                <Text className="text-xs font-NunitoMedium text-gray-400">
                  Read at {formatDateTime(notification.readAt)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationDetailScreen;

