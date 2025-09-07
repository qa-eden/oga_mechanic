import { ENV_CONFIG } from '../config/env';

// Signaling server configuration
export const SIGNALING_CONFIG = {
  // WebSocket URL from environment configuration
  WEBSOCKET_URL: ENV_CONFIG.WEBSOCKET_URL,
  
  // WebRTC ICE servers for NAT traversal
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  
  // TURN servers for relay (optional, for better connectivity)
  TURN_SERVERS: [
    // Add your TURN server credentials here if needed
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'your-username',
    //   credential: 'your-password'
    // }
  ],
};

// Call configuration
export const CALL_CONFIG = {
  // Audio constraints
  AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  
  // Video constraints (for future video calls)
  VIDEO_CONSTRAINTS: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
  
  // Call timeout settings
  TIMEOUTS: {
    CONNECTION_TIMEOUT: 30000, // 30 seconds
    ICE_TIMEOUT: 10000, // 10 seconds
    CALL_TIMEOUT: 300000, // 5 minutes
  },
};

// Message types for signaling
export const MESSAGE_TYPES = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  CALL_REQUEST: 'call-request',
  CALL_ACCEPTED: 'call-accepted',
  CALL_REJECTED: 'call-rejected',
  CALL_ENDED: 'call-ended',
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  ERROR: 'error',
};
