import api from '../axios';
import { SERVICE_ENDPOINTS, MECHANIC_ENDPOINTS } from '../endpoints';

// Types
export interface CarDetails {
  carSelection: 'Yes' | 'No';
  selectedCar?: string;
  carModel?: string;
  carYear?: string;
  address: string;
  carIssue: string;
}

export interface RepairRequestPayload {
  mechanic_id: string;
  service_type: string;
  vehicle_model: string;
  vehicle_year: number;
  problem_description: string;
  service_address: string;
  service_latitude?: number;
  service_longitude?: number;
  preferred_date?: string;
  preferred_time_slot?: string;
  notes?: string;
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

  // Get mechanic details (new endpoint)
  getMechanicDetail: async (mechanicId: string): Promise<any> => {
    console.log('🔧 Fetching mechanic detail for ID:', mechanicId);
    const response = await api.get(SERVICE_ENDPOINTS.MECHANIC_DETAIL(mechanicId));
    console.log('✅ Mechanic detail response:', response.data);
    return response.data;
  },

  // Get nearby mechanics
  getNearbyMechanics: async (latitude: number, longitude: number, radius: number = 10): Promise<Mechanic[]> => {
    const response = await api.get(SERVICE_ENDPOINTS.MECHANICS_NEARBY, {
      params: { lat: latitude, lng: longitude, radius }
    });
    return response.data;
  },

  // Get all available mechanics
  getAvailableMechanics: async (): Promise<Mechanic[]> => {
    const response = await api.get(SERVICE_ENDPOINTS.MECHANICS_AVAILABLE);
    return response.data;
  },

  // Book mechanic
  bookMechanic: async (mechanicId: string, bookingDetails: any): Promise<any> => {
    const response = await api.post(SERVICE_ENDPOINTS.MECHANIC_PROFILE(mechanicId), bookingDetails);
    return response.data;
  },

  createRepairRequest: async (payload: RepairRequestPayload): Promise<any> => {
    const response = await api.post(MECHANIC_ENDPOINTS.REPAIR_REQUESTS, payload);
    return response.data;
  },

  // Get mechanic reviews
  getMechanicReviews: async (mechanicId: string): Promise<any[]> => {
    const response = await api.get(SERVICE_ENDPOINTS.MECHANIC_REVIEWS(mechanicId));
    return response.data;
  },

  // Get repair requests for mechanic
  getRepairRequests: async (): Promise<any> => {
    // Use axios instance - it will handle redirects properly (maxRedirects: 1)
    const response = await api.get(MECHANIC_ENDPOINTS.REPAIR_REQUESTS);
    return response.data;
  },

  // Accept repair request
  acceptRepairRequest: async (requestId: string): Promise<any> => {
    const response = await api.post(`${MECHANIC_ENDPOINTS.REPAIR_REQUESTS}${requestId}/accept/`);
    return response.data;
  },

  // Decline repair request
  declineRepairRequest: async (requestId: string): Promise<any> => {
    const response = await api.post(`${MECHANIC_ENDPOINTS.REPAIR_REQUESTS}${requestId}/decline/`);
    return response.data;
  },

  // Get mechanic analytics
  getMechanicAnalytics: async (): Promise<any> => {
    const response = await api.get(MECHANIC_ENDPOINTS.ANALYTICS);
    return response.data;
  }
};
