import { useEffect, useMemo } from 'react';
import useWebSocket, { WebSocketMessage } from './useWebSocket';

interface UseNotificationWebSocketOptions {
  onNewOrder?: (order: any) => void;
  enabled?: boolean;
}

/**
 * Real-time notification hook.
 * Listens to the /ws/notifications/ channel for instant order alerts.
 */
export const useNotificationWebSocket = ({ onNewOrder, enabled = true }: UseNotificationWebSocketOptions) => {
  
  const eventHandlers = useMemo(() => ({
    // The specific event type for a new repair request
    // Common types: 'new_repair_request', 'new_order', or 'notification'
    new_repair_request: (data: WebSocketMessage) => {
      console.log('⚡ [Notification WS] New repair request received!', data);
      if (onNewOrder) onNewOrder(data.order || data);
    },
    new_order: (data: WebSocketMessage) => {
      console.log('⚡ [Notification WS] New order received!', data);
      if (onNewOrder) onNewOrder(data.order || data);
    },
    notification: (data: WebSocketMessage) => {
      console.log('🔔 [Notification WS] General notification:', data);
      // If it's a repair request notification, trigger the banner
      if (data.notification_type === 'new_repair_request' || data.type === 'new_order') {
        if (onNewOrder) onNewOrder(data.data || data);
      }
    }
  }), [onNewOrder]);

  const { isConnected, reconnect } = useWebSocket({
    urlPath: 'notifications', 
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
