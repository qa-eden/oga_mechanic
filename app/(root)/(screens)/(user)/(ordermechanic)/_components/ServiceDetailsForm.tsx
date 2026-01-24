import React from 'react';
import { View } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import InputField from '@/components/InputField';
import TextArea from '@/components/forms/TextArea';
import AddressInput from '@/components/forms/AddressInput';

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
    <>
      <View className="">
        <SelectField
          name="serviceType"
          label="Service Type"
          placeholder="Select the service you need"
          options={serviceTypeOptions}
          value={serviceType}
          onValueChange={setServiceType}
        />
      </View>

      <View className="">
        <AddressInput
          label="Service Address"
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

      <View className="">
        <TextArea
          label="Problem Description"
          placeholder="Tell the Mechanic what's Wrong with your Vehicle"
          value={problemDescription}
          onChangeText={setProblemDescription}
          rows={4}
        />
      </View>
    </>
  );
};
