import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';
import CustomButton from '@/components/CustomButton';
import SelectField from '@/components/forms/SelectField';
import TextArea from '@/components/forms/TextArea';
import BackArrowBtn from '@/components/BackArrowBtn';
import { useFindMechanics } from '@/hooks/useMechanic';

const FindMechanic = () => {
  const [carSelection, setCarSelection] = useState<'Yes' | 'No'>('Yes');
  const [selectedCar, setSelectedCar] = useState('');
  const [carIssue, setCarIssue] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [address, setAddress] = useState('');

  const { findMechanics, isLoading, error, isSuccess } = useFindMechanics();

  const carSelectionOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];
  
  const carOptions = [
    { label: 'Toyota Camry 2020', value: 'toyota-camry-2020' },
    { label: 'Honda Civic 2019', value: 'honda-civic-2019' },
    { label: 'Ford Focus 2021', value: 'ford-focus-2021' },
    { label: 'BMW X3 2022', value: 'bmw-x3-2022' },
    { label: 'Mercedes C-Class 2021', value: 'mercedes-c-class-2021' }
  ];

  const carModelOptions = [
    { label: 'Toyota Camry', value: 'toyota-camry' },
    { label: 'Honda Civic', value: 'honda-civic' },
    { label: 'Ford Focus', value: 'ford-focus' },
    { label: 'BMW X3', value: 'bmw-x3' },
    { label: 'Mercedes C-Class', value: 'mercedes-c-class' },
    { label: 'Audi A4', value: 'audi-a4' },
    { label: 'Volkswagen Golf', value: 'volkswagen-golf' },
    { label: 'Nissan Altima', value: 'nissan-altima' }
  ];

  const carYearOptions = Array.from({ length: 25 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year.toString() };
  });

  const addressOptions = [
    { label: 'Lagos, Nigeria', value: 'lagos-nigeria' },
    { label: 'Abuja, Nigeria', value: 'abuja-nigeria' },
    { label: 'Port Harcourt, Nigeria', value: 'port-harcourt-nigeria' },
    { label: 'Kano, Nigeria', value: 'kano-nigeria' },
    { label: 'Ibadan, Nigeria', value: 'ibadan-nigeria' }
  ];

  const handleProceed = () => {
    if (carSelection === 'Yes') {
      // Validate for existing car selection
      if (!selectedCar || !carIssue.trim()) {
        console.log('Please select a car and describe the issue');
        return;
      }
    } else {
      // Validate for new car details
      if (!carModel || !carYear || !address || !carIssue.trim()) {
        console.log('Please fill in all car details and describe the issue');
        return;
      }
    }

    // Prepare car details for API
    const carDetails = {
      carSelection,
      selectedCar: carSelection === 'Yes' ? selectedCar : undefined,
      carModel: carSelection === 'No' ? carModel : undefined,
      carYear: carSelection === 'No' ? carYear : undefined,
      address: carSelection === 'Yes' ? 'User Location' : address,
      carIssue: carIssue.trim(),
    };

    // Call API to find mechanics
    findMechanics(carDetails);
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
      <BackArrowBtn />
        
        <Text className="text-xl font-NunitoBold text-gray-900">
          Find mechanic
        </Text>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Instruction Text */}
        <Text className="text-base text-gray-600 font-NunitoMedium mb-8 text-center">
          Fill in the details below to find a mechanic
        </Text>

        {/* Car Selection Dropdown */}
        <View className="mb-6">
          <SelectField
            label="Are you selecting from your list of cars?"
            placeholder="Select an option"
            options={carSelectionOptions}
            value={carSelection}
            onSelect={(value) => setCarSelection(value as 'Yes' | 'No')}
            labelStyle="mb-3"
          />
        </View>

        {/* Conditional Car Selection Fields */}
        {carSelection === 'Yes' ? (
          /* Show existing car selection when Yes */
          <View className="mb-8">
            <SelectField
              label="All cars"
              placeholder="Select a car"
              options={carOptions}
              value={selectedCar}
              onSelect={setSelectedCar}
              labelStyle="mb-3"
            />
          </View>
        ) : (
          /* Show new car details when No */
          <>
            <View className="mb-6">
              <SelectField
                label="Car model"
                placeholder="Select a car model"
                options={carModelOptions}
                value={carModel}
                onSelect={setCarModel}
                labelStyle="mb-3"
              />
            </View>

            <View className="mb-6">
              <SelectField
                label="Car year"
                placeholder="Select car year"
                options={carYearOptions}
                value={carYear}
                onSelect={setCarYear}
                labelStyle="mb-3"
              />
            </View>

            <View className="mb-8">
              <SelectField
                label="Address"
                placeholder="Select your address"
                options={addressOptions}
                value={address}
                onSelect={setAddress}
                labelStyle="mb-3"
              />
            </View>
          </>
        )}

        {/* Car Issue Text Area */}
        <TextArea
          label="Car Issue"
          placeholder="What is wrong with your car?"
          value={carIssue}
          onChangeText={setCarIssue}
          rows={5}
        />

        {/* Proceed Button */}
        <View className="mt-8 mb-6">
          <CustomButton
            title={isLoading ? "Finding Mechanics..." : "Proceed"}
            onPress={handleProceed}
            bgVariant="primary"
            className="py-4"
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

        {/* Error Display */}
        {error && (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-600 text-sm font-NunitoMedium text-center">
              {error}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FindMechanic;