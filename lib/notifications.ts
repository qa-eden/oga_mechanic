import { Platform } from 'react-native';

/**
 * Safely initialize notification listeners.
 * Wraps in try-catch to prevent crashes when native modules are missing (e.g. in development builds that haven't been rebuilt).
 */
export const setupNotificationListeners = (onNewOrder: () => void, onNewMessage: (data: any) => void) => {
  try {
    const Notifications = require('expo-notifications');
    
    // Basic configuration
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'new_order') {
        onNewOrder();
      } else if (data?.type === 'chat_message') {
        onNewMessage(data);
      }
    });

    return subscription;
  } catch (error) {
    console.warn("Notifications native module not available. Push notifications will not work until you rebuild the development client.", error);
    return null;
  }
};
