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
    <View className="mb-4">
      {/* Section Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100">
          <TruckIcon size={20} color="#111827" />
        </View>
        <Text className="text-lg font-NunitoExtraBold text-gray-900">Vehicle Info</Text>
      </View>

      {/* Vehicle VIN */}
      <View className="mb-4">
        <VINInput
          label="Vehicle Identification Number (VIN)"
          value={vehicleVin}
          onValueChange={setVehicleVin}
          onVINLookup={onVINLookup ? (vin, setFieldValue) => onVINLookup(vin) : undefined}
        />
      </View>

      {/* Vehicle Make */}
      <View className="mb-2">
        <SelectField
          name="vehicleMake"
          label="Brand"
          placeholder={vehicleMakesLoading ? "Loading brands..." : "Select vehicle brand"}
          options={vehicleMakeOptions}
          value={vehicleMake}
          onValueChange={(value) => {
            setVehicleMake(value);
            setVehicleModel(''); // Reset model when make changes
          }}
        />
      </View>

      {/* Vehicle Model */}
      <View className="mb-2">
        <SelectField
          name="vehicleModel"
          label="Model"
          placeholder={vehicleMake ? "Select car model" : "Select brand first"}
          options={vehicleModelOptions}
          value={vehicleModel}
          onValueChange={setVehicleModel}
        />
      </View>

      {/* Vehicle Year */}
      <View className="mb-1">
        <SelectField
          name="vehicleYear"
          label="Production Year"
          placeholder="Select year"
          options={vehicleYearOptions}
          value={vehicleYear}
          onValueChange={setVehicleYear}
        />
      </View>
    </View>
  );
};
