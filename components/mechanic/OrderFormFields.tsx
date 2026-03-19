import React from 'react';
import { View, Text } from 'react-native';
import SelectField from '@/components/forms/SelectField';
import { VehicleDetailsForm } from './VehicleDetailsForm';
import { ServiceDetailsForm } from './ServiceDetailsForm';
import { SchedulingSection } from './SchedulingSection';
import { TruckIcon } from 'react-native-heroicons/outline';

interface SelectOption {
  label: string;
  value: string;
}

interface OrderFormFieldsProps {
  // Car selection
  carSelection: 'Yes' | 'No' | null;
  selectedCar: string;
  setSelectedCar: (value: string) => void;
  hasCarList: boolean;
  carOptions: SelectOption[];

  // Service details
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

  // Vehicle details
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
  vehicleMakesLoading: boolean;

  // Scheduling
  isScheduled: boolean;
  setIsScheduled: (value: boolean) => void;
  preferredDate: Date | null;
  setPreferredDate: (value: Date | null) => void;
  preferredTimeSlot: string;
  setPreferredTimeSlot: (value: string) => void;
  timeSlotOptions: SelectOption[];

  // Callbacks
  onCarSelect?: (carId: string) => void;
  onVINLookup?: (vin: string) => void;
}

/**
 * Composite component that renders the appropriate form fields
 * based on whether user has a car list and their selection
 */
export const OrderFormFields: React.FC<OrderFormFieldsProps> = ({
  carSelection,
  selectedCar,
  setSelectedCar,
  hasCarList,
  carOptions,
  serviceType,
  setServiceType,
  problemDescription,
  setProblemDescription,
  serviceAddress,
  setServiceAddress,
  serviceLatitude,
  setServiceLatitude,
  serviceLongitude,
  setServiceLongitude,
  serviceTypeOptions,
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  vehicleMakeOptions,
  vehicleModelOptions,
  vehicleYearOptions,
  vehicleMakesLoading,
  isScheduled,
  setIsScheduled,
  preferredDate,
  setPreferredDate,
  preferredTimeSlot,
  setPreferredTimeSlot,
  timeSlotOptions,
  onCarSelect,
  onVINLookup,
}) => {
  // If user has car list and selected "Yes", show car dropdown + service details
  if (hasCarList && carSelection === 'Yes') {
    return (
      <View>
        {/* Select Car Section */}
        <View className="mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-primary-50 rounded-full items-center justify-center mr-3">
              <TruckIcon size={18} color="#D30309" />
            </View>
            <Text className="text-base font-NunitoBold text-gray-900">Select Your Vehicle</Text>
          </View>
          
          <SelectField
            name="selectedCar"
            label="Choose from saved vehicles"
            placeholder="Select a car"
            options={carOptions}
            value={selectedCar}
            onValueChange={(carId) => {
              setSelectedCar(carId);
              onCarSelect?.(carId);
            }}
          />
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-4" />

        <ServiceDetailsForm
          serviceType={serviceType}
          setServiceType={setServiceType}
          problemDescription={problemDescription}
          setProblemDescription={setProblemDescription}
          serviceAddress={serviceAddress}
          setServiceAddress={setServiceAddress}
          serviceLatitude={serviceLatitude}
          setServiceLatitude={setServiceLatitude}
          serviceLongitude={serviceLongitude}
          setServiceLongitude={setServiceLongitude}
          serviceTypeOptions={serviceTypeOptions}
        />

        {/* Divider */}
        <View className="h-px bg-gray-200 my-3" />

        <SchedulingSection
          isScheduled={isScheduled}
          setIsScheduled={setIsScheduled}
          preferredDate={preferredDate}
          setPreferredDate={setPreferredDate}
          preferredTimeSlot={preferredTimeSlot}
          setPreferredTimeSlot={setPreferredTimeSlot}
          timeSlotOptions={timeSlotOptions}
        />
      </View>
    );
  }

  // If user has car list and selected "No", or no car list exists
  // Show full manual entry form
  return (
    <View>
      <ServiceDetailsForm
        serviceType={serviceType}
        setServiceType={setServiceType}
        problemDescription={problemDescription}
        setProblemDescription={setProblemDescription}
        serviceAddress={serviceAddress}
        setServiceAddress={setServiceAddress}
        serviceLatitude={serviceLatitude}
        setServiceLatitude={setServiceLatitude}
        serviceLongitude={serviceLongitude}
        setServiceLongitude={setServiceLongitude}
        serviceTypeOptions={serviceTypeOptions}
      />

      {/* Divider */}
      <View className="h-px bg-gray-200 my-3" />

      <VehicleDetailsForm
        vehicleMake={vehicleMake}
        setVehicleMake={setVehicleMake}
        vehicleModel={vehicleModel}
        setVehicleModel={setVehicleModel}
        vehicleYear={vehicleYear}
        setVehicleYear={setVehicleYear}
        vehicleVin={vehicleVin}
        setVehicleVin={setVehicleVin}
        vehicleMakeOptions={vehicleMakeOptions}
        vehicleModelOptions={vehicleModelOptions}
        vehicleYearOptions={vehicleYearOptions}
        onVINLookup={onVINLookup}
        vehicleMakesLoading={vehicleMakesLoading}
      />

      {/* Divider */}
      <View className="h-px bg-gray-200 my-3" />

      <SchedulingSection
        isScheduled={isScheduled}
        setIsScheduled={setIsScheduled}
        preferredDate={preferredDate}
        setPreferredDate={setPreferredDate}
        preferredTimeSlot={preferredTimeSlot}
        setPreferredTimeSlot={setPreferredTimeSlot}
        timeSlotOptions={timeSlotOptions}
      />
    </View>
  );
};
