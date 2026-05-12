import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toastUtils';
import { productsAPI } from '../lib/api/products';
import { getErrorMessage, getApiErrorMessage, getSuccessMessage } from '../utils/errorMessages';
import { useQueryClient } from '@tanstack/react-query';
import { cartKeys, useCart as useCartQuery } from '../hooks/useCart';
import { productKeys } from '../hooks/useProducts';
import { useAuthContext } from './AuthContext';

// Types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  originalPrice?: number;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (id: string) => number;
  isInCart: (id: string) => boolean;
  cartAnimation: Animated.Value;
  triggerCartAnimation: () => void;
  syncWithServer: () => Promise<void>;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.length,
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      } else {
        // Add new item
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.length,
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, Math.min(action.payload.quantity, item.stock)) }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }
    
    case 'CLEAR_CART': {
      return initialState;
    }
    
    case 'SET_CART': {
      const items = action.payload;
      return {
        ...state,
        items,
        totalItems: items.length,
        totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const cartAnimation = useRef(new Animated.Value(1)).current;
  const bounceAnimation = useRef(new Animated.Value(1)).current;
  const { data: cartQueryData } = useCartQuery();
  const auth = useAuthContext();
  const queryClient = useQueryClient();
  const userRole = auth.userData?.role;
  // Allow all logged-in roles to use the cart for now, unless they are specifically restricted
  const isShopRole = !!auth.userData && !!userRole;

  // Cart animation function
  const triggerCartAnimation = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(cartAnimation, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cartAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Add to cart function
  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    console.log('🛒 addToCart called for:', item.id, 'User data:', auth.userData);
    
    // Server will handle role-based permissions; client-side check is too restrictive
    
    const existingItem = state.items.find(cartItem => cartItem.id.toString() === item.id.toString());
    console.log('🛒 Existing item in cart:', !!existingItem);
    
    if (existingItem && existingItem.quantity >= existingItem.stock) {
      showToast.error(`Stock limit reached! You can only add up to ${existingItem.stock} items of ${item.name}`);
      return;
    }

    try {
      console.log('🛒 Calling productsAPI.addToCart server-side...');
      // Add to server first
      const response = await productsAPI.addToCart(item.id, 1);
      console.log('🛒 Server response:', response);
      
      if (response.status) {
        // Update local state
        dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
        triggerCartAnimation();
        
        // Invalidate React Query cache to sync with useCart hook
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        
        await syncWithServer(); // Get fresh cart data as requested
        // showToast.success(getSuccessMessage('cart_add'));
      } else {
        console.log('🛒 Server update failed:', response.message);
        showToast.error(getApiErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('🛒 Add to cart error:', error);
      showToast.error(getApiErrorMessage(error, 'cart'));
    }
  };

  // Remove from cart function
  const removeFromCart = async (id: string) => {
    const item = state.items.find(item => item.id.toString() === id.toString());
    
    try {
      const response = await productsAPI.removeFromCart(id);
      
      if (response.status) {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
        
        // Invalidate React Query cache for both cart and products
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        
        // Sync with server to get fresh cart data
        await syncWithServer();
        
        showToast.success(getSuccessMessage('cart_remove'));
      } else {
        showToast.error(getApiErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      showToast.error(getApiErrorMessage(error, 'cart'));
    }
  };

  // Update quantity function
  const updateQuantity = async (id: string, quantity: number) => {
    const item = state.items.find(item => item.id.toString() === id.toString());
    const oldQuantity = item?.quantity || 0;
    
    try {
      const response = await productsAPI.updateCartItem(id, quantity);
      
      if (response.status) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
        
        // Invalidate React Query cache for both cart and products
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        
        // Sync with server to get fresh cart data
        await syncWithServer();
        
        showToast.success(getSuccessMessage('cart_update'));
      } else {
        showToast.error(getApiErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Update quantity error:', error);
      showToast.error(getApiErrorMessage(error, 'cart'));
    }
  };

  // Clear cart function
  const clearCart = async () => {
    try {
      const response = await productsAPI.clearCart();
      
      if (response.status) {
        dispatch({ type: 'CLEAR_CART' });
        
        // Invalidate React Query cache for both cart and products
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        
        // Sync with server to get fresh cart data
        await syncWithServer();
        
        showToast.success(getSuccessMessage('cart_clear'));
      } else {
        showToast.error(getApiErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Clear cart error:', error);
      showToast.error(getApiErrorMessage(error, 'cart'));
    }
  };

  // Helper for consistent mapping from various server formats
  const mapServerItems = useCallback((data: any): CartItem[] => {
    if (!data) return [];
    
    // Normalize mapping from different API structures
    let items: any[] = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data.items && Array.isArray(data.items)) { // productsAPI format
      items = data.items;
    } else if (data.data && Array.isArray(data.data)) { // nested data format
      items = data.data;
    } else if (data.data?.items && Array.isArray(data.data.items)) { // deeply nested format
      items = data.data.items;
    }

    return items
      .filter((item: any) => item && (item.id || item.product?.id || item.product_id))
      .map((item: any) => ({
        id: (item.id || item.product?.id || item.product_id).toString(),
        name: item.product?.name || item.name || 'Product',
        price: item.product?.price ? parseFloat(item.product.price) : 
               item.price ? parseFloat(item.price) : 0,
        quantity: item.quantity || 1,
        stock: item.product?.stock || item.stock || 10,
        image: item.product?.images?.[0]?.image || 
               item.images?.[0]?.image || 
               item.image,
        productId: (item.product?.id || item.product_id)?.toString(),
      }));
  }, []);

  const syncWithServer = useCallback(async () => {
    if (!isShopRole) return;
    try {
      const response = await productsAPI.getCart();
      
      console.log('🛒 Cart sync response:', response);
      
      if (response.status) {
        // Convert server cart items safely using universal mapper
        const localItems = mapServerItems(response.data);
        
        console.log('🛒 Converted cart items:', localItems);
        dispatch({ type: 'SET_CART', payload: localItems });
      } else {
        console.log('🛒 Cart sync failed - status false');
        dispatch({ type: 'SET_CART', payload: [] });
      }
    } catch (error: any) {
      console.error('❌ Sync cart error:', error);
      // Don't clear cart on error, just log it
    }
  }, [isShopRole, mapServerItems]);

  // Get item quantity
  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item.id.toString() === id.toString());
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (id: string): boolean => {
    if (!id) return false;
    return state.items.some(item => item.id.toString() === id.toString());
  };

  // Sync with server on mount
  useEffect(() => {
    // Only sync cart if user is likely authenticated and in a shop-capable role
    const checkAndSync = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
        if (isLoggedIn === 'true' && isShopRole) {
          // DISABLED: Manual sync disabled for Direct Communication model
          // syncWithServer();
        }
      } catch (error) {
        console.log('🛒 Skipping cart sync');
      }
    };

    checkAndSync();
  }, [isShopRole, syncWithServer]);

  useEffect(() => {
    // Force sync with React Query data whenever it's available
    // We remove the isShopRole guard here because if we have cart data, we should show it
    if (cartQueryData?.data) {
      console.log('🛒 Syncing CartContext with React Query data');
      const localItems = mapServerItems(cartQueryData.data);
      dispatch({ type: 'SET_CART', payload: localItems });
    }
  }, [cartQueryData, mapServerItems]);

  // Derived state for perfect consistency
  const contextState = {
    ...state,
    totalItems: state.items.length,
    totalPrice: state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  };

  return (
    <CartContext.Provider
      value={{
        state: contextState,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        isInCart,
        cartAnimation,
        triggerCartAnimation,
        syncWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 