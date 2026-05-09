import { create } from 'zustand';
import { mechanicAPI, CarDetails, Mechanic } from '../lib/api/mechanic';

interface MechanicState {
  // State
  mechanics: Mechanic[];
  selectedMechanic: Mechanic | null;
  loading: boolean;
  error: string | null;
  searchResults: Mechanic[];
  
  // Actions
  findMechanics: (carDetails: CarDetails) => Promise<void>;
  setSelectedMechanic: (mechanic: Mechanic | null) => void;
  setSearchResults: (mechanics: Mechanic[]) => void;
  clearError: () => void;
  clearSearchResults: () => void;
  getNearbyMechanics: (lat: number, lng: number, radius?: number) => Promise<void>;
  reset: () => void;
}

export const useMechanicStore = create<MechanicState>((set, get) => ({
  // Initial state
  mechanics: [],
  selectedMechanic: null,
  loading: false,
  error: null,
  searchResults: [],

  // Actions
  findMechanics: async (carDetails: CarDetails) => {
    try {
      set({ loading: true, error: null });
      
      const response = await mechanicAPI.findMechanic(carDetails);
      
      set({ 
        searchResults: response.mechanics,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to find mechanics',
        loading: false 
      });
    }
  },

  setSelectedMechanic: (mechanic: Mechanic | null) => {
    set({ selectedMechanic: mechanic });
  },

  setSearchResults: (mechanics: Mechanic[]) => {
    set({ searchResults: mechanics });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  getNearbyMechanics: async (lat: number, lng: number, radius: number = 10) => {
    try {
      set({ loading: true, error: null });
      
      const mechanics = await mechanicAPI.getNearbyMechanics(lat, lng, radius);
      
      set({ 
        mechanics,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to get nearby mechanics',
        loading: false 
      });
    }
  },
  
  reset: () => {
    set({
      mechanics: [],
      selectedMechanic: null,
      loading: false,
      error: null,
      searchResults: [],
    });
  },
}));
