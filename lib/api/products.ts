import api from '../axios';
import { SERVICE_ENDPOINTS } from '../endpoints';

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

export interface CategoriesAPIResponse {
  data: CategoryResponse[];
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
    const response = await api.get<ProductDetailAPIResponse>(SERVICE_ENDPOINTS.PRODUCT_DETAIL(id));
    return response.data.data; // Extract the data field from the API response
  },

  // Get all products
  getProducts: async (): Promise<ProductListResponse[]> => {
    const response = await api.get<ProductListAPIResponse>(SERVICE_ENDPOINTS.PRODUCTS_LIST);
    console.log('🛍️ Products API response:', response.data);
    return response.data.data.results; // Extract results from paginated response
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
};
