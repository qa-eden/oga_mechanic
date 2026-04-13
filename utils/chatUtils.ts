// Shared types and helpers for chat screens

export interface Message {
  id: string | number;
  text: string;
  isSent: boolean;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isTyping?: boolean;
  isVoiceMessage?: boolean;
  voiceDuration?: number;
  voiceUri?: string;
  fileUrl?: string;
  messageType?: string;
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 