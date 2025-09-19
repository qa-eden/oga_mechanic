import { driverRoutes, mechanicRoutes, routes, sellerRoutes } from "@/constants/routes";

// Mock roles data for development
export interface Role {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export const mockRoles: Role[] = [
  {
    id: 1,
    name: 'primary_user',
    title: 'Primary User',
    description: 'I want to buy',
    icon: 'user',
    color: '#3B82F6',
    route: routes.userStep1
  },
  {
    id: 2,
    name: 'merchant',
    title: 'Seller',
    description: 'I want to sell',
    icon: 'shop',
    color: '#10B981',
    route: sellerRoutes.step1
  },
  {
    id: 3,
    name: 'mechanic',
    title: 'Mechanic',
    description: 'I want to Offer Services',
    icon: 'wrench',
    color: '#F59E0B',
    route: mechanicRoutes.step1
  },
  {
    id: 4,
    name: 'driver',
    title: 'Driver',
    description: 'I want to Drive',
    icon: 'car',
    color: '#EF4444',
    route: driverRoutes.step1
  }
];

// Mock API service
export const mockRolesAPI = {
  getRoles: async (): Promise<Role[]> => {
    console.log('🔍 Using mock roles data for development');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Mock roles loaded:', mockRoles.length, 'roles');
    return mockRoles;
  }
};
