import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WifiIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import { performAPIHealthCheck, performConnectivityTest, logAPIConfiguration, HealthCheckResult } from '@/lib/utils/apiHealthCheck';

interface ConnectionStatusProps {
  onStatusChange?: (isHealthy: boolean) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onStatusChange }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<HealthCheckResult | null>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      // Log API configuration for debugging
      logAPIConfiguration();
      
      // First try a simple connectivity test
      console.log('🔌 Starting connectivity test...');
      const connectivityResult = await performConnectivityTest();
      
      if (connectivityResult.isHealthy) {
        // If connectivity is good, try the full health check
        console.log('✅ Connectivity OK, running full health check...');
        const healthResult = await performAPIHealthCheck();
        setLastCheck(healthResult);
        onStatusChange?.(healthResult.isHealthy);
      } else {
        // If connectivity fails, don't bother with health check
        console.log('❌ Connectivity failed, skipping health check');
        setLastCheck(connectivityResult);
        onStatusChange?.(false);
      }
    } catch (error) {
      console.error('❌ Health check error:', error);
      const errorResult: HealthCheckResult = {
        isHealthy: false,
        responseTime: 0,
        error: 'Health check failed',
        timestamp: new Date(),
      };
      setLastCheck(errorResult);
      onStatusChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    if (!lastCheck) return 'text-gray-500';
    return lastCheck.isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (!lastCheck) return 'bg-gray-50 border-gray-200';
    return lastCheck.isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking connection...';
    if (!lastCheck) return 'Connection status unknown';
    
    if (lastCheck.isHealthy) {
      return `Connected (${lastCheck.responseTime}ms)`;
    } else {
      return lastCheck.error || 'Connection failed';
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <ActivityIndicator size="small" color="#6B7280" />;
    }
    
    if (!lastCheck || !lastCheck.isHealthy) {
      return <ExclamationTriangleIcon size={20} color="#EF4444" />;
    }
    
    return <WifiIcon size={20} color="#10B981" />;
  };

  return (
    <View className={`rounded-xl p-4 border ${getStatusBgColor()}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          {getStatusIcon()}
          <Text className={`ml-2 font-NunitoBold ${getStatusColor()}`}>
            API Connection
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={runHealthCheck}
          disabled={isChecking}
          className={`px-3 py-1 rounded-lg ${
            isChecking ? 'bg-gray-200' : 'bg-blue-500'
          }`}
        >
          <Text className={`text-sm font-NunitoBold ${
            isChecking ? 'text-gray-500' : 'text-white'
          }`}>
            {isChecking ? 'Testing...' : 'Test'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text className={`text-sm font-NunitoMedium ${getStatusColor()}`}>
        {getStatusText()}
      </Text>
      
      {lastCheck && (
        <Text className="text-xs text-gray-400 font-NunitoRegular mt-1">
          Last checked: {lastCheck.timestamp.toLocaleTimeString()}
        </Text>
      )}
      
      {lastCheck && !lastCheck.isHealthy && lastCheck.error && (
        <View className="mt-2 p-2 bg-red-100 rounded-lg">
          <Text className="text-red-700 text-xs font-NunitoMedium">
            Error Details:
          </Text>
          <Text className="text-red-600 text-xs font-NunitoRegular">
            {lastCheck.error}
          </Text>
          {lastCheck.status && (
            <Text className="text-red-600 text-xs font-NunitoRegular">
              HTTP Status: {lastCheck.status}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ConnectionStatus;
