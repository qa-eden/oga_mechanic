import React from 'react';
import { View, Text } from 'react-native';
import { StarIcon, CubeIcon, EyeIcon } from 'react-native-heroicons/outline';

// Fallback icon component
const FallbackIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }} />
);

interface ProductPerformanceChartProps {
  data: {
    products_with_reviews: number;
    avg_rating: number;
    top_performing_products: Array<{
      id: string;
      name: string;
      rating: number;
      review_count: number;
    }>;
    total_products: number;
  };
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ data }) => {
  // Add safety checks for data
  if (!data) {
    return null;
  }

  const productMetrics = [
    {
      title: 'Total Products',
      value: data.total_products || 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Products with Reviews',
      value: data.products_with_reviews || 0,
      icon: EyeIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Average Rating',
      value: (data.avg_rating || 0).toFixed(1),
      icon: StarIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const reviewRate = (data.total_products || 0) > 0 ? ((data.products_with_reviews || 0) / (data.total_products || 1)) * 100 : 0;

  const performanceMetrics = [
    {
      label: 'Review Rate',
      value: `${reviewRate.toFixed(1)}%`,
      progress: reviewRate / 100,
      color: 'bg-green-500',
      icon: EyeIcon,
    },
    {
      label: 'Average Rating',
      value: `${(data.avg_rating || 0).toFixed(1)}/5`,
      progress: (data.avg_rating || 0) / 5,
      color: 'bg-yellow-500',
      icon: StarIcon,
    },
  ];

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-NunitoBold text-gray-900">
            Product Performance
          </Text>
          <Text className="text-sm text-gray-500 font-NunitoMedium mt-1">
            Monitor your product success
          </Text>
        </View>
        <View className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl items-center justify-center">
          {CubeIcon ? (
            <CubeIcon size={20} color="white" />
          ) : (
            <FallbackIcon size={20} color="white" />
          )}
        </View>
      </View>

      {/* Product Metrics Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {productMetrics.map((metric, index) => {
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
      <View className="space-y-4 grid grid-cols-2 gap-4">
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

      {/* Top Performing Products */}
      {data.top_performing_products && data.top_performing_products.length > 0 && (
        <View className="mt-6 pt-6 border-t border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-NunitoBold text-gray-900">
              Top Performing Products
            </Text>
            <View className="bg-amber-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-NunitoMedium text-amber-700">
                {data.top_performing_products.length} products
              </Text>
            </View>
          </View>
          <View className="space-y-3">
            {data.top_performing_products.slice(0, 3).map((product, index) => (
              <View key={product.id || `product-${index}`} className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-NunitoBold text-gray-900 mb-1" numberOfLines={1}>
                      {product.name || 'Unknown Product'}
                    </Text>
                    <Text className="text-xs text-gray-500 font-NunitoMedium">
                      {product.review_count || 0} reviews
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
                    {StarIcon ? (
                      <StarIcon size={16} color="#F59E0B" />
                    ) : (
                      <FallbackIcon size={16} color="#F59E0B" />
                    )}
                    <Text className="text-sm font-NunitoBold text-gray-900 ml-2">
                      {(product.rating || 0).toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProductPerformanceChart;
