import React from 'react';
import { View, Text, Modal, TouchableOpacity, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { XMarkIcon, CheckCircleIcon, NoSymbolIcon, UserIcon, ClockIcon } from 'react-native-heroicons/outline';
import CustomButton from '../CustomButton';
import { formatDistanceToNow } from 'date-fns';
import { NairaCurrency } from '@/utils/useCurrencyFormatter';

interface MerchantBidActionModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: (status: 'accepted' | 'rejected') => Promise<void>;
  isLoading: boolean;
  bid: any;
}

const MerchantBidActionModal: React.FC<MerchantBidActionModalProps> = ({ 
  visible, 
  onClose, 
  onAction, 
  isLoading: externalLoading, 
  bid 
}) => {
  const [pendingStatus, setPendingStatus] = React.useState<'accepted' | 'rejected' | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setPendingStatus(null);
      setIsSuccess(false);
    }
  }, [visible]);

  if (!bid) return null;

  const handleAction = async (status: 'accepted' | 'rejected') => {
    setPendingStatus(status);
    try {
      await onAction(status);
      setIsSuccess(true);
    } catch (error) {
      setPendingStatus(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={isSuccess ? undefined : onClose}>
        <View className="flex-1 justify-end bg-black/60">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-white rounded-t-[40px] p-6 shadow-2xl" style={{ paddingBottom: Platform.OS === 'ios' ? 50 : 30 }}>
              
              {isSuccess ? (
                <View className="py-10 items-center">
                  <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                    <CheckCircleIcon size={60} color="#16A34A" />
                  </View>
                  <Text className="text-2xl font-NunitoBold text-gray-900 text-center">
                    Bid {pendingStatus === 'accepted' ? 'Accepted' : 'Rejected'}!
                  </Text>
                  <Text className="text-gray-500 font-NunitoMedium text-center mt-3 px-10">
                    The offer from {bid.bidder?.first_name} has been {pendingStatus} successfully.
                  </Text>
                  
                  <CustomButton
                    title="Done"
                    onPress={onClose}
                    className="bg-primary-500 w-full mt-10"
                  />
                </View>
              ) : (
                <>
                  {/* Header */}
                  <View className="flex-row justify-between items-center mb-8">
                    <View>
                      <Text className="text-2xl font-NunitoBold text-gray-900">Manage Bid</Text>
                      <Text className="text-xs text-gray-400 font-NunitoMedium mt-1">Review offer and choose an action</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} disabled={externalLoading} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                      <XMarkIcon size={22} color="#1F2937" />
                    </TouchableOpacity>
                  </View>

                  {/* Bidder Profile */}
                  <View className="flex-row items-center bg-gray-50 rounded-3xl p-5 mb-6 border border-gray-100">
                    <View className="w-14 h-14 rounded-full bg-primary-100 items-center justify-center mr-4">
                      <Text className="text-primary-600 font-NunitoBold text-lg uppercase">
                        {bid.bidder?.first_name?.[0] || 'U'}{bid.bidder?.last_name?.[0] || 'S'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[18px] text-gray-900 font-NunitoBold">
                        {bid.bidder?.first_name} {bid.bidder?.last_name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <ClockIcon size={12} color="#9CA3AF" />
                        <Text className="text-[12px] text-gray-400 font-NunitoMedium ml-1">
                          {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Offer Amount Section */}
                  <View className="bg-primary-50/30 rounded-3xl p-6 mb-8 border border-primary-100/50">
                    <Text className="text-[12px] text-primary-600/70 font-NunitoBold uppercase tracking-widest mb-2 text-center">Bidding Offer</Text>
                    <View className="flex-row justify-center items-center">
                      <NairaCurrency
                        value={parseFloat(bid.amount)}
                        className="text-3xl font-NunitoExtraBold text-primary-600"
                      />
                    </View>
                    
                    <View className="flex-row justify-center mt-4">
                      <View className={`px-4 py-1.5 rounded-full flex-row items-center ${bid.status === 'pending' ? 'bg-yellow-100 border border-yellow-200' : bid.status === 'accepted' ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
                        <View className={`w-2 h-2 rounded-full mr-2 ${bid.status === 'pending' ? 'bg-yellow-500' : bid.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={`text-[12px] font-NunitoBold capitalize ${bid.status === 'pending' ? 'text-yellow-700' : bid.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
                          {bid.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="space-y-4">
                    <CustomButton
                      title="Accept Offer"
                      IconLeft={CheckCircleIcon}
                      onPress={() => handleAction('accepted')}
                      loading={externalLoading && pendingStatus === 'accepted'}
                      disabled={externalLoading || bid.status === 'accepted'}
                      className="bg-green-600 py-4"
                    />
                    
                    <View className="h-2" />

                    <CustomButton
                      title="Reject Offer"
                      IconLeft={NoSymbolIcon}
                      onPress={() => handleAction('rejected')}
                      loading={externalLoading && pendingStatus === 'rejected'}
                      disabled={externalLoading || bid.status === 'rejected'}
                      bgVariant="outline"
                      textVariant="outline"
                      className="border-gray-200 py-4"
                    />
                  </View>

                  <Text className="text-center text-gray-400 text-[11px] font-NunitoMedium mt-8 px-8">
                    Accepting an offer will notify the bidder and potentially lock the transaction. Review all terms before proceeding.
                  </Text>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MerchantBidActionModal;
