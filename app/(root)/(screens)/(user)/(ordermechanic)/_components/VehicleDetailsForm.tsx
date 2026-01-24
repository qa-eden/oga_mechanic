import React from 'react';
import { View } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import InputField from '@/components/InputField';

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
  vehicleMakeOptions,
  vehicleModelOptions,
  vehicleYearOptions,
  vehicleMakesLoading = false,
}) => {
  return (
    <>
      <View className="">
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

      <View className="">
        <SelectField
          name="vehicleModel"
          label="Vehicle Model"
          placeholder={vehicleMake ? (vehicleMakesLoading ? "Loading models..." : "Select your vehicle model") : "Select make first"}
          options={vehicleModelOptions}
          value={vehicleModel}
          onValueChange={setVehicleModel}
        />
      </View>

      <View className="">
        <SelectField
          name="vehicleYear"
          label="Vehicle Year"
          placeholder="Select your vehicle year"
          options={vehicleYearOptions}
          value={vehicleYear}
          onValueChange={setVehicleYear}
        />
      </View>
    </>
  );
};
