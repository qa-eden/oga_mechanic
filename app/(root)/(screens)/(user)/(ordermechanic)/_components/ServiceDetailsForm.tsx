import React from 'react';
import { View, Text } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import TextArea from '@/components/forms/TextArea';
import AddressInput from '@/components/forms/AddressInput';
import { WrenchScrewdriverIcon } from 'react-native-heroicons/outline';

interface SelectOption {
  label: string;
  value: string;
}

interface ServiceDetailsFormProps {
  serviceType: string;
  setServiceType: (value: string) => void;
  problemDescription: string;
  setProblemDescription: (value: string) => void;
  serviceAddress: string;
  setServiceAddress: (value: string) => void;
  serviceLatitude: number | undefined;
  setServiceLatitude: (value: number | undefined) => void;
  serviceLongitude: number | undefined;
  setServiceLongitude: (value: number | undefined) => void;
  serviceTypeOptions: SelectOption[];
}

/**
 * Reusable component for service type, problem description, and address
 * Used in multiple places in the find-mechanic flow
 */
export const ServiceDetailsForm: React.FC<ServiceDetailsFormProps> = ({
  serviceType,
  setServiceType,
  problemDescription,
  setProblemDescription,
  serviceAddress,
  setServiceAddress,
  setServiceLatitude,
  setServiceLongitude,
  serviceTypeOptions,
}) => {
  return (
    <View className="mb-1">
      {/* Section Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 bg-primary-50 rounded-full items-center justify-center mr-3">
          <WrenchScrewdriverIcon size={18} color="#D30309" />
        </View>
        <Text className="text-base font-NunitoBold text-gray-900">Service Information</Text>
      </View>

      {/* Service Type */}
      <View className="mb-3">
        <SelectField
          name="serviceType"
          label="Service Type"
          placeholder="Select the service you need"
          options={serviceTypeOptions}
          value={serviceType}
          onValueChange={setServiceType}
        />
      </View>

      {/* Service Address */}
      <View className="mb-3">
        <AddressInput
          label="Service Location"
          placeholder="Where should the mechanic meet you?"
          value={serviceAddress}
          onChangeText={(text) => setServiceAddress(text)}
          onLocationSelect={(location) => {
            setServiceAddress(location.address || location.name);
            setServiceLatitude(location.latitude);
            setServiceLongitude(location.longitude);
          }}
          required
          numberOfLines={2}
          multiline={true}
          showCurrentLocationButton
        />
      </View>

      {/* Problem Description */}
      <View className="mb-1">
        <TextArea
          label="Problem Description"
          placeholder="Describe the issue with your vehicle in detail..."
          value={problemDescription}
          onChangeText={setProblemDescription}
          rows={4}
        />
      </View>
    </View>
  );
};
