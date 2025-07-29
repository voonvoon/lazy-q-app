"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ✅ Cart Item Structure (Option C: Hybrid)
interface CartItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number; // Supports decimals (0.5 portions)
  category: string;
  addedAt: Date; // For sorting/tracking
}

interface CartContextType {
  // State
  cartItems: CartItem[];
  
  // Computed values
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'addedAt'>, quantity?: number) => void;//Give me CartItem, but REMOVE the 'quantity' and 'addedAt' pieces
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  
  // Utility
  getItemQuantity: (itemId: string) => number;
  isInCart: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ Local Storage Key
const CART_STORAGE_KEY = 'lazy-q-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  console.log("cartItems in CartProvider--------------------------------------->>", cartItems);

  // ✅ Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt strings back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setCartItems(cartWithDates);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ✅ Save to localStorage on every cart change (your preference)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded]);

  // ✅ Computed Values (Memoized for performance)
  const totalItems = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  // ✅ Action: Add Item
  const addItem = (
    item: Omit<CartItem, 'quantity' | 'addedAt'>, 
    quantity: number = 1
  ) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(cartItem => cartItem.itemId === item.itemId);
      
      if (existingItemIndex >= 0) {
        // Item exists - update quantity
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + quantity
        };
        return updated;
      } else {
        // New item - add to cart
        const newItem: CartItem = {
          ...item,
          quantity,
          addedAt: new Date()
        };
        return [...prev, newItem];
      }
    });
  };

  // ✅ Action: Remove Item
  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.itemId !== itemId));
  };

  // ✅ Action: Update Quantity (supports decimals)
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.itemId === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // ✅ Action: Clear Cart
  const clearCart = () => {
    setCartItems([]);
  };

  // ✅ Utility: Get Item Quantity
  const getItemQuantity = (itemId: string): number => {
    const item = cartItems.find(item => item.itemId === itemId);
    return item ? item.quantity : 0;
  };

  // ✅ Utility: Check if item is in cart
  const isInCart = (itemId: string): boolean => {
    return cartItems.some(item => item.itemId === itemId);
  };

  const contextValue: CartContextType = {
    // State
    cartItems,
    
    // Computed
    totalItems,
    totalPrice,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    
    // Utilities
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ Custom Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// ✅ Export types for use in other components
export type { CartItem, CartContextType };