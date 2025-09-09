import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, CartResponse, AddToCartRequest, UpdateCartItemRequest, UpdateCartItemResponse } from '@/lib/api/products';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'cart'] as const,
};

// Get cart data
export const useCart = () => {
  return useQuery<CartResponse, Error>({
    queryKey: cartKeys.cart(),
    queryFn: () => productsAPI.getCart(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Add to cart mutation
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      productsAPI.addToCart(productId, quantity),
    onSuccess: () => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
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
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
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
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
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
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Update cart item quantity error:', error);
    },
  });
};