import { useState, useEffect } from 'react';

interface UseFindMechanicFormReturn {
  // Car selection
  carSelection: 'Yes' | 'No' | null;
  setCarSelection: (value: 'Yes' | 'No' | null) => void;
  selectedCar: string;
  setSelectedCar: (value: string) => void;

  // Service details
  serviceTypes: string[];
  setServiceTypes: (value: string[]) => void;

  // Vehicle details
  vehicleMake: string;
  setVehicleMake: (value: string) => void;
  vehicleModel: string;
  setVehicleModel: (value: string) => void;
  vehicleYear: string;
  setVehicleYear: (value: string) => void;
  vehicleVin: string;
  setVehicleVin: (value: string) => void;

  // Problem description
  problemDescription: string;
  setProblemDescription: (value: string) => void;

  // Service location
  serviceAddress: string;
  setServiceAddress: (value: string) => void;
  serviceLatitude: number | undefined;
  setServiceLatitude: (value: number | undefined) => void;
  serviceLongitude: number | undefined;
  setServiceLongitude: (value: number | undefined) => void;

  // Scheduling
  preferredDate: Date | null;
  setPreferredDate: (value: Date | null) => void;
  preferredTimeSlot: string;
  setPreferredTimeSlot: (value: string) => void;
  isScheduled: boolean;
  setIsScheduled: (value: boolean) => void;

  // Success modal
  showSuccessModal: boolean;
  setShowSuccessModal: (value: boolean) => void;
  successOrderId: string | null;
  setSuccessOrderId: (value: string | null) => void;
  successMessage: string | null;
  setSuccessMessage: (value: string | null) => void;

  // Step management
  currentStep: 1 | 2;
  setCurrentStep: (value: 1 | 2) => void;
}

/**
 * Custom hook to manage all form state for the Find Mechanic screen.
 * @param carsReady When false, saved-vehicle list is still loading (do not trust hasCarList yet).
 */
export const useFindMechanicForm = (
  hasCarList: boolean,
  carsReady: boolean
): UseFindMechanicFormReturn => {
  // Car selection
  const [carSelection, setCarSelection] = useState<'Yes' | 'No' | null>(null);
  const [selectedCar, setSelectedCar] = useState('');

  // Service details
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  // Vehicle details
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleVin, setVehicleVin] = useState('');

  // Problem description
  const [problemDescription, setProblemDescription] = useState('');

  // Service location
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceLatitude, setServiceLatitude] = useState<number | undefined>(undefined);
  const [serviceLongitude, setServiceLongitude] = useState<number | undefined>(undefined);

  // Scheduling
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!carsReady) return;
    setCurrentStep(hasCarList ? 1 : 2);
    if (!hasCarList) {
      setCarSelection(null);
      setSelectedCar("");
    }
  }, [carsReady, hasCarList]);

  return {
    carSelection,
    setCarSelection,
    selectedCar,
    setSelectedCar,
    serviceTypes,
    setServiceTypes,
    vehicleMake,
    setVehicleMake,
    vehicleModel,
    setVehicleModel,
    vehicleYear,
    setVehicleYear,
    vehicleVin,
    setVehicleVin,
    problemDescription,
    setProblemDescription,
    serviceAddress,
    setServiceAddress,
    serviceLatitude,
    setServiceLatitude,
    serviceLongitude,
    setServiceLongitude,
    preferredDate,
    setPreferredDate,
    preferredTimeSlot,
    setPreferredTimeSlot,
    isScheduled,
    setIsScheduled,
    showSuccessModal,
    setShowSuccessModal,
    successOrderId,
    setSuccessOrderId,
    successMessage,
    setSuccessMessage,
    currentStep,
    setCurrentStep,
  };
};
