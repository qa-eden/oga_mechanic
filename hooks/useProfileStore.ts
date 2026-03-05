import { create } from 'zustand';

interface ProfileState {
  isProfileComplete: boolean;
  setIsProfileComplete: (status: boolean) => void;
  isLoading: boolean;
  setIsLoading: (status: boolean) => void;
  isNewSwitch: boolean;
  setIsNewSwitch: (status: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isProfileComplete: true, // Default to true to be non-blocking initially
  setIsProfileComplete: (status) => set({ isProfileComplete: status }),
  isLoading: false,
  setIsLoading: (status) => set({ isLoading: status }),
  isNewSwitch: false,
  setIsNewSwitch: (status) => set({ isNewSwitch: status }),
}));
