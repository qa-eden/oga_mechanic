import React from 'react';
import { View, Text } from 'react-native';
import MultiSelectField from '@/components/forms/MultiSelectField';
import TextArea from '@/components/forms/TextArea';
import AddressInput from '@/components/forms/AddressInput';
import { WrenchScrewdriverIcon } from 'react-native-heroicons/outline';

interface SelectOption {
  label: string;
  value: string;
}

interface ServiceDetailsFormProps {
  serviceTypes: string[];
  setServiceTypes: (value: string[]) => void;
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
  serviceTypes,
  setServiceTypes,
  problemDescription,
  setProblemDescription,
  serviceAddress,
  setServiceAddress,
  setServiceLatitude,
  setServiceLongitude,
  serviceTypeOptions,
}) => {
  return (
    <View className="mb-2">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100">
          <WrenchScrewdriverIcon size={20} color="#111827" />
        </View>
        <Text className="text-lg font-NunitoExtraBold text-gray-900">Service Info</Text>
      </View>

      {/* Service Type */}
      <View className="mb-2">
        <MultiSelectField
          name="serviceType"
          label="Service Category"
          placeholder="What do you need help with?"
          options={serviceTypeOptions}
          value={serviceTypes}
          onValueChange={setServiceTypes}
        />
      </View>

      {/* Service Address */}
      <View className="mb-2">
        <AddressInput
          label="Service Address"
          placeholder="Search for service location..."
          value={serviceAddress}
          onChangeText={(text) => setServiceAddress(text)}
          onLocationSelect={(location) => {
            setServiceAddress(location.address || location.name);
            setServiceLatitude(location.latitude);
            setServiceLongitude(location.longitude);
          }}
          required
          numberOfLines={1}
          multiline={false}
          showCurrentLocationButton
        />
      </View>

      {/* Problem Description */}
      <View className="mb-1">
        <TextArea
          label="Problem Description"
          placeholder="Tell us what's happening with your vehicle..."
          value={problemDescription}
          onChangeText={setProblemDescription}
          rows={4}
        />
      </View>
    </View>
  );
};