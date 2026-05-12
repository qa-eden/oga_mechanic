import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  MapPinIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from 'react-native-heroicons/outline';

interface BottomActionButtonsProps {
  status: string;
  request: any;
  openActionConfirmation: (action: any) => void;
  setCancelModalVisible: (visible: boolean) => void;
  setOtpModalVisible: (visible: boolean) => void;
  acceptRequestMutation: any;
  declineRequestMutation: any;
  updateStatusMutation: any;
  cancelRequestMutation: any;
}

const BottomActionButtons: React.FC<BottomActionButtonsProps> = ({
  status,
  request,
  openActionConfirmation,
  setCancelModalVisible,
  setOtpModalVisible,
  acceptRequestMutation,
  declineRequestMutation,
  updateStatusMutation,
  cancelRequestMutation,
}) => {
  const insets = useSafeAreaInsets();

  if (status === 'completed' || status === 'verify_completed' || status === 'cancelled' || status === 'declined') {
    return null;
  }

  return (
    <View 
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-6 shadow-lg"
    >
      <View className="flex-row items-center justify-between gap-3">
        {/* Pending: Accept and Decline */}
        {status === 'pending' && (
          <>
            <TouchableOpacity
              onPress={() => openActionConfirmation('accept')}
              disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-green-100 border border-green-600 rounded-[.4rem] py-3 ${
                acceptRequestMutation.isPending || declineRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <CheckCircleIcon size={18} color="#16A34A" />
              <Text className="text-green-700 font-NunitoSemiBold ml-2">
                Accept
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openActionConfirmation('decline')}
              disabled={acceptRequestMutation.isPending || declineRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                acceptRequestMutation.isPending || declineRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <XCircleIcon size={18} color="#DC2626" />
              <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                Decline
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Accepted: In Transit and Cancel */}
        {status === 'accepted' && (
          <>
            <TouchableOpacity
              onPress={() => openActionConfirmation('in_transit')}
              disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-blue-100 border border-blue-600 rounded-[.4rem] py-3 ${
                updateStatusMutation.isPending || cancelRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <TruckIcon size={18} color="#1D4ED8" />
              <Text className="text-blue-700 font-NunitoSemiBold ml-2">
                Start Transit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                updateStatusMutation.isPending || cancelRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <XCircleIcon size={18} color="#DC2626" />
              <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                Cancel Job
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* In Transit: Confirm Arrival and Cancel */}
        {status === 'in_transit' && (
          <>
            <TouchableOpacity
              onPress={() => openActionConfirmation('arrived')}
              disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-purple-100 border border-purple-600 rounded-[.4rem] py-3 ${
                updateStatusMutation.isPending || cancelRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <MapPinIcon size={18} color="#7C3AED" />
              <Text className="text-purple-700 font-NunitoSemiBold ml-2">
                Confirm Arrival
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                updateStatusMutation.isPending || cancelRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <XCircleIcon size={18} color="#DC2626" />
              <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                Cancel Job
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Arrived: Verify OTP, then Start Work and Cancel */}
        {status === 'arrived' && (
          <>
            {!request?.is_otp_verified ? (
              <TouchableOpacity
                onPress={() => setOtpModalVisible(true)}
                disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                className={`flex-1 flex-row items-center justify-center bg-green-50 border border-green-600 rounded-[.4rem] py-3 ${
                  updateStatusMutation.isPending || cancelRequestMutation.isPending
                    ? 'opacity-50'
                    : ''
                }`}
              >
                <ShieldCheckIcon size={18} color="#16A34A" />
                <Text className="text-green-700 font-NunitoSemiBold ml-2">
                  Verify Arrival
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => openActionConfirmation('in_progress')}
                disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
                className={`flex-1 flex-row items-center justify-center bg-green-100 border border-green-600 rounded-[.4rem] py-3 ${
                  updateStatusMutation.isPending || cancelRequestMutation.isPending
                    ? 'opacity-50'
                    : ''
                }`}
              >
                <WrenchScrewdriverIcon size={18} color="#16A34A" />
                <Text className="text-green-700 font-NunitoSemiBold ml-2">
                  Start Work
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              disabled={updateStatusMutation.isPending || cancelRequestMutation.isPending}
              className={`flex-1 flex-row items-center justify-center bg-red-100 border border-[#E10000] rounded-[.4rem] py-3 ${
                updateStatusMutation.isPending || cancelRequestMutation.isPending
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <XCircleIcon size={18} color="#DC2626" />
              <Text className="text-[#E10000] font-NunitoSemiBold ml-2">
                Cancel Job
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* In Progress: Complete */}
        {status === 'in_progress' && (
          <TouchableOpacity
            onPress={() => openActionConfirmation('completed')}
            disabled={updateStatusMutation.isPending}
            className={`flex-1 flex-row items-center justify-center bg-green-100 border border-[#00984C] rounded-[.4rem] py-3 ${
              updateStatusMutation.isPending ? 'opacity-50' : ''
            }`}
          >
            <CheckCircleIcon size={18} color="#16A34A" />
            <Text className="text-green-700 font-NunitoSemiBold ml-2">
              Job Completed
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BottomActionButtons;
