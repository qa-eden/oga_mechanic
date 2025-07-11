import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Toast from 'toastify-react-native';

// Types
export interface CartItem {
  id: number;
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
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: number) => number;
  isInCart: (id: number) => boolean;
  cartAnimation: Animated.Value;
  triggerCartAnimation: () => void;
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
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = state.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem && existingItem.quantity >= existingItem.stock) {
      // Toast.error(`Stock limit reached! You can only add up to ${existingItem.stock} items of ${item.name}`);
      return;
    }

    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
    triggerCartAnimation();
    
    // Show success feedback
    // Toast.success(`${item.name} added to cart!`);
  };

  // Remove from cart function
  const removeFromCart = (id: number) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    // if (item) {
    //   Toast.info(`${item.name} removed from cart`);
    // }
  };

  // Update quantity function
  const updateQuantity = (id: number, quantity: number) => {
    const item = state.items.find(item => item.id === id);
    const oldQuantity = item?.quantity || 0;
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    
    // if (item && quantity !== oldQuantity) {
    //   if (quantity > oldQuantity) {
    //     Toast.success(`Increased ${item.name} quantity to ${quantity}`);
    //   } else if (quantity < oldQuantity) {
    //     Toast.info(`Decreased ${item.name} quantity to ${quantity}`);
    //   }
    // }
  };

  // Clear cart function
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Get item quantity
  const getItemQuantity = (id: number): number => {
    const item = state.items.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (id: number): boolean => {
    return state.items.some(item => item.id === id);
  };

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