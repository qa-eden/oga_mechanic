import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api/products';

// Query keys for orders
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (merchantId: string) => [...orderKeys.lists(), merchantId] as const,
};

// Order interfaces based on actual API response
export interface OrderItem {
  id: number;
  product: {
    id: string;
    merchant_id: string;
    merchant_email: string;
    category: {
      id: number;
      name: string;
      sub_categories: any[];
      description: string;
      created_at: string;
      updated_at: string;
    };
    name: string;
    make: string | null;
    model: string | null;
    year: number | null;
    condition: string;
    body_type: string;
    price: string;
    currency: string;
    negotiable: boolean;
    availability: string;
    stock: number;
    is_rental: boolean;
    description: string;
    images: Array<{
      id: number;
      image: string;
      ordering: number;
      created_at: string;
    }>;
    created_at: string;
    updated_at: string;
    rating: number | null;
    merchant_rating: number;
  };
  quantity: number;
  price: string;
}

export interface Order {
  id: string;
  status: string;
  total_amount: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrdersResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: Order[];
}

// Hook to get merchant orders
export const useMerchantOrders = (merchantId: string) => {
  return useQuery<OrdersResponse, Error>({
    queryKey: orderKeys.list(merchantId),
    queryFn: () => productsAPI.getMerchantOrders(merchantId),
    enabled: !!merchantId, // Only run query if merchantId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: true, // Only refetch when connection is restored
  });
};
