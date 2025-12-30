import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { XMarkIcon, ShoppingBagIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

interface OrderItemModalProps {
  visible: boolean;
  onClose: () => void;
  item: any;
}

const OrderItemModal = ({ visible, onClose, item }: OrderItemModalProps) => {
  if (!item || !item.product) return null;
  const { product } = item;

  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <View className="flex-row justify-between py-2 border-b border-gray-50 last:border-0">
      <Text className="text-gray-500 font-NunitoMedium text-sm">{label}</Text>
      <Text className="text-gray-900 font-NunitoBold text-sm max-w-[60%] text-right">{value}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end sm:justify-center">
        <Animated.View 
          entering={FadeInDown.duration(300)}
          className="bg-white rounded-t-3xl sm:rounded-3xl h-[85%] sm:h-[80%] w-full sm:w-[90%] sm:mx-auto overflow-hidden"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-white z-10">
             <Text className="text-lg font-NunitoExtraBold text-gray-900" numberOfLines={1}>
                Item Details
             </Text>
             <TouchableOpacity 
                onPress={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
             >
                <XMarkIcon size={20} color="#4B5563" />
             </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Image */}
            <View className="h-64 bg-gray-50 w-full items-center justify-center relative">
               {product.images && product.images.length > 0 ? (
                  <Image 
                    source={{ uri: product.images[0].image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
               ) : (
                  <ShoppingBagIcon size={64} color="#D1D5DB" />
               )}
               {/* Price Tag Overlay */}
               <View className="absolute bottom-4 right-4 bg-black/70 px-4 py-2 rounded-full backdrop-blur-md">
                   <Text className="text-white font-NunitoBold text-lg">
                     ₦{parseFloat(item.price)?.toLocaleString()}
                   </Text>
               </View>
            </View>

            <View className="p-5">
               {/* Title & Category */}
               <View className="mb-6">
                 {product.category?.name && (
                    <Text className="text-primary-600 font-NunitoBold text-xs uppercase tracking-wider mb-1">
                        {product.category.name}
                    </Text>
                 )}
                 <Text className="text-2xl font-NunitoExtraBold text-gray-900 leading-tight">
                    {product.name}
                 </Text>
               </View>

               {/* Key stats */}
               <View className="flex-row bg-gray-50 rounded-2xl p-4 mb-6 justify-between">
                   <View className="items-center flex-1 border-r border-gray-200">
                      <Text className="text-gray-500 text-xs font-NunitoMedium mb-1">Quantity</Text>
                      <Text className="text-xl font-NunitoExtraBold text-gray-900">{item.quantity}</Text>
                   </View>
                   <View className="items-center flex-1 border-r border-gray-200">
                      <Text className="text-gray-500 text-xs font-NunitoMedium mb-1">Condition</Text>
                      <Text className="text-lg font-NunitoBold text-gray-900 capitalize">{product.condition || 'N/A'}</Text>
                   </View>
                   <View className="items-center flex-1">
                      <Text className="text-gray-500 text-xs font-NunitoMedium mb-1">Total</Text>
                      <Text className="text-lg font-NunitoExtraBold text-primary-600">
                        ₦{(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </Text>
                   </View>
               </View>

               {/* Description */}
               <View className="mb-6">
                  <Text className="text-base font-NunitoBold text-gray-900 mb-2">Description</Text>
                  <Text className="text-gray-600 font-NunitoMedium leading-6">
                    {product.description || 'No description available for this product.'}
                  </Text>
               </View>

               {/* Specifications */}
               <View className="mb-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <Text className="text-base font-NunitoBold text-gray-900 mb-3">Specifications</Text>
                  {product.make && <InfoRow label="Make" value={product.make} />}
                  {product.model && <InfoRow label="Model" value={product.model} />}
                  {product.year && <InfoRow label="Year" value={product.year} />}
                  {product.part_number && <InfoRow label="Part Number" value={product.part_number} />}
                  {product.merchant_rating && (
                      <InfoRow label="Merchant Rating" value={`${product.merchant_rating} / 5.0`} />
                  )}
                  {product.stock !== undefined && (
                      <InfoRow label="Stock Status" value={product.stock > 0 ? `${product.stock} available` : 'Out of Stock'} />
                  )}
               </View>

               {/* Vehicle Compatibility */}
               {product.vehicle_compatibility && product.vehicle_compatibility.length > 0 && (
                   <View className="mb-6">
                      <Text className="text-base font-NunitoBold text-gray-900 mb-3">Vehicle Compatibility</Text>
                      <View className="bg-gray-50 rounded-2xl p-4">
                          {product.vehicle_compatibility.map((comp: any, index: number) => (
                             <View key={index} className="flex-row items-center mb-2 last:mb-0">
                                <View className="w-1.5 h-1.5 rounded-full bg-green-50 mr-2" />
                                <Text className="text-gray-700 font-NunitoBold">
                                   {comp.make_name} {comp.model_name} {comp.year ? `(${comp.year})` : ''}
                                </Text>
                             </View>
                          ))}
                      </View>
                   </View>
               )}
            </View>
          </ScrollView>

          {/* Footer - maybe a buy again button or similar? */}
          <View className="p-5 border-t border-gray-100 bg-white">
              <TouchableOpacity
                onPress={onClose}
                className="w-full py-3.5 bg-gray-900 rounded-xl items-center"
              >
                  <Text className="text-white font-NunitoBold text-base">Close</Text>
              </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default OrderItemModal;
