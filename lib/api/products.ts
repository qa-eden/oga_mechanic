import api from '../axios';
import { SERVICE_ENDPOINTS, MERCHANT_ENDPOINTS } from '../endpoints';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  description?: string;
  inStock: boolean;
  discount?: number;
}

export interface HomeProductsResponse {
  data: {
    mechanics: any[];
    best_selling_cars: any[];
    best_selling_spare_parts: any[];
  };
  message?: string;
  status?: boolean;
  requestTime?: string;
  requestType?: string;
  referenceId?: string;
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  price: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  images: Array<{
    id: number;
    image: string;
  }>;
  merchant: string | {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    active_role: string;
    date_joined: string;
    last_login: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
    car_make?: string;
    car_model?: string;
    car_year?: string;
    license_plate?: string;
  };
  is_rental: boolean;
  stock?: number;
  rating?: number;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    user_name: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Complete API response wrapper
export interface ProductDetailAPIResponse {
  data: ProductDetailResponse;
  message: string;
  referenceId: string;
  requestTime: string;
  requestType: string;
  status: boolean;
}

// Product List Response
export interface ProductListResponse {
  id: string;
  name: string;
  price: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  images: Array<{
    id: number;
    image: string;
  }>;
  merchant: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    active_role: string;
    date_joined: string;
    last_login: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
  };
  is_rental: boolean;
  stock: number;
  rating: number;
  merchant_rating: number;
  purchased_count: number;
  is_in_cart: boolean;
  created_at: string;
  updated_at: string;
}

// Paginated response structure
export interface ProductListAPIResponse {
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProductListResponse[];
  };
  message: string;
  referenceId: string;
  requestTime: string;
  requestType: string;
  status: boolean;
}

// Category Response
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  id: string;
  quantity: number;
  added_at?: string;
  product?: {
    id: string;
    name: string;
    price: string;
    images: Array<{ id: number; image: string }>;
    stock: number;
    original_price?: string;
    discount?: number;
  };
}

export interface CartResponse {
  data: {
    id: number;
    user: string;
    items?: CartItem[];
    total_price?: number; // From actual API response
    created_at?: string;
    updated_at?: string;
    // Add other cart fields as needed
  };
  message: string;
  referenceId: string;
  requestTime: string;
  requestType: string;
  status: boolean;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface AddToCartResponse {
  data: {
    product_id: string;
    quantity: number;
  };
  message: string;
  status: boolean;
}

export interface UpdateCartItemRequest {
  requestType: string;
  data: {
    product_id: string;
    action: "increment" | "decrement";
  };
}

export interface UpdateCartItemResponse {
  data: {
    product_id: string;
    quantity: number;
  };
  message: string;
  referenceId: string;
  requestTime: string;
  requestType: string;
  status: boolean;
}

export interface CategoriesAPIResponse {
  data: CategoryResponse[];
  message: string;
  referenceId: string;
  requestTime: string;
  requestType: string;
  status: boolean;
}

// Merchant Analytics Types
export interface MerchantAnalytics {
  total_sales: number;
  total_orders: number;
  total_products: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  top_selling_products: Array<{
    id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  recent_orders: Array<{
    id: string;
    product_name: string;
    order_date: string;
    price: number;
    status: string;
  }>;
  sales_by_period: Array<{
    period: string;
    sales: number;
    orders: number;
  }>;
  customer_ratings: Array<{
    stars: number;
    count: number;
    percentage: number;
    color: string;
  }>;
}

export interface MerchantAnalyticsResponse {
  data: MerchantAnalytics;
  message: string;
  referenceId: string;
  requestTime: string;
  requestType: string;
  status: boolean;
}

// API Functions
export const productsAPI = {
  // Get home products (cars and spare parts)
  getHomeProducts: async (): Promise<HomeProductsResponse> => {
    const response = await api.get(SERVICE_ENDPOINTS.PRODUCTS_HOME);
    return response.data;
  },
  
  // Get product detail by ID
  getProductDetail: async (id: string): Promise<ProductDetailResponse> => {
    console.log('🔍 Fetching product detail for ID:', id);
    console.log('🔍 Trying shop endpoint first:', SERVICE_ENDPOINTS.SHOP_PRODUCT_DETAIL(id));
    
    try {
      // Try shop endpoint first
      const response = await api.get<ProductDetailAPIResponse>(SERVICE_ENDPOINTS.SHOP_PRODUCT_DETAIL(id));
      console.log('✅ Shop product detail response:', response.data);
      return response.data.data; // Extract the data field from the API response
    } catch (shopError) {
      console.log('❌ Shop endpoint failed, trying products endpoint:', SERVICE_ENDPOINTS.PRODUCT_DETAIL(id));
      try {
        // Fallback to products endpoint
        const response = await api.get<ProductDetailAPIResponse>(SERVICE_ENDPOINTS.PRODUCT_DETAIL(id));
        console.log('✅ Products endpoint response:', response.data);
        return response.data.data; // Extract the data field from the API response
      } catch (productsError) {
        console.error('❌ Both endpoints failed:', { shopError, productsError });
        throw productsError; // Throw the last error
      }
    }
  },

  // Get all products
  getProducts: async (
    categoryId?: number | null,
    minPrice?: string,
    maxPrice?: string,
    offset?: number,
    limit?: number
  ): Promise<ProductListAPIResponse> => {
    const params = new URLSearchParams();
    if (categoryId) {
      params.append('category', categoryId.toString());
    }
    if (minPrice && minPrice.trim()) {
      params.append('min_price', minPrice);
    }
    if (maxPrice && maxPrice.trim()) {
      params.append('max_price', maxPrice);
    }
    if (offset !== undefined) {
      params.append('offset', offset.toString());
    }
    if (limit !== undefined) {
      params.append('limit', limit.toString());
    }
    
    const url = params.toString() 
      ? `${SERVICE_ENDPOINTS.PRODUCTS_LIST}?${params.toString()}`
      : SERVICE_ENDPOINTS.PRODUCTS_LIST;
    
    const response = await api.get<ProductListAPIResponse>(url);
    console.log('🛍️ Products API response:', response.data);
    return response.data; // Return full paginated response
  },

  // Search products
  searchProducts: async (
    query: string, 
    categoryId?: number | null, 
    minPrice?: string, 
    maxPrice?: string
  ): Promise<ProductListResponse[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (categoryId) {
      params.append('category', categoryId.toString());
    }
    if (minPrice && minPrice.trim()) {
      params.append('min_price', minPrice);
    }
    if (maxPrice && maxPrice.trim()) {
      params.append('max_price', maxPrice);
    }
    
    const response = await api.get<any>(
      `${SERVICE_ENDPOINTS.PRODUCTS_SEARCH}?${params.toString()}`
    );
    console.log('🔍 Search API response:', response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data.data)) {
      // Direct array response
      return response.data.data;
    } else if (response.data.data && Array.isArray(response.data.data.results)) {
      // Paginated response
      return response.data.data.results;
    } else {
      // Fallback to empty array
      console.log('🔍 No search results found');
      return [];
    }
  },

  // Get all categories
  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoriesAPIResponse>(SERVICE_ENDPOINTS.PRODUCTS_CATEGORIES);
    return response.data.data;
  },

  // Cart API functions
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>(SERVICE_ENDPOINTS.CART);
    console.log('🛒 Cart API response:', response.data);
    return response.data;
  },

  addToCart: async (productId: string, quantity: number): Promise<AddToCartResponse> => {
    const payload: AddToCartRequest = {
      product_id: productId,
      quantity: quantity
    };
    const response = await api.post<AddToCartResponse>(SERVICE_ENDPOINTS.CART, payload);
    console.log('➕ Add to cart API response:', response.data);
    return response.data;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<AddToCartResponse> => {
    const payload = {
      quantity: quantity
    };
    const response = await api.put<AddToCartResponse>(`${SERVICE_ENDPOINTS.CART}/${itemId}`, payload);
    console.log('✏️ Update cart item API response:', response.data);
    return response.data;
  },

  removeFromCart: async (productId: string): Promise<{ message: string; status: boolean }> => {
    const response = await api.delete<{ message: string; status: boolean }>(`${SERVICE_ENDPOINTS.CART}?product_id=${productId}`);
    console.log('🗑️ Remove from cart API response:', response.data);
    return response.data;
  },

  updateCartItemQuantity: async (productId: string, action: "increment" | "decrement"): Promise<UpdateCartItemResponse> => {
    const payload = {
      product_id: productId,
      action: action
    };
    const response = await api.patch<UpdateCartItemResponse>(SERVICE_ENDPOINTS.CART, payload);
    console.log(`🔄 ${action} cart item API response:`, response.data);
    return response.data;
  },

  // Add product to favorites
  addToFavorites: async (productId: string): Promise<{ message: string; status: boolean }> => {
    console.log('❤️ addToFavorites API called with productId:', productId);
    console.log('❤️ Using endpoint:', SERVICE_ENDPOINTS.FAVORITE_PRODUCT);
    
    const payload = {
      product_id: productId
    };
    console.log('❤️ Payload being sent:', payload);
    
    const response = await api.post<{ message: string; status: boolean }>(SERVICE_ENDPOINTS.FAVORITE_PRODUCT, payload);
    console.log('❤️ Add to favorites API response:', response.data);
    return response.data;
  },

  // Remove product from favorites
  removeFromFavorites: async (productId: string): Promise<{ message: string; status: boolean }> => {
    console.log('💔 removeFromFavorites API called with productId:', productId);
    console.log('💔 Using endpoint:', `${SERVICE_ENDPOINTS.FAVORITE_PRODUCT}?product_id=${productId}`);
    
    const response = await api.delete<{ message: string; status: boolean }>(`${SERVICE_ENDPOINTS.FAVORITE_PRODUCT}?product_id=${productId}`);
    console.log('💔 Remove from favorites API response:', response.data);
    return response.data;
  },

  // Toggle favorite (add if not favorited, remove if favorited)
  toggleFavorite: async (productId: string, isCurrentlyFavorited: boolean): Promise<{ message: string; status: boolean }> => {
    console.log('🔄 toggleFavorite called - productId:', productId, 'isCurrentlyFavorited:', isCurrentlyFavorited);
    
    if (isCurrentlyFavorited) {
      return await productsAPI.removeFromFavorites(productId);
    } else {
      return await productsAPI.addToFavorites(productId);
    }
  },

  // Checkout with payment method
  checkout: async (paymentMethod: string): Promise<{ message: string; status: boolean; data?: any }> => {
    console.log('🔄 checkout called - paymentMethod:', paymentMethod);
    
    const response = await api.post(SERVICE_ENDPOINTS.CHECKOUT, {
      payment_method: paymentMethod
    });
    
    console.log('✅ checkout response:', response.data);
    return response.data;
  },

  // Get merchant analytics
  getMerchantAnalytics: async (): Promise<MerchantAnalytics> => {
    console.log('📊 Fetching merchant analytics...');
    
    const response = await api.get<MerchantAnalyticsResponse>(MERCHANT_ENDPOINTS.ANALYTICS);
    console.log('📊 Merchant analytics response:', response.data);
    
    return response.data.data;
  },
};
