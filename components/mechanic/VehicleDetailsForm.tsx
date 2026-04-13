import React from 'react';
import { View, Text } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import VINInput from '@/components/VINInput';
import { TruckIcon } from 'react-native-heroicons/outline';

interface SelectOption {
  label: string;
  value: string;
}

interface VehicleDetailsFormProps {
  vehicleMake: string;
  setVehicleMake: (value: string) => void;
  vehicleModel: string;
  setVehicleModel: (value: string) => void;
  vehicleYear: string;
  setVehicleYear: (value: string) => void;
  vehicleMakeOptions: SelectOption[];
  vehicleModelOptions: SelectOption[];
  vehicleYearOptions: SelectOption[];
  vehicleVin: string;
  setVehicleVin: (value: string) => void;
  onVINLookup?: (vin: string) => void;
  vehicleMakesLoading?: boolean;
}

/**
 * Reusable component for vehicle make/model/year selection
 * Used in multiple places in the find-mechanic flow
 */
export const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  onVINLookup,
  vehicleMakeOptions,
  vehicleModelOptions,
  vehicleYearOptions,
  vehicleMakesLoading = false,
}) => {
  return (
    <View className="mb-1">
      {/* Section Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 bg-primary-50 rounded-full items-center justify-center mr-3">
          <TruckIcon size={18} color="#D30309" />
        </View>
        <Text className="text-base font-NunitoBold text-gray-900">Vehicle Information</Text>
      </View>

      {/* Vehicle VIN */}
      <View className="mb-3">
        <VINInput
          label="Vehicle VIN"
          value={vehicleVin}
          onValueChange={setVehicleVin}
          onVINLookup={onVINLookup ? (vin, setFieldValue) => onVINLookup(vin) : undefined}
        />
      </View>

      {/* Vehicle Make */}
      <View className="mb-3">
        <SelectField
          name="vehicleMake"
          label="Vehicle Make"
          placeholder={vehicleMakesLoading ? "Loading makes..." : "Select your vehicle make"}
          options={vehicleMakeOptions}
          value={vehicleMake}
          onValueChange={(value) => {
            setVehicleMake(value);
            setVehicleModel(''); // Reset model when make changes
          }}
        />
      </View>

      {/* Vehicle Model */}
      <View className="mb-3">
        <SelectField
          name="vehicleModel"
          label="Model"
          placeholder={vehicleMake ? "Select model" : "Select make first"}
          options={vehicleModelOptions}
          value={vehicleModel}
          onValueChange={setVehicleModel}
        />
      </View>

      {/* Vehicle Year */}
      <View className="mb-1">
        <SelectField
          name="vehicleYear"
          label="Year"
          placeholder="Select year"
          options={vehicleYearOptions}
          value={vehicleYear}
          onValueChange={setVehicleYear}
        />
      </View>
    </View>
  );
};
