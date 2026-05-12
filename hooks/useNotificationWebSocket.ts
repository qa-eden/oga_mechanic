import { useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWebSocket, { WebSocketMessage } from './useWebSocket';
import { scheduleGenericNotification, scheduleSuccessNotification } from '../services/notificationService';
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
 *
 * Repair event type variants handled (backend may use either naming convention):
 *   Top-level WS event: repair_update | repair-update | repair_status | repair-status
 *   Nested inside notification.new / notification wrappers: same values in .notification_type or .type
 */
export const useNotificationWebSocket = ({ onNewOrder, enabled = true, triggerPush = false }: UseNotificationWebSocketOptions) => {
  const queryClient = useQueryClient();

  /**
   * Shared cache invalidation for any repair request status change.
   * Covers both list views and the specific order detail (tracking screen).
   */
  const invalidateRepairCaches = useCallback((data?: any) => {
    // Invalidate list queries for both mechanic and user sides
    queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'repair-requests'] });

    // Try to pinpoint the specific order so the tracking screen auto-refreshes
    const orderId =
      data?.repair_request_id ||
      data?.order_id ||
      data?.related_object_id ||
      data?.id ||
      data?.data?.repair_request_id ||
      data?.data?.order_id;

    if (orderId) {
      queryClient.invalidateQueries({ queryKey: ['repair-request', String(orderId)] });
    } else {
      // Broad fallback — invalidates all cached order details
      queryClient.invalidateQueries({ queryKey: ['repair-request'] });
    }
  }, [queryClient]);

  /** Returns true if the event type string is any known repair update/status variant */
  const isRepairUpdateType = (type: string) =>
    type === 'repair_status' ||
    type === 'repair-status' ||
    type === 'repair_update' ||
    type === 'repair-update';

  const eventHandlers = useMemo(() => ({

    // ── New Order Events ──────────────────────────────────────────────────────
    new_repair_request: (data: WebSocketMessage) => {
      invalidateRepairCaches(data);
      if (onNewOrder) onNewOrder(data.order || data);
      playMechanicNotificationSound();
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData?.title && notifData?.message) {
          scheduleGenericNotification(notifData.title, notifData.message, notifData);
          useNotificationStore.getState().showNotification(notifData.title, notifData.message, 'order', notifData);
        } else {
          scheduleGenericNotification('New Repair Request', 'You have a new mechanic order nearby!', data);
          useNotificationStore.getState().showNotification('New Repair Request', 'You have a new mechanic order nearby!', 'order', data);
        }
      }
    },

    new_order: (data: WebSocketMessage) => {
      invalidateRepairCaches(data);
      if (onNewOrder) onNewOrder(data.order || data);
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData?.title && notifData?.message) {
          scheduleGenericNotification(notifData.title, notifData.message, notifData);
          useNotificationStore.getState().showNotification(notifData.title, notifData.message, 'order', notifData);
        } else {
          scheduleGenericNotification('New Order', 'A new order has been placed.', data);
          useNotificationStore.getState().showNotification('New Order', 'A new order has been placed.', 'order', data);
        }
      }
    },

    // ── Repair Status Update Events (top-level, ALL naming variants) ──────────
    // Backend may use underscore OR hyphen — all four are handled explicitly.
    repair_update: (data: WebSocketMessage) => {
      playMechanicNotificationSound();
      invalidateRepairCaches(data);
    },
    'repair-update': (data: WebSocketMessage) => {
      playMechanicNotificationSound();
      invalidateRepairCaches(data);
    },
    repair_status: (data: WebSocketMessage) => {
      playMechanicNotificationSound();
      invalidateRepairCaches(data);
    },
    'repair-status': (data: WebSocketMessage) => {
      playMechanicNotificationSound();
      invalidateRepairCaches(data);
    },

    // ── Support/Chat Events ───────────────────────────────────────────────────
    chat_message: (_data: WebSocketMessage) => {
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: ['support-messages'] });
    },
    new_message: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),
    support_update: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),

    // ── Canonical Backend Notification Events ─────────────────────────────────
    'notification.count': () => {
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: ['primary-profile'] });
    },
    'notification.count_update': (_data: any) => {
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: [...userProfileKeys.notifications()] });
    },

    // Notification wrapper — nested .type field may be any of the repair variants
    'notification.new': (data: WebSocketMessage) => {
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      queryClient.refetchQueries({ queryKey: ['support-messages'] });
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData?.title && notifData?.message) {
          const type: string = notifData.notification_type || notifData.type || '';
          if (type === 'success') {
            scheduleSuccessNotification(notifData.title, notifData.message, notifData);
          } else {
            scheduleGenericNotification(notifData.title, notifData.message, notifData);
          }
          const isChat = type === 'support_chat' || type === 'chat_message';
          if (isRepairUpdateType(type)) {
            playMechanicNotificationSound();
            invalidateRepairCaches(notifData);
          }
          useNotificationStore.getState().showNotification(
            notifData.title, notifData.message,
            isChat ? 'chat' : type === 'success' ? 'success' : 'info',
            notifData
          );
        }
      }
    },

    notification: (data: WebSocketMessage) => {
      queryClient.refetchQueries({ queryKey: ['support-conversations'] });
      if (triggerPush) {
        const notifData = data.notification || data.data || data;
        if (notifData?.title && notifData?.message) {
          const type: string = notifData.notification_type || notifData.type || '';
          if (type === 'success') {
            scheduleSuccessNotification(notifData.title, notifData.message, notifData);
          } else {
            scheduleGenericNotification(notifData.title, notifData.message, notifData);
          }
          const isChat = type === 'support_chat' || type === 'chat_message';
          if (isRepairUpdateType(type)) {
            playMechanicNotificationSound();
            invalidateRepairCaches(notifData);
          }
          useNotificationStore.getState().showNotification(
            notifData.title, notifData.message,
            isChat ? 'chat' : type === 'success' ? 'success' : 'info',
            notifData
          );
        }
      }
    },

    message: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),
    update: () => queryClient.refetchQueries({ queryKey: ['support-conversations'] }),

  }), [onNewOrder, queryClient, triggerPush, invalidateRepairCaches]);

  const { isConnected, reconnect } = useWebSocket({
    urlPath: 'notifications/',
    eventHandlers,
    enabled,
  });

  useEffect(() => {
    // No-op — isConnected is exposed for consumers that need it
  }, [isConnected, enabled]);

  return { isConnected, reconnect };
};
