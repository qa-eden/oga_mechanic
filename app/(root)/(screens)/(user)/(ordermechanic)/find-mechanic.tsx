import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import BackArrowBtn from '@/components/BackArrowBtn';
import { useCreateRepairRequest } from '@/hooks/useMechanic';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { getErrorMessage } from '@/utils/errorMessages';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { decodeVINWithImage } from '@/utils/vinDecoder';
import { routes } from '@/constants/routes';
import { LAYOUT } from '@/constants/units';
import { CarSelectionStep } from '@/components/mechanic/CarSelectionStep';
import { StepIndicator } from '@/components/mechanic/StepIndicator';
import { OrderFormFields } from '@/components/mechanic/OrderFormFields';
import { SuccessModal } from '@/components/mechanic/SuccessModal';
import { useFindMechanicForm } from '@/hooks/mechanic/useFindMechanicForm';
import { useCarList } from '@/hooks/mechanic/useCarList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useVehicleOptions } from '@/hooks/mechanic/useVehicleOptions';

const getCurrentTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 16) return 'afternoon';
  return 'evening';
};

const FindMechanic = () => {
  // Hooks
  const { hasCarList, carOptions, selectedCarData, isLoading: carsLoading } = useCarList();
  const carsReady = !carsLoading;
  const formState = useFindMechanicForm(hasCarList, carsReady);
  const { data: vehicleMakes, loading: vehicleMakesLoading } = useVehicleMakes();
  const { vehicleMakeOptions, vehicleModelOptions, vehicleYearOptions } = useVehicleOptions(
    formState.vehicleMake
  );
  const { serviceTypes, loading: serviceTypesLoading, error: serviceTypesError } = useServiceTypes();
  const { mutate: createRepairRequest, isPending, error } = useCreateRepairRequest();

  const timeSlotOptions = useMemo(
    () => [
      { label: 'Morning (8am - 12pm)', value: 'morning' },
      { label: 'Afternoon (12pm - 4pm)', value: 'afternoon' },
      { label: 'Evening (4pm - 8pm)', value: 'evening' },
    ],
    []
  );

  // Handle car selection from dropdown
  const handleCarSelect = useCallback(
    (carId: string) => {
      const car = selectedCarData(carId);
      if (car) {
        // Try to find IDs by matching names if not available
        let makeId = car.make_id;
        let modelId = car.model_id;

        if (!makeId && vehicleMakes) {
          const matchedMake = vehicleMakes.find((m) => m.name.toLowerCase() === car.make.toLowerCase());
          makeId = matchedMake?.id.toString();
        }

        if (!modelId && makeId && vehicleMakes) {
          const matchedMake = vehicleMakes.find((m) => m.id.toString() === makeId);
          const matchedModel = matchedMake?.models.find((m) => m.name.toLowerCase() === car.model.toLowerCase());
          modelId = matchedModel?.id.toString();
        }

        formState.setVehicleMake(makeId || car.make || '');
        formState.setVehicleModel(modelId || car.model || '');
        formState.setVehicleYear(car.year.toString());
      }
    },
    [selectedCarData, vehicleMakes, formState]
  );
  
  // Handle VIN lookup
  const handleVINLookup = useCallback(async (vin: string) => {
    if (!vin || vin.length < 17) return;

    try {
      const vehicleInfo = await decodeVINWithImage(vin);

      if (vehicleInfo) {
        // Update vehicle details from VIN lookup
        if (vehicleInfo.make) {
          // If we have vehicleMakes list, try to find the ID
          let makeId = vehicleInfo.make;
          if (vehicleMakes) {
            const matchedMake = vehicleMakes.find(m => m.name.toLowerCase() === vehicleInfo.make.toLowerCase());
            if (matchedMake) makeId = matchedMake.id.toString();
          }
          formState.setVehicleMake(makeId);

          // We reset model when make changes in the component, but here we want to set it
          if (vehicleInfo.model) {
            // Wait for make to update so model options can populate? 
            // Actually our useVehicleOptions might need makeId to be the ID, not name
            // Let's assume setVehicleMake handles it or we'll need a slight delay
            
            // Try to find model ID if possible
            let modelId = vehicleInfo.model;
            if (vehicleMakes && makeId) {
              const matchedMake = vehicleMakes.find(m => m.id.toString() === makeId || m.name.toLowerCase() === vehicleInfo.make.toLowerCase());
              const matchedModel = matchedMake?.models.find(m => m.name.toLowerCase() === vehicleInfo.model.toLowerCase());
              if (matchedModel) modelId = matchedModel.id.toString();
            }
            formState.setVehicleModel(modelId);
          }
        }
        
        if (vehicleInfo.modelYear) {
          formState.setVehicleYear(vehicleInfo.modelYear.toString());
        }

        Alert.alert(
          "Vehicle Found!",
          `Successfully loaded details for ${vehicleInfo.make} ${vehicleInfo.model}`,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "VIN Lookup Failed",
        error.message || "Unable to find vehicle information for this VIN.",
        [{ text: "OK" }]
      );
    }
  }, [vehicleMakes, formState]);

  const handleProceed = () => {
    Keyboard.dismiss();
    // Determine if we're using car list selection or manual entry
    const isUsingCarList = hasCarList && formState.carSelection === 'Yes';

    if (isUsingCarList) {
      // Validate for existing car selection - all required fields
      if (
        !formState.selectedCar ||
        formState.serviceTypes.length === 0 ||
        !formState.problemDescription.trim() ||
        !formState.serviceAddress.trim() ||
        (formState.isScheduled && (!formState.preferredDate || !formState.preferredTimeSlot))
      ) {
        const missing: string[] = [];
        if (!formState.selectedCar) missing.push('Vehicle');
        if (formState.serviceTypes.length === 0) missing.push('Service type');
        if (!formState.serviceAddress.trim()) missing.push('Service location');
        if (!formState.problemDescription.trim()) missing.push('Problem description');
        if (formState.isScheduled && !formState.preferredDate) missing.push('Preferred date');
        if (formState.isScheduled && !formState.preferredTimeSlot) missing.push('Preferred time slot');

        Alert.alert(
          'Missing information',
          missing.length ? `Please fill: ${missing.join(', ')}` : 'Please complete the form.'
        );
        return;
      }
    } else {
      // Validate for new car details - all required fields from order-mechanic
      if (
        formState.serviceTypes.length === 0 ||
        !formState.vehicleMake ||
        !formState.vehicleModel ||
        !formState.vehicleYear ||
        !formState.problemDescription.trim() ||
        !formState.serviceAddress.trim() ||
        (formState.isScheduled && (!formState.preferredDate || !formState.preferredTimeSlot))
      ) {
        const missing: string[] = [];
        if (formState.serviceTypes.length === 0) missing.push('Service type');
        if (!formState.serviceAddress.trim()) missing.push('Service location');
        if (!formState.problemDescription.trim()) missing.push('Problem description');
        if (!formState.vehicleMake) missing.push('Vehicle make');
        if (!formState.vehicleModel) missing.push('Vehicle model');
        if (!formState.vehicleYear) missing.push('Vehicle year');
        if (formState.isScheduled && !formState.preferredDate) missing.push('Preferred date');
        if (formState.isScheduled && !formState.preferredTimeSlot) missing.push('Preferred time slot');

        Alert.alert(
          'Missing information',
          missing.length ? `Please fill: ${missing.join(', ')}` : 'Please complete the form.'
        );
        return;
      }
    }

    // Prepare vehicle details - extract from selected car if using car list
    let finalVehicleMake = formState.vehicleMake;
    let finalVehicleModel = formState.vehicleModel;
    let finalVehicleYear = formState.vehicleYear;

    if (isUsingCarList) {
      const car = selectedCarData(formState.selectedCar);
      if (car) {
        // Use make/model/year from selected car
        let makeId = car.make_id;
        let modelId = car.model_id;

        if (!makeId && vehicleMakes) {
          const matchedMake = vehicleMakes.find((m) => m.name.toLowerCase() === car.make.toLowerCase());
          makeId = matchedMake?.id.toString();
        }

        if (!modelId && makeId && vehicleMakes) {
          const matchedMake = vehicleMakes.find((m) => m.id.toString() === makeId);
          const matchedModel = matchedMake?.models.find((m) => m.name.toLowerCase() === car.model.toLowerCase());
          modelId = matchedModel?.id.toString();
        }

        finalVehicleMake = makeId || car.make;
        finalVehicleModel = modelId || car.model;
        finalVehicleYear = car.year.toString();
      }
    }

    // Validate vehicle year
    const vehicleYearNumber = parseInt(finalVehicleYear, 10);
    if (Number.isNaN(vehicleYearNumber)) {
      Alert.alert('Invalid year', 'Please select a valid vehicle year.');
      return;
    }

    // Determine final date and time slot
    let finalDate = formState.preferredDate;
    let finalTimeSlot = formState.preferredTimeSlot;

    if (!formState.isScheduled) {
      finalDate = new Date();
      finalTimeSlot = getCurrentTimeSlot();
    }

    // Prepare payload for RepairRequest.
    // If user selected a saved car, send user_vehicle UUID to use backend vehicle linkage.
    const payloadData = {
      ...(formState.serviceTypes.length === 1
        ? { service_type: formState.serviceTypes[0] }
        : { service_categories: formState.serviceTypes }),
      // Always send make/model/year so backend + clients can rely on them,
      // even when user_vehicle is provided.
      vehicle_make: finalVehicleMake,
      vehicle_model: finalVehicleModel,
      vehicle_year: vehicleYearNumber,
      // VIN is only available in manual / VIN lookup flow today.
      ...(formState.vehicleVin ? { vehicle_vin: formState.vehicleVin } : {}),
      ...(isUsingCarList && formState.selectedCar
        ? {
            user_vehicle: formState.selectedCar,
          }
        : {}),
      problem_description: formState.problemDescription.trim(),
      service_address: formState.serviceAddress.trim(),
      service_latitude: formState.serviceLatitude ? parseFloat(formState.serviceLatitude.toFixed(7)) : undefined,
      service_longitude: formState.serviceLongitude ? parseFloat(formState.serviceLongitude.toFixed(7)) : undefined,
      schedule: formState.isScheduled,
      ...(formState.isScheduled && {
        preferred_date: finalDate?.toISOString().split('T')[0],
        preferred_time_slot: finalTimeSlot,
      }),
    };

    const payload = {
      data: payloadData,
      requestType: 'inbound',
    };

    // Call API to create repair request
    createRepairRequest(payload, {
      onSuccess: (response: any) => {
        const orderId = response?.data?.id || response?.id;
        const estimatedCost =
          response?.data?.estimated_cost ??
          response?.estimated_cost ??
          null;
        
        if (orderId) {
          formState.setSuccessOrderId(orderId.toString());
          formState.setSuccessMessage(response?.message || null);
          formState.setSuccessEstimatedCost(
            estimatedCost != null ? String(estimatedCost) : null
          );
          formState.setShowSuccessModal(true);
        } else {
          Alert.alert(
            'Request submitted',
            'Your repair request has been submitted. Available mechanics will be notified.',
            [{ text: 'OK' }]
          );
        }
      },
      onError: (err: any) => {
        try {
          const errorMessage = getErrorMessage(err, 'general');
          Alert.alert('Submission failed', errorMessage);
        } catch (alertError) {
          console.error('Error displaying error message:', alertError);
          Alert.alert('Submission failed', 'An error occurred. Please try again.');
        }
      },
    });
  };

  const handleTrackOrder = () => {
    formState.setShowSuccessModal(false);
    if (formState.successOrderId) {
      router.push({
        pathname: routes.trackMechanicOrder,
        params: {
          orderId: formState.successOrderId,
        },
      });
    }
  };

  const handleGoHome = () => {
    formState.setShowSuccessModal(false);
    formState.setSuccessEstimatedCost(null);
    router.replace(routes.home);
  };

  if (carsLoading) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">Find mechanic</Text>
          <View className="w-10" />
        </View>
        <LoadingSpinner
          message="Loading your vehicles…"
          subMessage="One moment"
          size="medium"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        {hasCarList && formState.currentStep === 2 ? (
          <BackArrowBtn onPress={() => formState.setCurrentStep(1)} />
        ) : (
          <BackArrowBtn />
        )}
        
        <Text className="text-xl font-NunitoBold text-gray-900">
          Find mechanic
        </Text>
        
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1 px-5 pt-6" 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Platform.OS === 'android' ? 80 : 30,
          }}
        >
        {/* Step Indicator */}
        <StepIndicator currentStep={formState.currentStep} hasCarList={hasCarList} />

        {/* Step 1: Car Selection */}
        {formState.currentStep === 1 && hasCarList && (
          <CarSelectionStep
            carSelection={formState.carSelection}
            onSelectYes={() => {
              formState.setCarSelection('Yes');
              formState.setCurrentStep(2);
            }}
            onSelectNo={() => {
              formState.setCarSelection('No');
              formState.setSelectedCar('');
              formState.setVehicleMake('');
              formState.setVehicleModel('');
              formState.setVehicleYear('');
              formState.setCurrentStep(2);
            }}
          />
        )}

        {/* Step 2: Order Input Fields */}
        {formState.currentStep === 2 && (
          <View>
            {/* Form Header */}
            <View className="bg-primary-50 rounded-xl p-3 mb-4 border border-primary-100">
              <Text className="text-lg font-NunitoBold text-gray-900 mb-1 text-center">
                Request Details
              </Text>
              <Text className="text-sm text-gray-600 font-NunitoRegular text-center">
                Complete the form below to find available mechanics near you
              </Text>
            </View>

            <OrderFormFields
              carSelection={formState.carSelection}
              selectedCar={formState.selectedCar}
              setSelectedCar={formState.setSelectedCar}
              hasCarList={hasCarList}
              carOptions={carOptions}
              serviceTypes={formState.serviceTypes}
              setServiceTypes={formState.setServiceTypes}
              problemDescription={formState.problemDescription}
              setProblemDescription={formState.setProblemDescription}
              serviceAddress={formState.serviceAddress}
              setServiceAddress={formState.setServiceAddress}
              serviceLatitude={formState.serviceLatitude}
              setServiceLatitude={formState.setServiceLatitude}
              serviceLongitude={formState.serviceLongitude}
              setServiceLongitude={formState.setServiceLongitude}
              serviceTypeOptions={serviceTypes}
              vehicleMake={formState.vehicleMake}
              setVehicleMake={formState.setVehicleMake}
              vehicleModel={formState.vehicleModel}
              setVehicleModel={formState.setVehicleModel}
              vehicleYear={formState.vehicleYear}
              setVehicleYear={formState.setVehicleYear}
              vehicleVin={formState.vehicleVin}
              setVehicleVin={formState.setVehicleVin}
              vehicleMakeOptions={vehicleMakeOptions}
              vehicleModelOptions={vehicleModelOptions}
              vehicleYearOptions={vehicleYearOptions}
              vehicleMakesLoading={vehicleMakesLoading}
              isScheduled={formState.isScheduled}
              setIsScheduled={formState.setIsScheduled}
              preferredDate={formState.preferredDate}
              setPreferredDate={formState.setPreferredDate}
              preferredTimeSlot={formState.preferredTimeSlot}
              setPreferredTimeSlot={formState.setPreferredTimeSlot}
              timeSlotOptions={timeSlotOptions}
              onCarSelect={handleCarSelect}
              onVINLookup={handleVINLookup}
            />

            {/* Submit Button */}
            <View className="flex-row gap-3 mt-6">
              <View className="flex-1">
                <CustomButton
                  title={isPending ? "Submitting request..." : "Proceed"}
                  onPress={handleProceed}
                  bgVariant="primary"
                  className="py-4"
                  loading={isPending}
                  disabled={isPending}
                />
              </View>
            </View>
          </View>
        )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={formState.showSuccessModal}
        orderId={formState.successOrderId}
        message={formState.successMessage}
        estimatedCost={formState.successEstimatedCost}
        onTrackOrder={handleTrackOrder}
        onGoHome={handleGoHome}
      />
    </SafeAreaView>
  );
};

export default FindMechanic;