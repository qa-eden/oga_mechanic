import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, RegisterStep1Data, RegisterStep2Data, RegisterStep3Data } from '../lib/api/user';
import { useRegistrationStore } from '../stores/registrationStore';

// Query keys for registration
export const registrationKeys = {
  all: ['registration'] as const,
  steps: () => [...registrationKeys.all, 'steps'] as const,
  step: (stepId: number) => [...registrationKeys.steps(), stepId] as const,
};

// Hook for step 1 registration (role selection)
export const useRegisterStep1 = () => {
  const { setStepByStepData, setStepByStepMode, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: RegisterStep1Data) => userAPI.registerStep(1, data),
    onSuccess: (response, variables) => {
      setStepByStepMode(true);
      setCurrentStep(1);
      setStepByStepData({
        role_id: variables.role_id,
        sessionId: response.sessionId || response.session_id
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in step 1 registration:', error);
    },
  });
};

// Hook for step 2 registration (personal details)
export const useRegisterStep2 = () => {
  const { setStepByStepData, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: RegisterStep2Data) => userAPI.registerStep(2, data),
    onSuccess: (response, variables) => {
      setStepByStepData({
        email: variables.email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        phone_number: variables.phone_number
      });
      setCurrentStep(2);
    },
    onError: (error: any) => {
      console.error('❌ Error in step 2 registration:', error);
    },
  });
};

// Hook for step 3 registration (OTP verification)
export const useRegisterStep3 = () => {
  const { setStepByStepData } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: { email: string; verification_code: string }) => userAPI.registerStep(3, data),
    onSuccess: (response, variables) => {
      setStepByStepData({
        verification_code: variables.verification_code
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in step 3 registration:', error);
    },
  });
};

// Hook for step 4 registration (vehicle details)
export const useRegisterVehicle = () => {
  const { setStepByStepData, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: { has_car: boolean; car_make?: string; car_model?: string; car_year?: number; license_plate?: string }) => 
      userAPI.registerStep(4, data),
    onSuccess: (response, variables) => {
      setStepByStepData({
        has_car: variables.has_car,
        car_make: variables.car_make,
        car_model: variables.car_model,
        car_year: variables.car_year,
        license_plate: variables.license_plate
      });
      setCurrentStep(3);
    },
    onError: (error: any) => {
      console.error('❌ Error in vehicle registration:', error);
    },
  });
};

// Hook for resending OTP
export const useResendOTP = () => {
  const { getStepByStepData } = useRegistrationStore();

  return useMutation({
    mutationFn: () => {
      const stepByStepData = getStepByStepData();
      const email = stepByStepData.email || '';
      
      // Call the same endpoint as step 2 to resend OTP
      return userAPI.registerStep(2, {
        email: email,
        first_name: stepByStepData.first_name || '',
        last_name: stepByStepData.last_name || '',
        phone_number: stepByStepData.phone_number || ''
      });
    },
    onSuccess: () => {
      console.log('✅ OTP resent successfully');
    },
    onError: (error: any) => {
      console.error('❌ Error resending OTP:', error);
    },
  });
};

// Hook for step 4 registration (password setup)
export const useRegisterStep4 = () => {
  const { clearStepByStepData } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: RegisterStep3Data) => userAPI.registerStep(5, data),
    onSuccess: () => {
      // Don't clear data here - let the component handle it after storing to AsyncStorage
    },
    onError: (error: any) => {
      console.error('❌ Error in step 4 registration:', error);
    },
  });
};
