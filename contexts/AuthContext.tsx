import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userData: any;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  shouldNavigate: boolean;
  navigationTarget: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  // No need for separate loading screen - splash screen handles it
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
