"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ✅ Cart Item Structure
interface CartItem {
  cartItemId: string;
  itemId: string;
  title: string;
  price: string | number;
  totalPrice: number;
  quantity: number;
  category: string;
  addOns?: Array<{ _id: string; name: string; price: number }>;
  remarks?: string;
  addedAt: Date;
}

// ✅ Merchant Data Structure
interface MerchantData {
  _id: string;
  name: string;
}

// ✅ Combined Cart Storage Structure
interface CartStorage {
  merchant: MerchantData | null;
  cartItems: CartItem[];
  timestamp: number; // ✅ When cart was last updated
  expiresAt: number; // ✅ When cart expires
}

interface CartContextType {
  // State
  cartItems: CartItem[];
  merchantData: MerchantData | null;
  setMerchantData: (merchant: MerchantData | null) => void;
  // setCartItems: (items: CartItem[]) => void;

  // Computed values
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (
    item: Omit<CartItem, "quantity" | "addedAt" | "cartItemId">,
    quantity?: number
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;

  // Utility
  getItemQuantity: (itemId: string) => number;
  isInCart: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ Single Storage Key
const CART_STORAGE_KEY = "lazy-q-cart";
const CART_EXPIRY_TIME = 1 * 60 * 1000; // 30 minutes in milliseconds

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);

  // console.log(
  //   "cartItems------------------------------------------------->",
  //   cartItems
  // );

  console.log("merchantData in CartContext------------------------------------>>>", merchantData);

  // ✅ Load cart AND merchant from single localStorage item, so even refreshes keep the same restaurant context
  useEffect(() => {
    try {
      const savedCartData = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCartData) {
        //localStorage → String → JSON.parse() → Object
        const parsedData: CartStorage = JSON.parse(savedCartData);

        // ✅ Check if cart has expired
        const now = Date.now();
        const isExpired = parsedData.expiresAt && now > parsedData.expiresAt;

        if (isExpired) {
          console.log("Cart expired, clearing localStorage");
          localStorage.removeItem(CART_STORAGE_KEY);
          setCartItems([]);
          // Don't load expired data - start fresh
        } else {
          // Load cart items with date conversion
          if (parsedData.cartItems && Array.isArray(parsedData.cartItems)) {
            const cartWithDates = parsedData.cartItems.map((item: any) => ({
              ...item,
              addedAt: new Date(item.addedAt),
            }));
            setCartItems(cartWithDates);
          }

          // ✅ Load merchant data
          if (parsedData.merchant) {
            setMerchantData(parsedData.merchant);
          }
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ✅ Save BOTH cart items AND merchant data together
  useEffect(() => {
  if (isLoaded) {
    try {
      // ✅ Check if we have actual cart content 
      const hasCartItems = cartItems.length > 0;
      const hasMerchant = merchantData !== null;
      
      if (hasCartItems && hasMerchant) {
        // ✅ Save when we have both items and merchant
        const now = Date.now();
        const cartData: CartStorage = {
          merchant: merchantData,
          cartItems: cartItems,
          timestamp: now,
          expiresAt: now + CART_EXPIRY_TIME,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        console.log("💾 Cart saved:", cartItems.length, "items");
      } else {
        // ✅ Clean up localStorage when cart is empty
        localStorage.removeItem(CART_STORAGE_KEY);
        console.log("🗑️ Empty cart, localStorage cleared");
      }
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }
}, [cartItems, merchantData, isLoaded]);

  // ✅ Computed Values (Memoized for performance)
  const totalItems = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  }, [cartItems]);

  // ✅ Action: Add Item
  const addItem = (
    item: Omit<CartItem, "quantity" | "addedAt" | "cartItemId">,
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const cartItemId = `cart_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 6)}`;

      const newItem: CartItem = {
        ...item,
        cartItemId,
        quantity,
        addedAt: new Date(),
      };
      return [...prev, newItem];
    });
  };

  // ✅ Action: Remove Item (using cartItemId)
  const removeItem = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.cartItemId !== cartItemId)
    );
  };

  // ✅ Action: Update Quantity (using cartItemId)
  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // ✅ Action: Clear Cart (keep merchant, clear items only)
  const clearCart = () => {
    setCartItems([]);
    // Note: merchantData stays - user can continue ordering from same restaurant
  };

  // ✅ Utility: Get Item Quantity
  const getItemQuantity = (itemId: string): number => {
    return cartItems.reduce((total, item) => {
      return item.itemId === itemId ? total + item.quantity : total;
    }, 0);
  };

  // ✅ Utility: Check if item is in cart
  const isInCart = (itemId: string): boolean => {
    return cartItems.some((item) => item.itemId === itemId);
  };

  const contextValue: CartContextType = {
    // State
    cartItems,
    merchantData,
    setMerchantData,
    //setCartItems,

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
    isInCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// ✅ Custom Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// ✅ Export types for use in other components
export type { CartItem, CartContextType, MerchantData, CartStorage };
