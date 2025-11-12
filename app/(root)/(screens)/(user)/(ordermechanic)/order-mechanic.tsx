import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import SelectField from '@/components/forms/SelectField';
import TextArea from '@/components/forms/TextArea';
import BackArrowBtn from '@/components/BackArrowBtn';
import AddressInput from '@/components/forms/AddressInput';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateRepairRequest } from '@/hooks/useMechanic';
import { router, useLocalSearchParams } from 'expo-router';

const OrderMechanic = () => {
  const params = useLocalSearchParams();
  const mechanicIdParam = Array.isArray(params?.mechanicId)
    ? params?.mechanicId[0]
    : (params?.mechanicId as string | undefined);
  const mechanicName = Array.isArray(params?.mechanicName)
    ? params?.mechanicName[0]
    : (params?.mechanicName as string | undefined);

  const [serviceType, setServiceType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceLatitude, setServiceLatitude] = useState<number | undefined>(undefined);
  const [serviceLongitude, setServiceLongitude] = useState<number | undefined>(undefined);
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: createRepairRequest, isPending, error } = useCreateRepairRequest();

  const serviceTypeOptions = useMemo(
    () => [
      { label: 'Diagnostics', value: 'diagnostics' },
      { label: 'Routine Maintenance', value: 'maintenance' },
      { label: 'Repair', value: 'repair' },
      { label: 'Emergency Callout', value: 'emergency' },
    ],
    []
  );

  const vehicleModelOptions = useMemo(
    () => [
      { label: 'Toyota Camry', value: 'toyota camry' },
      { label: 'Honda Civic', value: 'honda civic' },
      { label: 'Ford Focus', value: 'ford focus' },
      { label: 'BMW X3', value: 'bmw x3' },
      { label: 'Mercedes C-Class', value: 'mercedes c-class' },
      { label: 'Audi A4', value: 'audi a4' },
      { label: 'Volkswagen Golf', value: 'volkswagen golf' },
      { label: 'Nissan Altima', value: 'nissan altima' },
    ],
    []
  );

  const vehicleYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => {
      const year = currentYear - i;
      return { label: year.toString(), value: year.toString() };
    });
  }, []);

  const timeSlotOptions = useMemo(
    () => [
      { label: 'Morning (8am - 12pm)', value: 'morning' },
      { label: 'Afternoon (12pm - 4pm)', value: 'afternoon' },
      { label: 'Evening (4pm - 8pm)', value: 'evening' },
    ],
    []
  );

  const formattedDate = preferredDate
    ? preferredDate.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Select date';

  const handleSubmitRequest = () => {
    const mechanicId = mechanicIdParam;

    if (!mechanicId) {
      Alert.alert('Missing mechanic', 'Unable to submit request. Mechanic details are missing.');
      return;
    }

    if (
      !serviceType ||
      !vehicleModel ||
      !vehicleYear ||
      !problemDescription.trim() ||
      !serviceAddress.trim() ||
      !preferredDate ||
      !preferredTimeSlot
    ) {
      Alert.alert('Incomplete details', 'Please fill in all required fields before submitting.');
      return;
    }

    const vehicleYearNumber = parseInt(vehicleYear, 10);
    if (Number.isNaN(vehicleYearNumber)) {
      Alert.alert('Invalid year', 'Please select a valid vehicle year.');
      return;
    }

    const payload = {
      mechanic_id: mechanicId,
      service_type: serviceType,
      vehicle_model: vehicleModel,
      vehicle_year: vehicleYearNumber,
      problem_description: problemDescription.trim(),
      service_address: serviceAddress.trim(),
      service_latitude: serviceLatitude,
      service_longitude: serviceLongitude,
      preferred_date: preferredDate.toISOString().split('T')[0],
      preferred_time_slot: preferredTimeSlot,
      notes: notes.trim() || undefined,
    };

    createRepairRequest(payload, {
      onSuccess: () => {
        Alert.alert(
          'Request submitted',
          'Your repair request has been sent to the mechanic. You will be notified once they respond.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'We could not submit the request. Please try again.';
        Alert.alert('Submission failed', message);
      },
    });
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setPreferredDate(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
      <BackArrowBtn />
        
        <Text className="text-xl font-NunitoBold text-gray-900">
          Order mechanic
        </Text>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Instruction Text */}
        <Text className="text-base text-gray-600 font-NunitoMedium mb-6 text-center">
          Share the details below and we’ll send your repair request to the mechanic.
        </Text>

        {mechanicName && (
          <View className="mb-6 rounded-2xl bg-primary-50 border border-primary-100 p-4">
            <Text className="text-sm font-NunitoMedium text-primary-700">Sending to</Text>
            <Text className="text-lg font-NunitoBold text-primary-900 mt-1">{mechanicName}</Text>
          </View>
        )}

        <SelectField
          name="serviceType"
          label="Service Type"
          placeholder="Select the service you need"
          options={serviceTypeOptions}
          value={serviceType}
          onValueChange={setServiceType}
        />

        <SelectField
          name="vehicleModel"
          label="Vehicle Model"
          placeholder="Select your vehicle model"
          options={vehicleModelOptions}
          value={vehicleModel}
          onValueChange={setVehicleModel}
        />

        <SelectField
          name="vehicleYear"
          label="Vehicle Year"
          placeholder="Select your vehicle year"
          options={vehicleYearOptions}
          value={vehicleYear}
          onValueChange={setVehicleYear}
        />

        <View className="mb-6">
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
          />
        </View>

        <View className="mb-6">
          <Text className="text-base font-NunitoSemiBold text-gray-700 mb-2">
            Preferred Date
            <Text className="text-red-500 ml-1">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4 border border-gray-200"
            activeOpacity={0.7}
          >
            <Text className="text-[1.1rem] font-NunitoMedium text-gray-900">{formattedDate}</Text>
            <Text className="text-sm font-NunitoMedium text-primary-500">Change</Text>
          </TouchableOpacity>
        </View>

        <SelectField
          name="timeSlot"
          label="Preferred Time Slot"
          placeholder="Select a time slot"
          options={timeSlotOptions}
          value={preferredTimeSlot}
          onValueChange={setPreferredTimeSlot}
        />

        <TextArea
          label="Problem Description"
          placeholder="Tell the mechanic what’s wrong with your vehicle"
          value={problemDescription}
          onChangeText={setProblemDescription}
          rows={6}
        />

        <TextArea
          label="Additional Notes (Optional)"
          placeholder="Share access instructions, parking info or other helpful notes"
          value={notes}
          onChangeText={setNotes}
          rows={4}
        />

        {/* Proceed Button */}
        <View className="mt-8 mb-6">
          <CustomButton
            title={isPending ? "Submitting request..." : "Submit Request"}
            onPress={handleSubmitRequest}
            bgVariant="primary"
            className="py-4"
            loading={isPending}
            disabled={isPending}
          />
        </View>

        {/* Error Display */}
        {(error as any)?.message && (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-600 text-sm font-NunitoMedium text-center">
              {(error as any).message}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-gray-600 bg-opacity-20 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-NunitoBold text-gray-900">Select Preferred Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-primary-500 font-NunitoBold">Done</Text>
              </TouchableOpacity>
            </View>
            <View className="items-center">
              <DateTimePicker
                value={preferredDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={handleDateChange}
                style={{
                  width: Platform.OS === 'ios' ? 300 : '100%',
                  height: Platform.OS === 'ios' ? 200 : 50,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OrderMechanic;