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

  // Log connection state changes explicitly
  useEffect(() => {
    console.log(`\n=========================================`);
    console.log(`📡 WebSocket is connected: ${isConnected}`);
    console.log(`=========================================\n`);
  }, [isConnected]);
  
  // Use state for local token to handle hydration fallback
  const storeToken = useUserStore((state) => state.accessToken);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  // Update activeToken when store hydrates or changes
  useEffect(() => {
    console.log(`[WebSocket DEBUG] storeToken updated: ${storeToken?.slice(0, 20)}...`);
    if (storeToken) {
      console.log('🔌 [WebSocket] Using token from Store');
      setActiveToken(storeToken);
    } else if (!hasHydrated) {
      // If store is still hydrating, try direct disk read as a fallback
      AsyncStorage.getItem('auth_token').then((token) => {
        if (token && !activeToken) {
          console.log(`🔌 [WebSocket] Recovered token from disk: ${token.slice(0, 20)}...`);
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
    if (!enabled || !urlPath || !activeToken) {
      if (ws.current) {
        console.log(`🛑 [WebSocket] Hard Shutting Down: ${urlPath}`);
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null; // Kill the self-healing loop
        ws.current.close();
        ws.current = null;
        setIsConnected(false);
      }
      
      const missing = [];
      if (!activeToken) missing.push('AccessToken');
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
    
    const cleanPath = urlPath.replace(/^\//, ""); 
    const fullPath = `${baseNoProto}/${cleanPath}`.replace(/\/+/g, "/");
    
    // Construct finalUrl - most backends prefer /?token or just ?token
    // We will use the path exactly as provided, and only add ?token
    const finalUrl = `${protocol}://${fullPath}${activeToken ? `?token=${activeToken}` : ''}`;

    console.log(`🔑 [WebSocket] Token Length: ${activeToken.length}`);

    console.groupCollapsed(`🔌 [WebSocket Connecting] ${urlPath}`);
    console.table({
      Path: urlPath,
      Target: fullPath,
      Status: 'Connecting',
      Protocol: protocol,
      Token: `***${activeToken.slice(-6)}`,
      URL: finalUrl // Add this for precise terminal inspection
    });
    console.groupEnd();

    try {
      ws.current = new WebSocket(finalUrl);

      ws.current.onopen = () => {
        reconnectAttempts.current = 0; // Reset backoff
        console.log(`\n✅ [WebSocket Connected]`);
        console.log(`📍 Path: ${urlPath}`);
        console.log(`🔗 URL: ${finalUrl}`);
        console.log(`==========================\n`);
        setIsConnected(true);
        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // LOUD LOGGING for every message
          console.log(`\n📥 [WS MESSAGE RECEIVED]`);
          console.log(`📍 Path: ${urlPath}`);
          console.log(`🏷️  Type: ${data.type || 'UNKNOWN'}`);
          console.log(`📦 Data:`, JSON.stringify(data, null, 2));
          console.log(`========================\n`);
          
          const handler = eventHandlersRef.current[data.type];
          if (handler) {
            handler(data);
          } else if (data.type !== 'ping') {
             console.warn(`⚠️ [WebSocket] No handler registered for event type: ${data.type}`);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket JSON:', error);
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
        
        // If we fail with a token that might be stale (even if not expired), 
        // we can try to trigger a refresh via a small REST call that we know handles 401s
        // or by explicitly calling the refresh logic.
        if (reconnectAttempts.current === 0) {
           console.log('🔄 [WebSocket] First failure - attempting to check session health...');
           // Triggering a background profile fetch which will trigger axios refresh if needed
           const { userAPI } = require('../lib/api/user');
           userAPI.getProfile().catch((e: any) => console.log('👤 [WebSocket] Health check REST failed:', e.message));
        }

        ws.current?.close(); // Trigger backoff flow
      };

    } catch (err) {
      console.error('❌ [WebSocket Setup Crash]:', err);
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
    } else {
      console.warn(`⚠️ [WebSocket] Cannot send message: ${urlPath} is not OPEN. ReadyState: ${ws.current?.readyState}`);
    }
  }, [urlPath]);

  return { isConnected, sendMessage, reconnect: connect };
}
