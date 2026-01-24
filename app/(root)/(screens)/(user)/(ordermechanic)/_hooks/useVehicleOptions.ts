import { useMemo, useCallback } from 'react';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';

interface SelectOption {
  label: string;
  value: string;
}

interface UseVehicleOptionsReturn {
  vehicleMakeOptions: SelectOption[];
  vehicleModelOptions: SelectOption[];
  vehicleYearOptions: SelectOption[];
  vehicleMakesLoading: boolean;
  getModelsForMake: (makeId: string) => SelectOption[];
}

/**
 * Custom hook to manage vehicle make/model/year options
 * Fetches vehicle makes from API and generates select options
 */
export const useVehicleOptions = (selectedMakeId?: string): UseVehicleOptionsReturn => {
  const { data: vehicleMakes, loading: vehicleMakesLoading } = useVehicleMakes();

  // Convert vehicle makes to select options
  const vehicleMakeOptions = useMemo(() => {
    if (!vehicleMakes || vehicleMakes.length === 0) return [];

    return vehicleMakes
      .filter((make) => make.is_active)
      .map((make) => ({
        label: make.name,
        value: make.id.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [vehicleMakes]);

  // Get models for a specific make
  const getModelsForMake = useCallback(
    (makeId: string): SelectOption[] => {
      if (!makeId || !vehicleMakes) return [];
      const selectedMake = vehicleMakes.find((make) => make.id.toString() === makeId);
      if (!selectedMake?.models) return [];

      return selectedMake.models
        .filter((model) => model.is_active)
        .map((model) => ({
          label: model.name,
          value: model.id.toString(),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    [vehicleMakes]
  );

  // Map models for selected make to options
  const vehicleModelOptions = useMemo(() => {
    if (!selectedMakeId) return [];
    return getModelsForMake(selectedMakeId);
  }, [selectedMakeId, getModelsForMake]);

  // Generate year options (current year to 50 years ago)
  const vehicleYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => {
      const year = currentYear - i;
      return {
        label: year.toString(),
        value: year.toString(),
      };
    });
  }, []);

  return {
    vehicleMakeOptions,
    vehicleModelOptions,
    vehicleYearOptions,
    vehicleMakesLoading,
    getModelsForMake,
  };
};
