import { Audio } from 'expo-av';

export interface CallState {
  isConnected: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  remoteStream: any;
  localStream: any;
}

class CallService {
  private sound: Audio.Sound | null = null;
  private onCallStateChange: ((state: CallState) => void) | null = null;
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private isMuted: boolean = false;
  private isConnected: boolean = false;
  private callTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  private initializeWebSocket() {
    // For demo purposes, we'll simulate WebSocket connection
    // In a real app, you would connect to your signaling server
    console.log('Simulating WebSocket connection...');
    
    // Simulate connection after a delay
    setTimeout(() => {
      console.log('WebSocket connected (simulated)');
      this.isConnected = true;
      this.updateCallState();
    }, 1000);
  }

  // Initialize call
  async initializeCall(roomId: string, isInitiator: boolean = false) {
    this.roomId = roomId;
    
    try {
      this.initializeWebSocket();
      
      // Simulate call setup
      setTimeout(() => {
        this.isConnected = true;
        this.updateCallState();
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing call:', error);
      throw error;
    }
  }

  // Make outgoing call
  async makeCall(roomId: string, targetUserId: string) {
    await this.initializeCall(roomId, true);
    
    console.log(`Making call to ${targetUserId} in room ${roomId}`);
    
    // Simulate call connection
    setTimeout(() => {
      this.isConnected = true;
      this.updateCallState();
    }, 3000);
  }

  // Accept incoming call
  async acceptCall(roomId: string) {
    await this.initializeCall(roomId, false);
    
    console.log(`Accepting call in room ${roomId}`);
    
    // Simulate call connection
    setTimeout(() => {
      this.isConnected = true;
      this.updateCallState();
    }, 2000);
  }

  // Reject incoming call
  rejectCall(roomId: string) {
    console.log(`Rejecting call in room ${roomId}`);
    this.endCall();
  }

  // End call
  endCall() {
    console.log('Ending call');
    
    if (this.callTimer) {
      clearTimeout(this.callTimer);
      this.callTimer = null;
    }
    
    this.isConnected = false;
    this.isMuted = false;
    
    if (this.sound) {
      this.sound.unloadAsync();
      this.sound = null;
    }
    
    this.updateCallState();
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    console.log('Mute toggled:', this.isMuted);
    this.updateCallState();
  }

  // Toggle speaker
  toggleSpeaker() {
    console.log('Speaker toggled');
    this.updateCallState();
  }

  private updateCallState() {
    if (this.onCallStateChange) {
      this.onCallStateChange({
        isConnected: this.isConnected,
        isIncoming: false,
        isOutgoing: false,
        isMuted: this.isMuted,
        isSpeakerOn: false,
        remoteStream: null,
        localStream: null,
      });
    }
  }

  // Set callback for call state changes
  setCallStateCallback(callback: (state: CallState) => void) {
    this.onCallStateChange = callback;
  }

  // Get current call state
  getCallState(): CallState {
    return {
      isConnected: this.isConnected,
      isIncoming: false,
      isOutgoing: false,
      isMuted: this.isMuted,
      isSpeakerOn: false,
      remoteStream: null,
      localStream: null,
    };
  }

  // Simulate incoming call
  simulateIncomingCall(fromUserId: string) {
    console.log(`Incoming call from ${fromUserId}`);
    
    // This would trigger the incoming call UI
    // You can implement this based on your app's notification system
  }

  // Cleanup
  cleanup() {
    this.endCall();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const callService = new CallService();
export default callService;
