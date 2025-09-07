import api from '../axios';
import { SERVICE_ENDPOINTS } from '../endpoints';

// Types
export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface AddToCartResponse {
  data: {
    product_id: string;
    quantity: number;
  };
  message?: string;
  status?: boolean;
  requestTime?: string;
  requestType?: string;
  referenceId?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: string;
    images?: Array<{
      id: number;
      image: string;
    }>;
  };
}

export interface GetCartResponse {
  data: CartItem[];
  message?: string;
  status?: boolean;
  requestTime?: string;
  requestType?: string;
  referenceId?: string;
}

// Cart API Functions
export const cartAPI = {
  // Add item to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<AddToCartResponse> => {
    const payload: AddToCartRequest = {
      product_id: productId,
      quantity: quantity
    };
    
    const response = await api.post<AddToCartResponse>(SERVICE_ENDPOINTS.ADD_TO_CART, payload);
    return response.data;
  },

  // Get cart items
  getCart: async (): Promise<GetCartResponse> => {
    try {
      const response = await api.get<GetCartResponse>(SERVICE_ENDPOINTS.GET_CART);
      console.log('🛒 Raw cart API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cart API error:', error);
      // Return empty cart structure on error
      return {
        data: [],
        message: 'Cart is empty',
        status: true,
        requestTime: new Date().toISOString(),
        requestType: 'outbound',
        referenceId: 'error'
      };
    }
  },

  // Update cart item quantity
  updateCartItem: async (productId: string, quantity: number): Promise<AddToCartResponse> => {
    const payload: AddToCartRequest = {
      product_id: productId,
      quantity: quantity
    };
    
    const response = await api.put<AddToCartResponse>(SERVICE_ENDPOINTS.UPDATE_CART_ITEM, payload);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId: string): Promise<AddToCartResponse> => {
    const response = await api.delete<AddToCartResponse>(`${SERVICE_ENDPOINTS.REMOVE_FROM_CART}/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<AddToCartResponse> => {
    const response = await api.delete<AddToCartResponse>(SERVICE_ENDPOINTS.CLEAR_CART);
    return response.data;
  }
};
