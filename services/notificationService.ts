import { Platform } from 'react-native';

// Helpers to safely get native modules
const getNotifications = () => {
  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
};

const getDevice = () => {
  try {
    return require('expo-device');
  } catch (e) {
    return null;
  }
};

/**
 * Requests notification permissions and returns the Expo push token.
 * Must be called on a real device (not simulator) for push tokens.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const Notifications = getNotifications();
  const Device = getDevice();
  
  if (!Notifications || !Device) {
    console.warn('Notifications or Device module not available.');
    return null;
  }

  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for push notifications.');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mechanic-orders', {
        name: 'New Repair Orders',
        importance: Notifications.AndroidImportance?.MAX ?? 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    console.warn('Could not get push token:', e);
    return null;
  }
}

/**
 * Schedule a local notification immediately (used for new order alerts).
 */
export async function scheduleNewOrderNotification(params: {
  customerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  serviceType?: string;
}) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  const { customerName, vehicleMake, vehicleModel, serviceType } = params;

  const title = '🔧 New Repair Order!';
  const bodyParts = [];

  if (customerName) bodyParts.push(`From: ${customerName}`);
  if (vehicleMake || vehicleModel) bodyParts.push(`Vehicle: ${[vehicleMake, vehicleModel].filter(Boolean).join(' ')}`);
  if (serviceType) bodyParts.push(`Service: ${serviceType}`);

  const body = bodyParts.length > 0
    ? bodyParts.join(' • ')
    : 'A customer has sent a new repair request. Tap to review.';

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'new_order' },
      },
      trigger: null, // Fire immediately
    });
  } catch (e) {
    console.warn('Failed to schedule notification:', e);
  }
}

/**
 * Cancels all scheduled notifications.
 */
export async function cancelAllNotifications() {
  const Notifications = getNotifications();
  if (!Notifications) return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn('Failed to cancel notifications:', e);
  }
}
