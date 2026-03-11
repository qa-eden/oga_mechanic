import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, CartResponse, AddToCartRequest, UpdateCartItemRequest, UpdateCartItemResponse } from '@/lib/api/products';
import { productKeys } from './useProducts';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'cart'] as const,
};

/**
 * Helper function to invalidate both cart and product queries.
 * This ensures that product detail pages show the correct "is_in_cart" status
 * after cart modifications.
 */
const invalidateCartAndProducts = (queryClient: ReturnType<typeof useQueryClient>) => {
  // Invalidate cart data
  queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
  // Invalidate all product queries to refresh is_in_cart status
  queryClient.invalidateQueries({ queryKey: productKeys.all });
};

// Get cart data
export const useCart = () => {
  return useQuery<CartResponse, Error>({
    queryKey: cartKeys.cart(),
    queryFn: () => productsAPI.getCart(),
    staleTime: 60 * 1000, // 1 minute - cart data shouldn't change instantly unless mutated
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 2, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnMount: false, // Don't refetch on mount if data exists and is fresh
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });
};

// Add to cart mutation
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      productsAPI.addToCart(productId, quantity),
    onSuccess: () => {
      // Invalidate cart and product queries to sync is_in_cart status
      invalidateCartAndProducts(queryClient);
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
    },
  });
};

// Update cart item mutation
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      productsAPI.updateCartItem(itemId, quantity),
    onSuccess: () => {
      // Invalidate cart and product queries
      invalidateCartAndProducts(queryClient);
    },
    onError: (error) => {
      console.error('Update cart item error:', error);
    },
  });
};

// Remove from cart mutation
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsAPI.removeFromCart(productId),
    onSuccess: () => {
      // Invalidate cart and product queries to sync is_in_cart status
      invalidateCartAndProducts(queryClient);
    },
    onError: (error) => {
      console.error('Remove from cart error:', error);
    },
  });
};

// Update cart item quantity (increment/decrement) mutation
export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, action }: { productId: string; action: "increment" | "decrement" }) =>
      productsAPI.updateCartItemQuantity(productId, action),
    onSuccess: () => {
      // Invalidate cart and product queries
      invalidateCartAndProducts(queryClient);
    },
    onError: (error) => {
      console.error('Update cart item quantity error:', error);
    },
  });
};