import React, { createContext, useContext, useReducer } from 'react';

// Types
export interface LocationData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

interface LocationState {
  fromLocation: LocationData;
  toLocation: LocationData;
  isScheduling: boolean;
}

type LocationAction =
  | { type: 'SET_FROM_LOCATION'; payload: LocationData }
  | { type: 'SET_TO_LOCATION'; payload: LocationData }
  | { type: 'CLEAR_LOCATIONS' }
  | { type: 'SET_IS_SCHEDULING'; payload: boolean };

interface LocationContextType {
  state: LocationState;
  setFromLocation: (location: LocationData) => void;
  setToLocation: (location: LocationData) => void;
  clearLocations: () => void;
  isScheduling: boolean;
  setIsScheduling: (isScheduling: boolean) => void;
}

// Initial state
const initialState: LocationState = {
  fromLocation: {
    name: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    placeId: undefined,
  },
  toLocation: {
    name: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    placeId: undefined,
  },
  isScheduling: false,
};

// Reducer
const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_FROM_LOCATION':
      return {
        ...state,
        fromLocation: action.payload
      };
    
    case 'SET_TO_LOCATION':
      return {
        ...state,
        toLocation: action.payload
      };
    
    case 'CLEAR_LOCATIONS':
      return initialState;

    case 'SET_IS_SCHEDULING':
      return {
        ...state,
        isScheduling: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  const setFromLocation = (location: LocationData) => {
    dispatch({ type: 'SET_FROM_LOCATION', payload: location });
  };

  const setToLocation = (location: LocationData) => {
    dispatch({ type: 'SET_TO_LOCATION', payload: location });
  };

  const clearLocations = () => {
    dispatch({ type: 'CLEAR_LOCATIONS' });
  };

  const value: LocationContextType = {
    state,
    setFromLocation,
    setToLocation,
    clearLocations,
    isScheduling: state.isScheduling,
    setIsScheduling: (isScheduling: boolean) => dispatch({ type: 'SET_IS_SCHEDULING', payload: isScheduling }),
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use location context
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 