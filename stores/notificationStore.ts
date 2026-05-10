import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'chat';
  data?: any;
  timestamp: number;
}

interface NotificationState {
  isVisible: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'chat';
  data?: any;
  
  // History for the modal
  recentNotifications: NotificationItem[];
  isHistoryModalVisible: boolean;
  
  showNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error' | 'order' | 'chat', data?: any) => void;
  hideNotification: () => void;
  toggleHistoryModal: (visible: boolean) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isVisible: false,
  title: '',
  message: '',
  type: 'info',
  data: null,
  
  recentNotifications: [],
  isHistoryModalVisible: false,
  
  showNotification: (title, message, type = 'info', data = null) => {
    const newItem: NotificationItem = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      data,
      timestamp: Date.now(),
    };

    set((state) => {
      // Add to history (keep latest 20)
      const newHistory = [newItem, ...state.recentNotifications].slice(0, 20);
      return { 
        isVisible: true, 
        title, 
        message, 
        type, 
        data,
        recentNotifications: newHistory
      };
    });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      set((state) => {
        if (state.title === title && state.isVisible) {
          return { ...state, isVisible: false };
        }
        return state;
      });
    }, 8000);
  },
  
  hideNotification: () => set({ isVisible: false }),
  toggleHistoryModal: (visible) => set({ isHistoryModalVisible: visible, isVisible: false }), // Hide banner when opening modal
  clearHistory: () => set({ recentNotifications: [] }),
  removeHistoryItem: (id) => set((state) => ({ 
    recentNotifications: state.recentNotifications.filter(n => n.id !== id) 
  })),
}));
