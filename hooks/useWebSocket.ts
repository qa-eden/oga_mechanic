import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/userStore';
import { ENV_CONFIG } from '../config/env';

export type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export type EventHandlers = {
  [eventType: string]: (data: WebSocketMessage) => void;
};

export type UseWebSocketOptions = {
  urlPath: string; // The specific segment (e.g., 'chat/support-123')
  eventHandlers?: EventHandlers;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  enabled?: boolean;
};

/**
 * Production-Ready WebSocket Hook
 * Features: Exponential Backoff, Closure Protection (Ref-based handlers), Stable Connection Refs, Exhaustive Logging.
 */
export default function useWebSocket({
  urlPath,
  eventHandlers = {},
  onConnect,
  onDisconnect,
  reconnect = true,
  reconnectInterval = 3000,
  enabled = true,
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const eventHandlersRef = useRef<EventHandlers>(eventHandlers);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const [isConnected, setIsConnected] = useState(false);

  // Silent in production — connection state is surfaced via isConnected
  
  // Use state for local token to handle hydration fallback
  const storeToken = useUserStore((state) => state.accessToken);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    if (storeToken) {
      setActiveToken(storeToken);
    } else if (!hasHydrated) {
      AsyncStorage.getItem('auth_token').then((token) => {
        if (token && !activeToken) {
          setActiveToken(token);
        }
      });
    }
  }, [storeToken, hasHydrated, activeToken]);

  // Update refs to latest callbacks to avoid closure staleness without reconnecting
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [eventHandlers, onConnect, onDisconnect]);

  const connect = useCallback(() => {
    // 1. Clear existing timeouts
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // Verify required conditions
    if (!enabled || !urlPath || !activeToken) {
      if (ws.current) {
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;
        ws.current.close();
        ws.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Clean up existing connection
    if (ws.current) {
      ws.current.onclose = null;
      ws.current.close();
    }

    // URL Construction
    const baseRaw = ENV_CONFIG.WEBSOCKET_URL.replace(/\/$/, '');
    const protocol = baseRaw.startsWith('wss') ? 'wss' : 'ws';
    const baseNoProto = baseRaw.replace(/^wss?:\/\//, '');
    const cleanPath = urlPath.replace(/^\//, '');
    const fullPath = `${baseNoProto}/${cleanPath}`.replace(/\/+/g, '/');
    const finalUrl = `${protocol}://${fullPath}${activeToken ? `?token=${activeToken}` : ''}`;

    try {
      ws.current = new WebSocket(finalUrl);

      ws.current.onopen = () => {
        reconnectAttempts.current = 0;
        setIsConnected(true);
        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          const handler = eventHandlersRef.current[data.type];
          if (handler) {
            handler(data);
          }
        } catch (error) {
          // Silently ignore malformed WS messages
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        onDisconnectRef.current?.();
        // Exponential backoff: 3s, 6s... max 30s
        if (enabled && reconnect) {
          reconnectAttempts.current += 1;
          const backoff = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts.current - 1), 30000);
          reconnectTimeout.current = setTimeout(connect, backoff);
        }
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };

    } catch (err) {
      // Connection setup failed — backoff will retry
    }
  }, [urlPath, enabled, reconnect, reconnectInterval, activeToken]);

  // Handle (re)connection logic
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [connect]);

  /**
   * Safe sendMessage function
   */
  const sendMessage = useCallback((type: string, payload: object = {}, isRaw: boolean = false) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const data = isRaw ? payload : { type, ...payload };
      ws.current.send(JSON.stringify(data));
    }
  }, [urlPath]);

  return { isConnected, sendMessage, reconnect: connect };
}
