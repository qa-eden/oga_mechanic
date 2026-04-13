import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { XMarkIcon, TagIcon, TrophyIcon, InformationCircleIcon } from 'react-native-heroicons/outline';
import CustomButton from '../CustomButton';

interface BidModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  isLoading: boolean;
  productName?: string;
  currentPrice?: number;
  highestBid?: number;
}

const BidModal: React.FC<BidModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit, 
  isLoading, 
  productName,
  currentPrice = 0,
  highestBid = 0
}) => {
  const [amount, setAmount] = useState('');

  // Reset the input when the modal opens
  useEffect(() => {
    if (visible) {
      setAmount('');
    }
  }, [visible]);

  const minRequiredBid = useMemo(() => {
    return currentPrice + 500; // Smallest increment from the starting price
  }, [currentPrice]);

  const handleAmountChange = (text: string) => {
    // Remove all non-numeric characters except decimal point
    const value = text.replace(/[^0-9.]/g, '');
    
    if (!value) {
      setAmount('');
      return;
    }
    
    // Only allow one decimal point
    const parts = value.split('.');
    if (parts.length > 2) return;
    
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    setAmount(parts.join('.'));
  };

  const handleSubmit = () => {
    const rawValue = amount.replace(/,/g, '');
    if (!rawValue || isNaN(Number(rawValue)) || Number(rawValue) < minRequiredBid) return;
    onSubmit(Number(rawValue));
  };

  const isInvalidAmount = useMemo(() => {
    const rawValue = amount.replace(/,/g, '');
    if (!rawValue) return false;
    return Number(rawValue) < minRequiredBid;
  }, [amount, minRequiredBid]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="bg-white rounded-t-[40px] p-6 shadow-2xl" style={{ paddingBottom: Platform.OS === 'ios' ? 50 : 30 }}>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-2xl font-NunitoBold text-gray-900">Place your bid</Text>
                  <Text className="text-xs text-gray-400 font-NunitoMedium mt-1">Enter an amount higher than the current bid</Text>
                </View>
                <TouchableOpacity onPress={onClose} disabled={isLoading} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <XMarkIcon size={22} color="#1F2937" />
                </TouchableOpacity>
              </View>

              {/* Product Info */}
              <View className="bg-gray-50 rounded-3xl p-4 mb-6 border border-gray-100">
                <Text className="text-gray-400 text-xs font-NunitoBold uppercase tracking-widest mb-2">Item being bid on</Text>
                <Text className="text-[16px] text-gray-900 font-NunitoBold leading-5">
                  {productName || 'Bidding Item'}
                </Text>
              </View>

              {/* Stats Section */}
              <View className="flex-row justify-between mb-8">
                <View className="flex-1 mr-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <View className="flex-row items-center mb-1">
                    <TagIcon size={14} color="#9CA3AF" />
                    <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase tracking-widest ml-1.5">Starting Price</Text>
                  </View>
                  <Text className="text-base text-gray-900 font-NunitoExtraBold">₦{currentPrice.toLocaleString()}</Text>
                </View>

                <View className="flex-1 bg-primary-50/30 rounded-2xl p-4 border border-primary-100/50">
                  <View className="flex-row items-center mb-1">
                    <TrophyIcon size={14} color="#D30309" />
                    <Text className="text-[10px] text-primary-600/70 font-NunitoBold uppercase tracking-widest ml-1.5">Highest Bid</Text>
                  </View>
                  <Text className="text-base text-primary-600 font-NunitoExtraBold">
                    {highestBid > 0 ? `₦${highestBid.toLocaleString()}` : 'No bids yet'}
                  </Text>
                </View>
              </View>

              {/* Bid Input Label */}
              <View className="flex-row justify-between items-end mb-2 px-1">
                <Text className="text-sm font-NunitoBold text-gray-700">Your Bid Amount</Text>
                <Text className="text-[11px] font-NunitoBold text-gray-400">Min. req: ₦{minRequiredBid.toLocaleString()}</Text>
              </View>

              {/* Price Input Area */}
              <View className={`flex-row items-center rounded-2xl px-5 py-4 mb-8 border-2 ${isInvalidAmount ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50'}`}>
                <Text className={`text-2xl font-NunitoBold mr-3 ${isInvalidAmount ? 'text-red-500' : 'text-gray-400'}`}>₦</Text>
                <TextInput
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className={`flex-1 text-2xl font-NunitoBold ${isInvalidAmount ? 'text-red-600' : 'text-gray-900'}`}
                  editable={!isLoading}
                />
              </View>

              {isInvalidAmount && (
                <View className="flex-row items-center mb-6 px-1">
                  <InformationCircleIcon size={16} color="#EF4444" />
                  <Text className="text-xs text-red-500 font-NunitoMedium ml-2">Your bid must be at least ₦{minRequiredBid.toLocaleString()}</Text>
                </View>
              )}

              <CustomButton
                title="Confirm and Place Bid"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading || !amount || isInvalidAmount}
                className="bg-primary-500 py-4"
                // textClassName="text-lg font-NunitoBold"
              />

              <Text className="text-center text-gray-400 text-[11px] font-NunitoMedium mt-6 px-10">
                By placing this bid, you agree to the auction terms and conditions.
              </Text>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BidModal;
