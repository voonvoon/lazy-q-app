"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ItemsContextType {
  items: any[];
  setItems: (items: any[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcategory: string | null) => void;
  scrollCategory: string | null;
  setScrollCategory: (category: string | null) => void;
  scrollSubcategory: string | null;
  setScrollSubcategory: (subcategory: string | null) => void;
  merchantData: any | null;
  setMerchantData: (merchant: any | null) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({
  children,
  initialItems = [],
  merchant,
}: {
  children: ReactNode;
  initialItems?: any[];
  merchant?: any; 
}) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [merchantData, setMerchantData] = useState(merchant || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [scrollCategory, setScrollCategory] = useState<string | null>(null);
  const [scrollSubcategory, setScrollSubcategory] = useState<string | null>(
    null
  );

  //console.log("Merchant Data in ItemsProvider:", merchantData);

  // console.log(
  //   "selectedCategory --------------------------------------->",
  //   selectedCategory
  // );
  // console.log(
  //   "selectedSubcategory ------------------------------------>",
  //   selectedSubcategory
  // );
  // console.log(
  //   "scrollCategory --------------------------------------------->",
  //   scrollCategory
  // );
  // console.log(
  //   "scrollSubcategory --------------------------------------->",
  //   scrollSubcategory
  // );

  // console.log(
  //   "ItemsProvider initialized with items--------------------->",
  //   initialItems
  // );
  // console.log(
  //   "Items from context----------------------------------------------->",
  //   items
  // );

  return (
    <ItemsContext.Provider
      value={{
        items,
        setItems,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        scrollCategory,
        setScrollCategory,
        scrollSubcategory,
        setScrollSubcategory,
        merchantData, 
        setMerchantData
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider");
  }
  return context;
}
