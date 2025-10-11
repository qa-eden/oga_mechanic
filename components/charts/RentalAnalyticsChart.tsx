import React from 'react';
import { View, Text } from 'react-native';
import { TruckIcon, ClockIcon, CurrencyDollarIcon } from 'react-native-heroicons/outline';

// Fallback icon component
const FallbackIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }} />
);

interface RentalAnalyticsChartProps {
  data: {
    total_rentals: number;
    active_rentals: number;
    pending_rentals: number;
    rental_revenue: number;
    avg_rental_duration: number;
    completion_rate: number;
  };
}

const RentalAnalyticsChart: React.FC<RentalAnalyticsChartProps> = ({ data }) => {
  // Add safety checks for data
  if (!data) {
    return null;
  }

  const metrics = [
    {
      title: 'Total Rentals',
      value: data.total_rentals || 0,
      icon: TruckIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Rentals',
      value: data.active_rentals || 0,
      icon: ClockIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Rentals',
      value: data.pending_rentals || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Rental Revenue',
      value: `₦${(data.rental_revenue || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const performanceMetrics = [
    {
      label: 'Completion Rate',
      value: `${(data.completion_rate || 0).toFixed(1)}%`,
      progress: (data.completion_rate || 0) / 100,
      color: 'bg-green-500',
    },
    {
      label: 'Avg Duration',
      value: `${data.avg_rental_duration || 0} days`,
      progress: Math.min((data.avg_rental_duration || 0) / 30, 1), // Assuming 30 days max
      color: 'bg-blue-500',
    },
  ];

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-NunitoBold text-gray-900">
            Rental Analytics
          </Text>
          <Text className="text-sm text-gray-500 font-NunitoMedium mt-1">
            Track your Rental Business
          </Text>
        </View>
        <View className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl items-center justify-center">
          {TruckIcon ? (
            <TruckIcon size={20} color="white" />
          ) : (
            <FallbackIcon size={20} color="white" />
          )}
        </View>
      </View>

      {/* Metrics Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {metrics.map((metric, index) => {
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
        {performanceMetrics.map((metric, index) => (
          <View key={index} className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-NunitoMedium text-gray-700">
                {metric.label}
              </Text>
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
        ))}
      </View>
    </View>
  );
};

export default RentalAnalyticsChart;
