"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import type { DiscountInput } from "@/lib/actions/discount";

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
  image?: string; // Optional image URL
}

// ✅ Merchant Data Structure
interface MerchantData {
  _id: string;
  name: string;
  tax?: number; // Optional tax percentage
  allowedDelivery?: boolean; // Whether delivery is allowed
  deliveryFee?: number; // Delivery fee amount
  freeDeliveryThreshold?: number; // Minimum order amount for free delivery
  allowPreorder?: boolean; // Whether pre-ordering is allowed
  firstOrderTime?: string; // First order time in HH:mm format
  lastOrderTime?: string; // Last order time in HH:mm format
}

// ✅ Combined Cart Storage Structure
interface CartStorage {
  merchant: MerchantData | null;
  cartItems: CartItem[];
  timestamp: number; // When cart was last updated
  expiresAt: number; // When cart expires
  delivery: boolean; // Whether delivery is selected
  customerInfo: CustomerInfo;
  totalPrice: number;
  discount?: DiscountInput | null;
}

interface CartContextType {
  // State
  cartItems: CartItem[];
  merchantData: MerchantData | null;
  setMerchantData: (merchant: MerchantData | null) => void;
  setCartItems: (items: CartItem[]) => void;
  setDelivery: (delivery: boolean) => void;
  delivery: boolean;
  setCustomerInfo: (info: CustomerInfo) => void;
  customerInfo: CustomerInfo;
  discount: DiscountInput | null;
  setDiscount: (discount: DiscountInput | null) => void;

  // Computed values
  totalItems: number;
  totalPrice: number;
  totalTax: number; // Total tax amount
  totalWithTaxAndDelivery: number; // Total price including tax and delivery fee
  getDeliveryFee: () => number | "free"; // Function to get delivery fee or "free" if eligible
  totalDiscount: () => number; // Total discount amount
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

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  state?: string;
  postcode?: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ Single Storage Key
const CART_STORAGE_KEY = "lazy-q-cart";
const CART_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [delivery, setDelivery] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    postcode: "",
  });

  const [discount, setDiscount] = useState<DiscountInput | null>(null);

  console.log(
    "discount in context--------------------------------------->",
    discount
  );

  // Load cart AND merchant from single localStorage item, so even refreshes keep the same restaurant context
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
              addedAt: new Date(item.addedAt), //convert string to Date object
            }));
            setCartItems(cartWithDates);
            setDelivery(parsedData.delivery);
            setCustomerInfo(parsedData.customerInfo);
            if (parsedData.discount) {
              setDiscount(parsedData.discount);
            }
          }

          //Load merchant data cuz after refresh context state is lost
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
        // Check if we have actual cart content
        const hasCartItems = cartItems.length > 0;
        const hasMerchant = merchantData !== null;

        // Save to localStorage only if we have items and merchant
        if (hasCartItems && hasMerchant) {
          //Save when we have both items and merchant
          const now = Date.now();
          const cartData: CartStorage = {
            merchant: merchantData,
            //   merchant: {
            //   _id: merchantData._id,
            //   name: merchantData.name
            // },
            cartItems: cartItems,
            delivery: delivery,
            customerInfo: customerInfo,
            timestamp: now,
            expiresAt: now + CART_EXPIRY_TIME,
            totalPrice,
            discount,
          };
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        } else {
          // ✅ Clean up localStorage when cart is empty
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cartItems, merchantData, isLoaded, delivery, customerInfo, discount]);

  // ✅ Computed Values (Memoized for performance)
  const totalItems = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = React.useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  const getDeliveryFee = () => {
    if (!merchantData || !delivery) return 0;
    const deliveryFee = merchantData.deliveryFee ?? 0;
    const freeDeliveryThreshold =
      merchantData.freeDeliveryThreshold ?? Infinity;
    return totalPrice >= freeDeliveryThreshold ? "free" : deliveryFee;
  };

  const totalDiscount = React.useMemo(() => {
    if (!discount) return 0;
    if (discount.type === "amount") {
      return Number(discount.value);
    }
    if (discount.type === "percentage") {
      return Number((totalPrice * (discount.value / 100)).toFixed(2));
    }
    return 0;
  }, [discount, totalPrice]);

  const totalTax = React.useMemo(() => {
    const taxRate = merchantData?.tax ?? 6; // Default to 6% if not set
    const discountedSubtotal = Math.max(totalPrice - totalDiscount, 0); // Prevent negative
    return Number((discountedSubtotal * (taxRate / 100)).toFixed(2));
  }, [totalPrice, totalDiscount, merchantData]);

  const totalWithTaxAndDelivery = React.useMemo(() => {
    const delivery = getDeliveryFee();
    const deliveryFee = delivery === "free" ? 0 : Number(delivery);
    const discountAmount = totalDiscount; // Use the value directly
    const total = totalPrice + totalTax + deliveryFee - discountAmount;
    return Number(total > 0 ? total.toFixed(2) : "0.00"); // Prevent negative totals
  }, [totalPrice, totalTax, merchantData, delivery, totalDiscount]);

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
    setDiscount(null);
    // Note: merchantData stays - user can continue ordering from same restaurant
    window.history.back();
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
    setCartItems,
    delivery,
    setDelivery,
    setCustomerInfo,
    customerInfo,
    discount,
    setDiscount,

    // Computed
    totalItems,
    totalPrice,
    totalTax,
    getDeliveryFee,
    totalWithTaxAndDelivery,
    totalDiscount: () => totalDiscount, // If you want to keep this as a function, you can leave it, but totalDiscount itself is a number now

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
