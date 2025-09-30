import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, RegisterStep2Data, RegisterStep3Data } from '../lib/api/user';
import { useRegistrationStore } from '../stores/registrationStore';

// Query keys for seller registration
export const sellerRegistrationKeys = {
  all: ['sellerRegistration'] as const,
  steps: () => [...sellerRegistrationKeys.all, 'steps'] as const,
  step: (stepId: number) => [...sellerRegistrationKeys.steps(), stepId] as const,
};

// Hook for seller step 1 registration (role selection)
export const useSellerRegisterStep1 = () => {
  const { setStepByStepData, setStepByStepMode, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: { role_id: number }) => userAPI.registerStep(1, data),
    onSuccess: (response, variables) => {
      setStepByStepMode(true);
      setCurrentStep(1);
      setStepByStepData({
        role_id: variables.role_id,
        sessionId: response.sessionId || response.session_id
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in seller step 1 registration:', error);
    },
  });
};

// Hook for seller step 2 registration (personal details)
export const useSellerRegisterStep2 = () => {
  const { setStepByStepData, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: RegisterStep2Data & { role_id?: number }) => userAPI.registerStep(2, {
      ...data,
      role_id: data.role_id || 3 // Ensure seller role ID is always included
    }),
    onSuccess: (response, variables) => {
      setStepByStepData({
        email: variables.email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        phone_number: variables.phone_number,
        role_id: variables.role_id || 3 // Default to seller role ID
      });
      setCurrentStep(2);
    },
    onError: (error: any) => {
      console.error('❌ Error in seller step 2 registration:', error);
    },
    // Add retry and timeout options to prevent stuck state
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online',
  });
};

// Hook for seller step 3 registration (OTP verification)
export const useSellerRegisterStep3 = () => {
  const { setStepByStepData } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: { email: string; verification_code: string }) => userAPI.registerStep(3, data),
    onSuccess: (response, variables) => {
      setStepByStepData({
        verification_code: variables.verification_code
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in seller step 3 registration:', error);
    },
  });
};

// Hook for seller step 4 registration (business details - if needed)
export const useSellerRegisterStep4 = () => {
  const { setStepByStepData, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: { business_name?: string; business_type?: string; business_address?: string }) => 
      userAPI.registerStep(4, data),
    onSuccess: (response, variables) => {
      setStepByStepData({
        business_name: variables.business_name,
        business_type: variables.business_type,
        business_address: variables.business_address
      });
      setCurrentStep(3);
    },
    onError: (error: any) => {
      console.error('❌ Error in seller step 4 registration:', error);
    },
  });
};

// Hook for seller step 5 registration (password setup)
export const useSellerRegisterStep5 = () => {
  const { clearStepByStepData } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: RegisterStep3Data) => userAPI.registerStep(5, data),
    onSuccess: () => {
      // Don't clear data here - let the component handle it after storing to AsyncStorage
      console.log('✅ Seller registration completed successfully');
    },
    onError: (error: any) => {
      console.error('❌ Error in seller step 5 registration:', error);
    },
  });
};

// Hook for resending OTP for seller
export const useSellerResendOTP = () => {
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
        phone_number: stepByStepData.phone_number || '',
        role_id: stepByStepData.role_id || 3 // Seller role ID
      });
    },
    onSuccess: () => {
      console.log('✅ OTP resent successfully for seller');
    },
    onError: (error: any) => {
      console.error('❌ Error resending OTP for seller:', error);
    },
  });
};

// Hook for seller registration with role ID 3 (seller)
export const useSellerRegistration = () => {
  const { setStepByStepData, setStepByStepMode, setCurrentStep } = useRegistrationStore();

  return useMutation({
    mutationFn: (data: { email: string; first_name: string; last_name: string; phone_number: string }) => 
      userAPI.registerStep(2, {
        ...data,
        role_id: 3 // Seller role ID
      }),
    onSuccess: (response, variables) => {
      setStepByStepMode(true);
      setCurrentStep(2);
      setStepByStepData({
        email: variables.email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        phone_number: variables.phone_number,
        role_id: 3,
        sessionId: response.sessionId || response.session_id
      });
    },
    onError: (error: any) => {
      console.error('❌ Error in seller registration:', error);
    },
    // Add retry and timeout options to prevent stuck state
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online',
  });
};
