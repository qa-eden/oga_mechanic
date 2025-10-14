import { useMemo } from 'react';

export interface ErrorInfo {
  type: 'network' | 'timeout' | 'auth' | 'server' | 'notFound' | 'unknown';
  title: string;
  message: string;
  icon: string;
  actionText: string;
  canRetry: boolean;
}

export const useErrorHandler = () => {
  const parseError = (error: any): ErrorInfo => {
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';
    const statusCode = error?.response?.status;

    if (errorCode === 'NETWORK_ERROR' || errorMessage.includes('Network Error')) {
      return {
        type: 'network',
        title: 'Network Connection Error',
        message: 'Please check your internet connection or the API server might be down',
        icon: '🌐',
        actionText: 'Check Connection',
        canRetry: true,
      };
    }

    if (errorCode === 'ECONNABORTED' || errorMessage.includes('timeout')) {
      return {
        type: 'timeout',
        title: 'Request Timeout',
        message: 'The server is taking too long to respond. Please try again.',
        icon: '⏱️',
        actionText: 'Try Again',
        canRetry: true,
      };
    }

    if (statusCode === 401 || statusCode === 403) {
      return {
        type: 'auth',
        title: 'Authentication Error',
        message: 'Please try logging in again',
        icon: '🔐',
        actionText: 'Login Again',
        canRetry: false,
      };
    }

    if (statusCode === 404) {
      return {
        type: 'notFound',
        title: 'Not Found',
        message: 'The requested resource was not found',
        icon: '🔍',
        actionText: 'Go Back',
        canRetry: false,
      };
    }

    if (statusCode >= 500) {
      return {
        type: 'server',
        title: 'Server Error',
        message: 'The server is experiencing issues. Please try again later.',
        icon: '🔥',
        actionText: 'Try Again',
        canRetry: true,
      };
    }

    return {
      type: 'unknown',
      title: 'Something went wrong',
      message: errorMessage || 'An unexpected error occurred',
      icon: '❌',
      actionText: 'Try Again',
      canRetry: true,
    };
  };

  const getErrorSeverity = (errorType: ErrorInfo['type']): 'low' | 'medium' | 'high' => {
    switch (errorType) {
      case 'network':
      case 'timeout':
        return 'high';
      case 'auth':
        return 'medium';
      case 'server':
        return 'high';
      case 'notFound':
        return 'low';
      default:
        return 'medium';
    }
  };

  const shouldShowTroubleshooting = (errorType: ErrorInfo['type']): boolean => {
    return ['network', 'timeout', 'server'].includes(errorType);
  };

  return {
    parseError,
    getErrorSeverity,
    shouldShowTroubleshooting,
  };
};

export default useErrorHandler;
