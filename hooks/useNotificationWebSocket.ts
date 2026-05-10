import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { WebSocketMessage } from './useWebSocket';
import { scheduleGenericNotification } from '../services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import { userProfileKeys } from './useUserProfile';
import { playMechanicNotificationSound } from '../utils/sound';

interface UseNotificationWebSocketOptions {
  onNewOrder?: (order: any) => void;
  enabled?: boolean;
  triggerPush?: boolean;
}

/**
 * Real-time notification hook.
 * Centralizes all support and system-wide notifications.
 */
export const useNotificationWebSocket = ({ onNewOrder, enabled = true, triggerPush = false }: UseNotificationWebSocketOptions) => {
  const queryClient = useQueryClient();
  
  const eventHandlers = useMemo(() => ({
    // Order events
    new_repair_request: (data: WebSocketMessage) => {
      console.log('⚡ [Notification WS] New repair request!', data);
      if (onNewOrder) onNewOrder(data.order || data);
      
      // Play mechanic sound for new repair requests
      playMechanicNotificationSound();

      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData && notifData.title && notifData.message) {
          scheduleGenericNotification(notifData.title, notifData.message, notifData);
          useNotificationStore.getState().showNotification(notifData.title, notifData.message, 'order', notifData);
        } else {
          scheduleGenericNotification('New Repair Request', 'You have a new mechanic order nearby!', data);
          useNotificationStore.getState().showNotification('New Repair Request', 'You have a new mechanic order nearby!', 'order', data);
        }
      }
    },
    new_order: (data: WebSocketMessage) => {
      console.log('⚡ [Notification WS] New order!', data);
      if (onNewOrder) onNewOrder(data.order || data);
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData && notifData.title && notifData.message) {
          scheduleGenericNotification(notifData.title, notifData.message, notifData);
          useNotificationStore.getState().showNotification(notifData.title, notifData.message, 'order', notifData);
        } else {
          scheduleGenericNotification('New Order', 'A new order has been placed.', data);
          useNotificationStore.getState().showNotification('New Order', 'A new order has been placed.', 'order', data);
        }
      }
    },
    // Support/Chat events - Upgraded to refetchQueries for instant list updates
    chat_message: (data: WebSocketMessage) => {
      console.log('⚡ [Notification WS] Chat Message detected!');
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: ['support-messages'] });
    },
    new_message: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),
    support_update: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),
    
    // Canonical Backend Events
    'notification.count': () => {
      console.log('📊 [Notification WS] Counts updated!');
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: ['primary-profile'] });
    },
    'notification.count_update': (data: any) => {
      console.log('📊 [Notification WS] Count update event received!', data);
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: [...userProfileKeys.notifications()] });
    },
    'notification.new': (data: WebSocketMessage) => {
      console.log('🔔 [Notification WS] New notification event!');
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: ['support-messages'] });
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData && notifData.title && notifData.message) {
          scheduleGenericNotification(notifData.title, notifData.message, notifData);
          const type = notifData.notification_type || notifData.type;
          const isChat = type === 'support_chat' || type === 'chat_message';
          
          // Play sound for repair status/update
          if (type === 'repair_status' || type === 'repair_update') {
            playMechanicNotificationSound();
          }

          useNotificationStore.getState().showNotification(notifData.title, notifData.message, isChat ? 'chat' : 'info', notifData);
        }
      }
    },
    notification: (data: WebSocketMessage) => {
      console.log('🔔 [Notification WS] Generic notification:', data);
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData && notifData.title && notifData.message) {
          scheduleGenericNotification(notifData.title, notifData.message, notifData);
          const type = notifData.notification_type || notifData.type;
          const isChat = type === 'support_chat' || type === 'chat_message';

          // Play sound for repair status/update
          if (type === 'repair_status' || type === 'repair_update') {
            playMechanicNotificationSound();
          }

          useNotificationStore.getState().showNotification(notifData.title, notifData.message, isChat ? 'chat' : 'info', notifData);
        }
      }
    },
    // Broad catch-alls for any message through this channel
    message: () => {
      console.log('🔄 [Notification WS] Generic refresh trigger...');
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
    },
    update: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),
  }), [onNewOrder, queryClient]);

  const { isConnected, reconnect } = useWebSocket({
    urlPath: 'notifications/',
    eventHandlers,
    enabled,
  });

  useEffect(() => {
    if (enabled) {
      console.log(`🔔 [Notification WS] ${isConnected ? '✅ CONNECTED' : '⏳ CONNECTING...'}`);
    }
  }, [isConnected, enabled]);

  return { isConnected, reconnect };
};
