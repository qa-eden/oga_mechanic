import { useState, useEffect } from 'react';
import { mechanicAPI, ServiceType } from '../lib/api/mechanic';

export const useServiceTypes = () => {
  const [serviceTypes, setServiceTypes] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mechanicAPI.getServiceTypes();
      
      if (response.results && response.results.length > 0) {
        const formattedOptions = response.results.map((service: ServiceType) => {
          const vehicleInfo = service.vehicle_make_name && service.vehicle_model_name 
            ? `${service.vehicle_make_name} - ${service.vehicle_model_name}`
            : service.vehicle_make_name 
            ? `${service.vehicle_make_name} - All Models`
            : 'All Models';
          
          return {
            label: `${service.name} (${vehicleInfo})`,
            value: service.id
          };
        });
        setServiceTypes(formattedOptions);
      } else {
        setError('No service types available');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch service types');
      console.error('Error fetching service types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  return {
    serviceTypes,
    loading,
    error,
    refetch: fetchServiceTypes
  };
};
