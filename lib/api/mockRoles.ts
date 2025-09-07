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
    description: 'Access all services as a customer',
    icon: 'user',
    color: '#3B82F6',
    route: '/register/user/step1'
  },
  {
    id: 2,
    name: 'merchant',
    title: 'Seller',
    description: 'Sell products and manage your shop',
    icon: 'shop',
    color: '#10B981',
    route: '/register/merchant/step1'
  },
  {
    id: 3,
    name: 'mechanic',
    title: 'Mechanic',
    description: 'Provide mechanical services',
    icon: 'wrench',
    color: '#F59E0B',
    route: '/register/mechanic/step1'
  },
  {
    id: 4,
    name: 'driver',
    title: 'Driver',
    description: 'Provide transportation services',
    icon: 'car',
    color: '#EF4444',
    route: '/register/driver/step1'
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
