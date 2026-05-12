import React from 'react';
import { View, Text, Modal } from 'react-native';
import CustomButton from '@/components/CustomButton';
import {
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';

export type MechanicActionType = 'accept' | 'decline' | 'in_transit' | 'arrived' | 'in_progress' | 'completed';

interface MechanicActionConfirmationModalProps {
  visible: boolean;
  actionType: MechanicActionType | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getActionConfig = (actionType: MechanicActionType | null) => {
  switch (actionType) {
    case 'accept':
      return {
        title: 'Accept Request',
        message: 'Are you sure you want to accept this repair request? You will be responsible for completing this job.',
        icon: CheckCircleIcon,
        iconColor: '#16A34A',
        iconBgColor: 'bg-green-100',
        confirmText: 'Yes, Accept',
        confirmBgVariant: 'success' as const,
      };
    case 'decline':
      return {
        title: 'Decline Request',
        message: 'Are you sure you want to decline this repair request? This action cannot be undone.',
        icon: XCircleIcon,
        iconColor: '#DC2626',
        iconBgColor: 'bg-red-100',
        confirmText: 'Yes, Decline',
        confirmBgVariant: 'secondary' as const,
      };
    case 'in_transit':
      return {
        title: 'Start Transit',
        message: 'Are you sure you want to mark this job as "In Transit"? This means you are on your way to the customer.',
        icon: TruckIcon,
        iconColor: '#2563EB',
        iconBgColor: 'bg-blue-100',
        confirmText: 'Yes, Start Transit',
        confirmBgVariant: 'success' as const,
      };
    case 'arrived':
      return {
        title: 'Confirm Arrival',
        message: 'Are you sure you want to mark this job as "Arrived"? This confirms you have reached the customer location.',
        icon: MapPinIcon,
        iconColor: '#7C3AED',
        iconBgColor: 'bg-purple-100',
        confirmText: 'Yes, I Have Arrived',
        confirmBgVariant: 'success' as const,
      };
    case 'in_progress':
      return {
        title: 'Start Work',
        message: 'Are you sure you want to mark this job as "In Progress"? This means you have started working on the repair.',
        icon: WrenchScrewdriverIcon,
        iconColor: '#EA580C',
        iconBgColor: 'bg-orange-100',
        confirmText: 'Yes, Start Work',
        confirmBgVariant: 'success' as const,
      };
    case 'completed':
      return {
        title: 'Complete Job',
        message: 'Are you sure you want to mark this job as "Completed"? This action confirms the repair work is finished.',
        icon: CheckCircleIcon,
        iconColor: '#16A34A',
        iconBgColor: 'bg-green-100',
        confirmText: 'Yes, Job Completed',
        confirmBgVariant: 'success' as const,
      };
    default:
      return {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        icon: ClockIcon,
        iconColor: '#6B7280',
        iconBgColor: 'bg-gray-100',
        confirmText: 'Confirm',
        confirmBgVariant: 'success' as const,
      };
  }
};

const MechanicActionConfirmationModal: React.FC<MechanicActionConfirmationModalProps> = ({
  visible,
  actionType,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const config = getActionConfig(actionType);
  const IconComponent = config.icon;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className={`w-14 h-14 rounded-full items-center justify-center ${config.iconBgColor}`}>
              <IconComponent size={28} color={config.iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-NunitoBold text-center text-gray-800 mb-3">
            {config.title}
          </Text>

          {/* Message */}
          <Text className="text-gray-600 text-center mb-6 font-NunitoRegular leading-6">
            {config.message}
          </Text>

          {/* Buttons */}
          <View className="space-y-3">
            <CustomButton
              onPress={onConfirm}
              title={config.confirmText}
              bgVariant={config.confirmBgVariant}
              textVariant="default"
              loading={isLoading}
              loadingText="Processing"
              disabled={isLoading}
            />

            <CustomButton
              onPress={onCancel}
              title="Cancel"
              bgVariant="outline"
              textVariant="outline"
              className="mt-3"
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MechanicActionConfirmationModal;

