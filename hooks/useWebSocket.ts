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
  
  // Use state for local token to handle hydration fallback
  const storeToken = useUserStore((state) => state.accessToken);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  // Update activeToken when store hydrates or changes
  useEffect(() => {
    if (storeToken) {
      setActiveToken(storeToken);
    } else if (!hasHydrated) {
      // If store is still hydrating, try direct disk read as a fallback
      AsyncStorage.getItem('auth_token').then((token) => {
        if (token && !activeToken) {
          console.log('🔌 [WebSocket] Recovered token from disk (Pre-hydration fallback)');
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

    // 2. Auth & Reality Check
    if (!enabled || !urlPath || !storeToken) {
      if (ws.current) {
        ws.current.onclose = null; // Prevent self-healing
        ws.current.close();
        ws.current = null;
        setIsConnected(false);
      }
      
      const missing = [];
      if (!storeToken) missing.push('AccessToken');
      if (!urlPath) missing.push('URL Path');
      if (!enabled) missing.push('Enabled Flag');
      
      if (hasHydrated && missing.length > 0) {
        console.warn(`🔌 [WebSocket] Waiting for: ${missing.join(', ')}`);
      }
      return;
    }

    // 3. Clean up existing connection if it exists
    if (ws.current) {
      ws.current.onclose = null;
      ws.current.close();
    }

    // 4. URL Construction (Cleaning slashes to prevent 404s)
    const baseRaw = ENV_CONFIG.WEBSOCKET_URL.replace(/\/$/, ""); // remove trailing slash
    const protocol = baseRaw.startsWith("wss") ? "wss" : "ws";
    const baseNoProto = baseRaw.replace(/^wss?:\/\//, "");
    
    const cleanPath = urlPath.replace(/^\//, "").replace(/\/$/, "");
    const fullPath = `${baseNoProto}/${cleanPath}`.replace(/\/+/g, "/");
    
    // Construct finalUrl - ensuring trailing slash before query params as required by backend
    const finalUrl = `${protocol}://${fullPath}/?token=${storeToken}`;

    console.groupCollapsed(`🔌 [WebSocket Connecting] ${urlPath}`);
    console.table({
      Path: urlPath,
      Target: fullPath,
      Status: 'Connecting',
      Protocol: protocol,
      Token: `***${storeToken.slice(-6)}`,
      URL: finalUrl // Add this for precise terminal inspection
    });
    console.groupEnd();

    try {
      ws.current = new WebSocket(finalUrl);

      ws.current.onopen = () => {
        reconnectAttempts.current = 0; // Reset backoff
        console.log(`✅ [WebSocket Connected] ${urlPath}`);
        setIsConnected(true);
        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        console.log('🔥 [WS RAW RECEIVE] Data:', event.data);
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log(`📥 [WebSocket RAW] ${urlPath}:`, JSON.stringify(data));
          
          const handler = eventHandlersRef.current[data.type];
          if (handler) {
            handler(data);
          } else if (data.type !== 'ping') {
             console.warn(`No handler for event: ${data.type}`);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket JSON:', error);
          console.log('Raw message:', event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.groupCollapsed(`🔌 [WebSocket Disconnected] ${urlPath}`);
        console.table({
            Reason: event.reason || 'No reason provided',
            Code: event.code,
            WillReconnect: enabled && reconnect ? 'Yes' : 'No'
        });
        console.groupEnd();

        setIsConnected(false);
        onDisconnectRef.current?.();

        // Exponential backoff: 3s, 6s ... max 30s
        if (enabled && reconnect) {
          reconnectAttempts.current += 1;
          const backoff = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts.current - 1), 30000);
          console.warn(`⏳ [WebSocket] Reconnecting in ${backoff / 1000}s (attempt ${reconnectAttempts.current})`);
          reconnectTimeout.current = setTimeout(connect, backoff);
        }
      };

      ws.current.onerror = (error) => {
        // Use warn to bypass RN Red Box blocking while debugging
        console.warn(`🔌 [WebSocket Error] ${urlPath}:`, error);
        ws.current?.close(); // Trigger backoff flow
      };

    } catch (err) {
      console.error('❌ [WebSocket Setup Crash]:', err);
    }
  }, [urlPath, enabled, reconnect, reconnectInterval, storeToken]);

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
    } else {
      console.warn(`⚠️ [WebSocket] Cannot send message: ${urlPath} is not OPEN. ReadyState: ${ws.current?.readyState}`);
    }
  }, [urlPath]);

  return { isConnected, sendMessage, reconnect: connect };
}
