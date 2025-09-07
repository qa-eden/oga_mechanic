import { useState, useCallback } from 'react';

/**
 * Reusable hook for pull-to-refresh functionality
 * 
 * @example
 * const { refreshControl } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetchData();
 *   }
 * });
 */
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  refreshControl: {
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    colors: string[];
    tintColor: string;
    title: string;
    titleColor: string;
  };
}

const usePullToRefresh = ({ 
  onRefresh: refreshFunction, 
  enabled = true 
}: UsePullToRefreshOptions): UsePullToRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!enabled) return;
    
    setIsRefreshing(true);
    try {
      await refreshFunction();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction, enabled]);

  return {
    isRefreshing,
    onRefresh,
    refreshControl: {
      refreshing: isRefreshing,
      onRefresh,
      colors: ['#D30309'], // Android
      tintColor: '#D30309', // iOS
      title: 'Pull to refresh',
      titleColor: '#666',
    },
  };
};

export { usePullToRefresh };
export default usePullToRefresh;
