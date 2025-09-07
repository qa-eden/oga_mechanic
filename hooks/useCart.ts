import { useState, useCallback } from 'react';
import { cartAPI, AddToCartRequest, CartItem } from '../lib/api/cart';
import { useCustomAlert } from './useCustomAlert';
import { getErrorMessage, getSuccessMessage } from '../utils/errorMessages';

export const useCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showAlert } = useCustomAlert();

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      setIsLoading(true);
      const response = await cartAPI.addToCart(productId, quantity);
      
      if (response.status) {
        showAlert('Success', getSuccessMessage('cart_add'), 'success');
        // Optionally refresh cart items
        await getCartItems();
        return { success: true, data: response.data };
      } else {
        showAlert('Error', getErrorMessage({ response }, 'cart'), 'error');
        return { success: false, error: getErrorMessage({ response }, 'cart') };
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = getErrorMessage(error, 'cart');
      showAlert('Error', errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // Get cart items
  const getCartItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      
      if (response.status) {
        setCartItems(response.data);
        return { success: true, data: response.data };
      } else {
        showAlert('Error', 'Failed to load cart items', 'error');
        return { success: false, error: 'Failed to load cart items' };
      }
    } catch (error: any) {
      console.error('Get cart error:', error);
      showAlert('Error', error.message || 'Failed to load cart items', 'error');
      return { success: false, error: error.message || 'Failed to load cart items' };
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const response = await cartAPI.updateCartItem(productId, quantity);
      
      if (response.status) {
        showAlert('Success', 'Cart updated successfully!', 'success');
        await getCartItems();
        return { success: true, data: response.data };
      } else {
        showAlert('Error', 'Failed to update cart item', 'error');
        return { success: false, error: 'Failed to update cart item' };
      }
    } catch (error: any) {
      console.error('Update cart error:', error);
      showAlert('Error', error.message || 'Failed to update cart item', 'error');
      return { success: false, error: error.message || 'Failed to update cart item' };
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, getCartItems]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      const response = await cartAPI.removeFromCart(productId);
      
      if (response.status) {
        showAlert('Success', 'Item removed from cart!', 'success');
        await getCartItems();
        return { success: true, data: response.data };
      } else {
        showAlert('Error', 'Failed to remove item from cart', 'error');
        return { success: false, error: 'Failed to remove item from cart' };
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      showAlert('Error', error.message || 'Failed to remove item from cart', 'error');
      return { success: false, error: error.message || 'Failed to remove item from cart' };
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, getCartItems]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.clearCart();
      
      if (response.status) {
        showAlert('Success', 'Cart cleared successfully!', 'success');
        setCartItems([]);
        return { success: true, data: response.data };
      } else {
        showAlert('Error', 'Failed to clear cart', 'error');
        return { success: false, error: 'Failed to clear cart' };
      }
    } catch (error: any) {
      console.error('Clear cart error:', error);
      showAlert('Error', error.message || 'Failed to clear cart', 'error');
      return { success: false, error: error.message || 'Failed to clear cart' };
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  // Check if item is in cart
  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.product_id === productId);
  }, [cartItems]);

  // Get item quantity in cart
  const getItemQuantity = useCallback((productId: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Get total cart items count
  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Get total cart value
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price ? parseFloat(item.product.price) : 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  return {
    // State
    isLoading,
    cartItems,
    
    // Actions
    addToCart,
    getCartItems,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Helpers
    isInCart,
    getItemQuantity,
    getCartItemsCount,
    getCartTotal,
  };
};
