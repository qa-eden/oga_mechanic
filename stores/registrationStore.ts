import { create } from 'zustand';

interface RegistrationData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
}

interface RegistrationState {
  data: Partial<RegistrationData>;
  setStep1Data: (data: Pick<RegistrationData, 'email' | 'first_name' | 'last_name' | 'phone'>) => void;
  setStep3Data: (data: Pick<RegistrationData, 'password' | 'password_confirm'>) => void;
  getRegistrationData: () => RegistrationData;
  clearData: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  data: {},
  
  setStep1Data: (step1Data) => {
    set((state) => ({
      data: { ...state.data, ...step1Data }
    }));
  },
  
  setStep3Data: (step3Data) => {
    set((state) => ({
      data: { ...state.data, ...step3Data }
    }));
  },
  
  getRegistrationData: () => {
    const state = get();
    return state.data as RegistrationData;
  },
  
  clearData: () => {
    set({ data: {} });
  },
}));
