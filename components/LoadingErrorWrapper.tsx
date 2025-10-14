import React from 'react';
import { View } from 'react-native';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface LoadingErrorWrapperProps {
  isLoading: boolean;
  error?: any;
  onRetry?: () => void;
  loadingMessage?: string;
  loadingSubMessage?: string;
  showConnectionStatus?: boolean;
  showTroubleshooting?: boolean;
  compact?: boolean;
  children: React.ReactNode;
  emptyState?: React.ReactNode;
  isEmpty?: boolean;
  className?: string;
}

/**
 * A comprehensive wrapper component that handles loading, error, and empty states
 * Use this instead of manually handling loading/error states in every component
 */
const LoadingErrorWrapper: React.FC<LoadingErrorWrapperProps> = ({
  isLoading,
  error,
  onRetry,
  loadingMessage = "Loading...",
  loadingSubMessage = "Please wait while we fetch your data",
  showConnectionStatus = true,
  showTroubleshooting = true,
  compact = false,
  children,
  emptyState,
  isEmpty = false,
  className = '',
}) => {
  // Show loading state
  if (isLoading && !error) {
    return (
      <View className={`flex-1 ${className}`}>
        <LoadingSpinner
          message={loadingMessage}
          subMessage={loadingSubMessage}
          size="medium"
          logoSize={32}
        />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className={`flex-1 ${className}`}>
        <ErrorBoundary
          error={error}
          onRetry={onRetry}
          showConnectionStatus={showConnectionStatus}
          showTroubleshooting={showTroubleshooting}
          compact={compact}
        />
      </View>
    );
  }

  // Show empty state
  if (isEmpty && emptyState) {
    return (
      <View className={`flex-1 ${className}`}>
        {emptyState}
      </View>
    );
  }

  // Show content
  return (
    <View className={className}>
      {children}
    </View>
  );
};

export default LoadingErrorWrapper;
