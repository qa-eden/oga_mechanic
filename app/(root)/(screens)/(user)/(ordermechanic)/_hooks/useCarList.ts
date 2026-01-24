import { useMemo } from 'react';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  displayName: string;
  plateNumber: string;
  make_id?: string;
  model_id?: string;
}

interface CarOption {
  label: string;
  value: string;
}

interface UseCarListReturn {
  carList: Car[];
  carOptions: CarOption[];
  hasCarList: boolean;
  selectedCarData: (selectedCarId: string) => Car | null;
}

/**
 * Custom hook to manage car list data and options
 * TODO: Replace dummy data with actual API call when endpoint is available
 * const { data: carListData } = useQuery({ queryKey: ['userCars'], queryFn: userAPI.getCars });
 */
export const useCarList = (): UseCarListReturn => {
  // Dummy car list data - replace with API call
  const carList: Car[] = [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      displayName: 'Toyota Camry 2020',
      plateNumber: 'ABC-123',
      make_id: '1',
      model_id: '1',
    },
  ];

  // Check if car list has data
  const hasCarList = carList && carList.length > 0;

  // Generate car options from car list
  const carOptions = useMemo(
    () =>
      carList.map((car) => ({
        label: car.displayName,
        value: car.id,
      })),
    [carList]
  );

  // Function to get selected car details
  const selectedCarData = (selectedCarId: string): Car | null => {
    if (!selectedCarId || !hasCarList) return null;
    return carList.find((car) => car.id === selectedCarId) || null;
  };

  return {
    carList,
    carOptions,
    hasCarList,
    selectedCarData,
  };
};
