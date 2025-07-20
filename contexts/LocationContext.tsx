import React, { createContext, useContext, useReducer } from 'react';

// Types
export interface LocationData {
  name: string;
  address: string;
}

interface LocationState {
  fromLocation: LocationData;
  toLocation: LocationData;
}

type LocationAction =
  | { type: 'SET_FROM_LOCATION'; payload: LocationData }
  | { type: 'SET_TO_LOCATION'; payload: LocationData }
  | { type: 'CLEAR_LOCATIONS' };

interface LocationContextType {
  state: LocationState;
  setFromLocation: (location: LocationData) => void;
  setToLocation: (location: LocationData) => void;
  clearLocations: () => void;
}

// Initial state
const initialState: LocationState = {
  fromLocation: {
    name: "",
    address: ""
  },
  toLocation: {
    name: "",
    address: ""
  }
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