import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ErrorDisplay from './ErrorDisplay';
import ConnectionStatus from './ConnectionStatus';
import TroubleshootingGuide from './TroubleshootingGuide';

interface ErrorBoundaryProps {
  error?: any;
  isLoading?: boolean;
  onRetry?: () => void;
  showConnectionStatus?: boolean;
  showTroubleshooting?: boolean;
  compact?: boolean;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  isLoading = false,
  onRetry,
  showConnectionStatus = true,
  showTroubleshooting = true,
  compact = false,
  children,
  fallback,
  className = '',
}) => {
  const { parseError, shouldShowTroubleshooting } = useErrorHandler();

  // If no error and not loading, render children
  if (!error && !isLoading) {
    return <>{children}</>;
  }

  // If loading, don't show error
  if (isLoading) {
    return <>{children}</>;
  }

  // If error exists, show error handling UI
  if (error) {
    const errorInfo = parseError(error);
    const showTroubleshootingGuide = showTroubleshooting && shouldShowTroubleshooting(errorInfo.type);

    // If fallback is provided, use it
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View className={`space-y-4 ${className}`}>
        {/* Connection Status - only for network/timeout errors */}
        {showConnectionStatus && (errorInfo.type === 'network' || errorInfo.type === 'timeout') && (
          <ConnectionStatus
            onStatusChange={(isHealthy) => {
              // Connection status changed
            }}
          />
        )}

        {/* Main Error Display */}
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          onAction={showTroubleshootingGuide ? undefined : onRetry}
          showDetails={!compact}
          compact={compact}
        />

        {/* Troubleshooting Guide - only for network/timeout/server errors */}
        {showTroubleshootingGuide && (
          <TroubleshootingGuide />
        )}
      </View>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
