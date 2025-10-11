import { useState, useEffect } from 'react';
import { productsAPI, VehicleMake } from '@/lib/api/products';

export const useVehicleMakes = () => {
  const [data, setData] = useState<VehicleMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleMakes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getVehicleMakes();
        setData(response);
      } catch (err) {
        console.error('Error fetching vehicle makes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicle makes');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleMakes();
  }, []);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    setError(null);
    productsAPI.getVehicleMakes()
      .then(setData)
      .catch(err => {
        console.error('Error refetching vehicle makes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicle makes');
      })
      .finally(() => setLoading(false));
  }};
};
