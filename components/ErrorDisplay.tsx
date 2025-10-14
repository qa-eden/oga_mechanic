import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useErrorHandler, ErrorInfo } from '@/hooks/useErrorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onAction?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onAction,
  showDetails = false,
  compact = false,
  className = '',
}) => {
  const { parseError } = useErrorHandler();
  const errorInfo: ErrorInfo = parseError(error);

  const getContainerStyle = () => {
    const baseStyle = 'rounded-xl p-4 border';
    
    switch (errorInfo.type) {
      case 'network':
      case 'timeout':
        return `${baseStyle} bg-red-50 border-red-200`;
      case 'auth':
        return `${baseStyle} bg-yellow-50 border-yellow-200`;
      case 'server':
        return `${baseStyle} bg-orange-50 border-orange-200`;
      case 'notFound':
        return `${baseStyle} bg-blue-50 border-blue-200`;
      default:
        return `${baseStyle} bg-gray-50 border-gray-200`;
    }
  };

  const getTextColor = () => {
    switch (errorInfo.type) {
      case 'network':
      case 'timeout':
        return 'text-red-800';
      case 'auth':
        return 'text-yellow-800';
      case 'server':
        return 'text-orange-800';
      case 'notFound':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getButtonColor = () => {
    switch (errorInfo.type) {
      case 'network':
      case 'timeout':
        return 'bg-red-600';
      case 'auth':
        return 'bg-yellow-600';
      case 'server':
        return 'bg-orange-600';
      case 'notFound':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (compact) {
    return (
      <View className={`${getContainerStyle()} ${className}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Text className="text-lg mr-2">{errorInfo.icon}</Text>
            <View className="flex-1">
              <Text className={`font-NunitoBold ${getTextColor()}`}>
                {errorInfo.title}
              </Text>
              <Text className={`font-NunitoMedium text-sm ${getTextColor().replace('800', '600')}`}>
                {errorInfo.message}
              </Text>
            </View>
          </View>
          
          {(errorInfo.canRetry && onRetry) && (
            <TouchableOpacity
              onPress={onRetry}
              className={`px-3 py-1 rounded-lg ${getButtonColor()}`}
            >
              <Text className="text-white font-NunitoBold text-sm">
                Retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className={`${getContainerStyle()} ${className}`}>
      <View className="items-center">
        <Text className="text-3xl mb-2">{errorInfo.icon}</Text>
        <Text className={`font-NunitoBold text-lg mb-2 text-center ${getTextColor()}`}>
          {errorInfo.title}
        </Text>
        <Text className={`font-NunitoMedium text-center mb-4 ${getTextColor().replace('800', '600')}`}>
          {errorInfo.message}
        </Text>

        {showDetails && error && (
          <View className="w-full p-3 bg-white rounded-lg border border-gray-200 mb-4">
            <Text className="text-gray-800 font-NunitoBold text-sm mb-1">
              Technical Details:
            </Text>
            <Text className="text-gray-600 font-NunitoRegular text-xs">
              {error?.message || 'No additional details available'}
            </Text>
            {error?.response?.status && (
              <Text className="text-gray-600 font-NunitoRegular text-xs">
                Status Code: {error.response.status}
              </Text>
            )}
            {error?.code && (
              <Text className="text-gray-600 font-NunitoRegular text-xs">
                Error Code: {error.code}
              </Text>
            )}
          </View>
        )}

        <View className="flex-row space-x-3">
          {errorInfo.canRetry && onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              className={`px-6 py-3 rounded-xl ${getButtonColor()}`}
            >
              <Text className="text-white font-NunitoBold">
                {errorInfo.actionText}
              </Text>
            </TouchableOpacity>
          )}
          
          {onAction && (
            <TouchableOpacity
              onPress={onAction}
              className="px-6 py-3 rounded-xl bg-gray-600"
            >
              <Text className="text-white font-NunitoBold">
                {errorInfo.canRetry ? 'Help' : errorInfo.actionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default ErrorDisplay;
