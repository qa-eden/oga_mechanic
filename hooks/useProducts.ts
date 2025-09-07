import { useQuery } from '@tanstack/react-query';
import { productsAPI, HomeProductsResponse, ProductDetailResponse, ProductListResponse, CategoryResponse } from '../lib/api/products';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  home: () => [...productKeys.all, 'home'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  search: (query: string, category?: string) => [...productKeys.all, 'search', query, category] as const,
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

export const useProducts = () => {
  return useQuery<ProductListResponse[], Error>({
    queryKey: productKeys.list(),
    queryFn: () => productsAPI.getProducts(),
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
  return useQuery<ProductListResponse[], Error>({
    queryKey: productKeys.search(query, categoryId?.toString(), minPrice, maxPrice),
    queryFn: () => productsAPI.searchProducts(query, categoryId, minPrice, maxPrice),
    enabled: enabled && query.trim().length > 0, // Only run if query is provided and enabled
    staleTime: 2 * 60 * 1000, // 2 minutes (search results can be more dynamic)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
