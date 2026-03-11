import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toastUtils';
import { cartAPI } from '../lib/api/cart';
import { getErrorMessage, getSuccessMessage } from '../utils/errorMessages';
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
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      } else {
        // Add new item
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
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
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
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
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
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
  const isShopRole = userRole === 'rider' || userRole === 'primary_user';

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
    if (!isShopRole) return;
    
    const existingItem = state.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem && existingItem.quantity >= existingItem.stock) {
      showToast.error(`Stock limit reached! You can only add up to ${existingItem.stock} items of ${item.name}`);
      return;
    }

    try {
      // Add to server first
      const response = await cartAPI.addToCart(item.id, 1);
      
      if (response.status) {
        // Update local state
        dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
        triggerCartAnimation();
        
        // Invalidate React Query cache to sync with useCart hook
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        
        await syncWithServer(); // Get fresh cart data as requested
        showToast.success(getSuccessMessage('cart_add'));
      } else {
        showToast.error(getErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      showToast.error(getErrorMessage(error, 'cart'));
    }
  };

  // Remove from cart function
  const removeFromCart = async (id: string) => {
    const item = state.items.find(item => item.id === id);
    
    try {
      const response = await cartAPI.removeFromCart(id);
      
      if (response.status) {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
        
        // Invalidate React Query cache for both cart and products
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        
        // Sync with server to get fresh cart data
        await syncWithServer();
        
        showToast.success(getSuccessMessage('cart_remove'));
      } else {
        showToast.error(getErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      showToast.error(getErrorMessage(error, 'cart'));
    }
  };

  // Update quantity function
  const updateQuantity = async (id: string, quantity: number) => {
    const item = state.items.find(item => item.id === id);
    const oldQuantity = item?.quantity || 0;
    
    try {
      const response = await cartAPI.updateCartItem(id, quantity);
      
      if (response.status) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
        
        // Invalidate React Query cache for both cart and products
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        
        // Sync with server to get fresh cart data
        await syncWithServer();
        
        showToast.success(getSuccessMessage('cart_update'));
      } else {
        showToast.error(getErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Update quantity error:', error);
      showToast.error(getErrorMessage(error, 'cart'));
    }
  };

  // Clear cart function
  const clearCart = async () => {
    try {
      const response = await cartAPI.clearCart();
      
      if (response.status) {
        dispatch({ type: 'CLEAR_CART' });
        
        // Invalidate React Query cache for both cart and products
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
        queryClient.invalidateQueries({ queryKey: productKeys.all });
        
        // Sync with server to get fresh cart data
        await syncWithServer();
        
        showToast.success(getSuccessMessage('cart_clear'));
      } else {
        showToast.error(getErrorMessage({ response }, 'cart'));
      }
    } catch (error: any) {
      console.error('Clear cart error:', error);
      showToast.error(getErrorMessage(error, 'cart'));
    }
  };

  // Sync with server function
  const syncWithServer = useCallback(async () => {
    if (!isShopRole) return;
    try {
      const response = await cartAPI.getCart();
      
      console.log('🛒 Cart sync response:', response);
      
      if (response.status) {
        // Handle different response structures
        let cartData: any = response.data;
        
        // If response.data is not an array, check if it's wrapped in another data property
        if (!Array.isArray(cartData)) {
          if (cartData && Array.isArray(cartData.data)) {
            cartData = cartData.data;
          } else if (cartData && Array.isArray(cartData.items)) {
            cartData = cartData.items;
          } else {
            console.log('🛒 No cart items found in response');
            dispatch({ type: 'SET_CART', payload: [] });
            return;
          }
        }
        
        // Convert server cart items to local format
        const localItems: CartItem[] = cartData.map((serverItem: any) => ({
          id: serverItem.product?.id || serverItem.product_id || serverItem.id,
          name: serverItem.product?.name || serverItem.name || 'Unknown Product',
          price: serverItem.product?.price ? parseFloat(serverItem.product.price) : 
                 serverItem.price ? parseFloat(serverItem.price) : 0,
          quantity: serverItem.quantity || 1,
          stock: serverItem.product?.stock || serverItem.stock || 10, // Get stock from product object
          image: serverItem.product?.images?.[0]?.image || 
                 serverItem.images?.[0]?.image || 
                 serverItem.image || 'sparePart',
        }));
        
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
  }, [isShopRole]);

  // Get item quantity
  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (id: string): boolean => {
    return state.items.some(item => item.id === id);
  };

  // Sync with server on mount
  useEffect(() => {
    // Only sync cart if user is likely authenticated and in a shop-capable role
    const checkAndSync = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
        if (isLoggedIn === 'true' && isShopRole) {
          syncWithServer();
        }
      } catch (error) {
        console.log('🛒 Skipping cart sync');
      }
    };

    checkAndSync();
  }, [isShopRole, syncWithServer]);

  // Sync context state with React Query cart data whenever it changes
  // This ensures CartIconBtn and other components using CartContext stay in sync
  // when cart is modified from any page (cart page, product detail, etc.)
  useEffect(() => {
    if (!isShopRole) return;
    if (cartQueryData?.data) {
      let cartData = cartQueryData.data;

      // Handle nested data structure
      if (!Array.isArray(cartData)) {
        if (cartData && Array.isArray((cartData as any).items)) {
          cartData = (cartData as any).items;
        } else {
          return; // No valid cart items
        }
      }

      // Convert to local format if it's an array
      if (Array.isArray(cartData)) {
        const localItems: CartItem[] = cartData.map((serverItem: any) => ({
          id: serverItem.product?.id || serverItem.product_id || serverItem.id,
          name: serverItem.product?.name || serverItem.name || 'Unknown Product',
          price: serverItem.product?.price ? parseFloat(serverItem.product.price) :
                 serverItem.price ? parseFloat(serverItem.price) : 0,
          quantity: serverItem.quantity || 1,
          stock: serverItem.product?.stock || serverItem.stock || 10,
          image: serverItem.product?.images?.[0]?.image ||
                 serverItem.images?.[0]?.image ||
                 serverItem.image || 'sparePart',
        }));

        dispatch({ type: 'SET_CART', payload: localItems });
      }
    }
  }, [cartQueryData]);

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    cartAnimation,
    triggerCartAnimation,
    syncWithServer,
  };

  return (
    <CartContext.Provider value={value}>
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