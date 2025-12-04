import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from 'react-native-heroicons/outline';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: () => void;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  notifications = [],
  onNotificationPress,
  onMarkAllAsRead,
}) => {
  // Slide animation for notification modal
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').height)).current;

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle notification modal animations
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleNotificationPress = (notification: Notification) => {
    if (onNotificationPress) {
      onNotificationPress(notification);
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
    return time; // For now, just return the time string
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: Dimensions.get('window').height * 0.85,
          }}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
              <View className="flex-row items-center flex-1">
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
              <View className="flex-row items-center gap-3">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <TouchableOpacity
                    onPress={onMarkAllAsRead}
                    className="px-3 py-2"
                  >
                    <Text className="text-primary-500 text-sm font-NunitoMedium">
                      Mark all read
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 items-center justify-center"
                >
                  <XMarkIcon size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications List */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {notifications.length === 0 ? (
                <View className="items-center justify-center py-16 px-5">
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
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default NotificationsModal;

