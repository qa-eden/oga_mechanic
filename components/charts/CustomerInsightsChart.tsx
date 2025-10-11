import React from 'react';
import { View, Text } from 'react-native';
import { 
  UsersIcon, 
  UserGroupIcon, 
  BanknotesIcon, 
  ArrowUpIcon 
} from 'react-native-heroicons/outline';

// Fallback icon component
const FallbackIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }} />
);

interface CustomerInsightsChartProps {
  data: {
    unique_customers: number;
    repeat_customers: number;
    avg_order_value: number;
    retention_rate: number;
    repeat_customer_rate: number;
  };
}

const CustomerInsightsChart: React.FC<CustomerInsightsChartProps> = ({ data }) => {
  // Add safety checks for data
  if (!data) {
    return null;
  }

  const customerMetrics = [
    {
      title: 'Unique Customers',
      value: data.unique_customers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Repeat Customers',
      value: data.repeat_customers || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Average Order Value',
      value: `₦${(data.avg_order_value || 0).toLocaleString()}`,
      icon: BanknotesIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const performanceMetrics = [
    {
      label: 'Customer Retention Rate',
      value: `${(data.retention_rate || 0).toFixed(1)}%`,
      progress: (data.retention_rate || 0) / 100,
      color: 'bg-green-500',
      icon: ArrowUpIcon,
    },
    {
      label: 'Repeat Customer Rate',
      value: `${(data.repeat_customer_rate || 0).toFixed(1)}%`,
      progress: (data.repeat_customer_rate || 0) / 100,
      color: 'bg-blue-500',
      icon: UserGroupIcon,
    },
  ];

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-NunitoBold text-gray-900">
            Customer Performance
          </Text>
          <Text className="text-sm text-gray-500 font-NunitoMedium mt-1">
            Track your customer engagement
          </Text>
        </View>
        <View className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl items-center justify-center">
          {UsersIcon ? (
            <UsersIcon size={20} color="white" />
          ) : (
            <FallbackIcon size={20} color="white" />
          )}
        </View>
      </View>

      {/* Customer Metrics Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {customerMetrics.map((metric, index) => {
          const IconComponent = metric.icon || FallbackIcon;
          return (
            <View key={index} className="flex-1 min-w-[45%]">
              <View className={`${metric.bgColor} rounded-2xl p-4 shadow-sm`}>
                <View className="items-center">
                  <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mb-3">
                    <IconComponent size={20} color={metric.color.replace('bg-', '#')} />
                  </View>
                  <Text className={`text-xs font-NunitoMedium ${metric.textColor} text-center mb-2`}>
                    {metric.title}
                  </Text>
                  <Text className={`text-xl font-NunitoBold ${metric.textColor} text-center`}>
                    {metric.value}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Performance Metrics */}
      <View className="space-y-4">
        {performanceMetrics.map((metric, index) => {
          const IconComponent = metric.icon || FallbackIcon;
          return (
            <View key={index} className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-3">
                    <IconComponent size={16} color="#6B7280" />
                  </View>
                  <Text className="text-sm font-NunitoMedium text-gray-700">
                    {metric.label}
                  </Text>
                </View>
                <Text className="text-lg font-NunitoBold text-gray-900">
                  {metric.value}
                </Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-3">
                <View
                  className={`${metric.color} h-3 rounded-full shadow-sm`}
                  style={{ width: `${metric.progress * 100}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CustomerInsightsChart;
