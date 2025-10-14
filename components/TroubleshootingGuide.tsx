import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon, WifiIcon, ServerIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import { ENV_CONFIG } from '@/config/env';

interface TroubleshootingStep {
  title: string;
  description: string;
  action?: string;
}

const TroubleshootingGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const troubleshootingSteps: TroubleshootingStep[] = [
    {
      title: "Check Your Internet Connection",
      description: "Make sure you're connected to WiFi or mobile data and can access other websites/apps.",
      action: "Try opening a web browser and visiting any website"
    },
    {
      title: "Verify API Server Status",
      description: "The API server might be temporarily down or unreachable.",
      action: "Wait a few minutes and try again, or contact support"
    },
    {
      title: "Check API Configuration",
      description: `Current API URL: ${ENV_CONFIG.API_URL}`,
      action: "If this looks incorrect, contact your developer"
    },
    {
      title: "Clear App Cache",
      description: "Sometimes cached data can cause connection issues.",
      action: "Close and reopen the app, or restart your device"
    },
    {
      title: "Try Again Later",
      description: "If the server is experiencing high traffic, try again in a few minutes.",
      action: "Use the 'Retry' buttons or pull-to-refresh"
    }
  ];

  const getStatusInfo = () => {
    return {
      apiUrl: ENV_CONFIG.API_URL,
      hasApiKey: !!ENV_CONFIG.API_KEY,
      environment: ENV_CONFIG.ENV,
      timestamp: new Date().toLocaleString(),
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <ExclamationTriangleIcon size={20} color="#F59E0B" />
          <Text className="text-yellow-800 font-NunitoBold ml-2">
            Connection Troubleshooting
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUpIcon size={20} color="#F59E0B" />
        ) : (
          <ChevronDownIcon size={20} color="#F59E0B" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="mt-4">
          <Text className="text-yellow-700 font-NunitoMedium mb-4">
            If you're experiencing connection issues, try these steps:
          </Text>

          <ScrollView className="max-h-64">
            {troubleshootingSteps.map((step, index) => (
              <View key={index} className="mb-4 p-3 bg-white rounded-lg border border-yellow-100">
                <Text className="text-gray-900 font-NunitoBold mb-1">
                  {index + 1}. {step.title}
                </Text>
                <Text className="text-gray-700 font-NunitoMedium text-sm mb-2">
                  {step.description}
                </Text>
                {step.action && (
                  <Text className="text-blue-600 font-NunitoMedium text-sm italic">
                    💡 {step.action}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Technical Information */}
          <View className="mt-4 p-3 bg-gray-100 rounded-lg">
            <Text className="text-gray-800 font-NunitoBold mb-2">
              Technical Information:
            </Text>
            <View className="space-y-1">
              <View className="flex-row items-center">
                <ServerIcon size={16} color="#6B7280" />
                <Text className="text-gray-600 font-NunitoMedium text-sm ml-2">
                  API URL: {statusInfo.apiUrl}
                </Text>
              </View>
              <View className="flex-row items-center">
                <WifiIcon size={16} color="#6B7280" />
                <Text className="text-gray-600 font-NunitoMedium text-sm ml-2">
                  API Key: {statusInfo.hasApiKey ? 'Present' : 'Missing'}
                </Text>
              </View>
              <Text className="text-gray-500 font-NunitoRegular text-xs">
                Environment: {statusInfo.environment} | Checked: {statusInfo.timestamp}
              </Text>
            </View>
          </View>

          {/* Common Error Messages */}
          <View className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <Text className="text-red-800 font-NunitoBold mb-2">
              Common Error Messages:
            </Text>
            <View className="space-y-2">
              <View>
                <Text className="text-red-700 font-NunitoMedium text-sm">
                  "Network Error" or "Connection Error"
                </Text>
                <Text className="text-red-600 font-NunitoRegular text-xs">
                  → Check your internet connection
                </Text>
              </View>
              <View>
                <Text className="text-red-700 font-NunitoMedium text-sm">
                  "Request timeout"
                </Text>
                <Text className="text-red-600 font-NunitoRegular text-xs">
                  → Server is slow or unreachable
                </Text>
              </View>
              <View>
                <Text className="text-red-700 font-NunitoMedium text-sm">
                  "Authentication error"
                </Text>
                <Text className="text-red-600 font-NunitoRegular text-xs">
                  → Try logging out and back in
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default TroubleshootingGuide;
