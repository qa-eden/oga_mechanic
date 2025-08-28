import api from '../axios';
import { SERVICE_ENDPOINTS } from '../endpoints';

// Types
export interface CarDetails {
  carSelection: 'Yes' | 'No';
  selectedCar?: string;
  carModel?: string;
  carYear?: string;
  address: string;
  carIssue: string;
}

export interface Mechanic {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialties: string[];
  hourlyRate: number;
  availability: boolean;
  profileImage: string;
}

export interface FindMechanicResponse {
  mechanics: Mechanic[];
  total: number;
  message: string;
}

// API Functions
export const mechanicAPI = {
  // Find mechanics based on car details
  findMechanic: async (carDetails: CarDetails): Promise<FindMechanicResponse> => {
    const response = await api.post(SERVICE_ENDPOINTS.MECHANICS_FIND, carDetails);
    return response.data;
  },

  // Get mechanic profile
  getMechanicProfile: async (mechanicId: string): Promise<Mechanic> => {
    const response = await api.get(SERVICE_ENDPOINTS.MECHANIC_PROFILE(mechanicId));
    return response.data;
  },

  // Get nearby mechanics
  getNearbyMechanics: async (latitude: number, longitude: number, radius: number = 10): Promise<Mechanic[]> => {
    const response = await api.get(SERVICE_ENDPOINTS.MECHANICS_NEARBY, {
      params: { lat: latitude, lng: longitude, radius }
    });
    return response.data;
  },

  // Book mechanic
  bookMechanic: async (mechanicId: string, bookingDetails: any): Promise<any> => {
    const response = await api.post(SERVICE_ENDPOINTS.MECHANIC_PROFILE(mechanicId), bookingDetails);
    return response.data;
  },

  // Get mechanic reviews
  getMechanicReviews: async (mechanicId: string): Promise<any[]> => {
    const response = await api.get(SERVICE_ENDPOINTS.MECHANIC_REVIEWS(mechanicId));
    return response.data;
  }
};
