import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, HomeProductsResponse, ProductDetailResponse, ProductListResponse, CategoryResponse, ProductListAPIResponse } from '../lib/api/products';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  home: () => [...productKeys.all, 'home'] as const,
  list: (categoryId?: string, minPrice?: string, maxPrice?: string) => [...productKeys.all, 'list', categoryId, minPrice, maxPrice] as const,
  search: (query: string, category?: string, minPrice?: string, maxPrice?: string) => [...productKeys.all, 'search', query, category, minPrice, maxPrice] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

// Hooks
export const useHomeProducts = () => {
  return useQuery<HomeProductsResponse, Error>({
    queryKey: productKeys.home(),
    queryFn: () => productsAPI.getHomeProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductDetail = (id: string) => {
  return useQuery<ProductDetailResponse, Error>({
    queryKey: productKeys.detail(id),
    queryFn: () => productsAPI.getProductDetail(id),
    enabled: !!id, // Only run query if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProducts = (
  categoryId?: number | null,
  minPrice?: string,
  maxPrice?: string
) => {
  return useQuery<ProductListResponse[], Error>({
    queryKey: productKeys.list(categoryId?.toString(), minPrice, maxPrice),
    queryFn: () => productsAPI.getProducts(categoryId, minPrice, maxPrice).then(response => response.data.results),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductsInfinite = (
  categoryId?: number | null,
  minPrice?: string,
  maxPrice?: string,
  limit: number = 20,
  enabled: boolean = true
) => {
  return useInfiniteQuery<ProductListAPIResponse, Error>({
    queryKey: productKeys.list(categoryId?.toString(), minPrice, maxPrice, 'infinite'),
    queryFn: ({ pageParam = 0 }) => productsAPI.getProducts(categoryId, minPrice, maxPrice, pageParam, limit),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.next) {
        // Extract offset from next URL
        const url = new URL(lastPage.data.next);
        const offset = url.searchParams.get('offset');
        return offset ? parseInt(offset, 10) : undefined;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: enabled, // Only run when enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategories = () => {
  return useQuery<CategoryResponse[], Error>({
    queryKey: productKeys.categories(),
    queryFn: () => productsAPI.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useProductSearch = (
  query: string, 
  categoryId?: number | null, 
  enabled: boolean = true,
  minPrice?: string,
  maxPrice?: string
) => {
  // Always enable the query if enabled is true, let the API handle empty queries
  return useQuery<ProductListResponse[], Error>({
    queryKey: productKeys.search(query, categoryId?.toString(), minPrice, maxPrice),
    queryFn: () => productsAPI.searchProducts(query, categoryId, minPrice, maxPrice),
    enabled: enabled, // Simple boolean value only
    staleTime: 2 * 60 * 1000, // 2 minutes (search results can be more dynamic)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Toggle favorite product mutation
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, isCurrentlyFavorited }: { productId: string; isCurrentlyFavorited: boolean }) => 
      productsAPI.toggleFavorite(productId, isCurrentlyFavorited),
    onSuccess: () => {
      // Invalidate product queries to refresh data
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      console.error('Toggle favorite error:', error);
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentMethod: string) => productsAPI.checkout(paymentMethod),
    onSuccess: () => {
      // Invalidate cart and product queries to refresh data
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      console.error('Checkout error:', error);
    },
  });
};
