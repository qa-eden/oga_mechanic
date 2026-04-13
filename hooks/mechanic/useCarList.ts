import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  userAPI,
  type UserVehicle,
  getUserVehiclePrimaryImageUrl,
} from "@/lib/api/user";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  displayName: string;
  plateNumber: string;
  /** First / primary vehicle photo from API */
  imageUri: string | null;
  make_id?: string;
  model_id?: string;
}

interface CarOption {
  label: string;
  value: string;
  imageUri?: string | null;
}

interface UseCarListReturn {
  carList: Car[];
  carOptions: CarOption[];
  hasCarList: boolean;
  selectedCarData: (selectedCarId: string) => Car | null;
  /** True while GET /users/my-vehicles/ is in flight */
  isLoading: boolean;
  isError: boolean;
}

function mapUserVehicleToCar(v: UserVehicle): Car {
  const make = String(v.make ?? "").trim();
  const model = String(v.model ?? "").trim();
  const year =
    typeof v.year === "number" && !Number.isNaN(v.year)
      ? v.year
      : parseInt(String(v.year ?? ""), 10) || 0;
  const plate = v.license_plate != null ? String(v.license_plate).trim() : "";
  const displayName =
    [make, model, year > 0 ? year : null].filter(Boolean).join(" ").trim() || "Vehicle";
  return {
    id: String(v.id),
    make,
    model,
    year,
    displayName,
    plateNumber: plate,
    imageUri: getUserVehiclePrimaryImageUrl(v),
  };
}

/**
 * Saved vehicles for find-mechanic / order flows (GET /users/my-vehicles/).
 */
export const useCarList = (): UseCarListReturn => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userCars"],
    queryFn: () => userAPI.getCars(),
    staleTime: 2 * 60 * 1000,
  });

  const carList = useMemo(() => (Array.isArray(data) ? data.map(mapUserVehicleToCar) : []), [data]);

  const hasCarList = carList.length > 0;

  const carOptions = useMemo(
    () =>
      carList.map((car) => ({
        label: car.displayName,
        value: car.id,
        imageUri: car.imageUri,
      })),
    [carList]
  );

  const selectedCarData = useCallback(
    (selectedCarId: string): Car | null => {
      if (!selectedCarId || !hasCarList) return null;
      return carList.find((car) => car.id === selectedCarId) || null;
    },
    [carList, hasCarList]
  );

  return {
    carList,
    carOptions,
    hasCarList,
    selectedCarData,
    isLoading,
    isError,
  };
};
