"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ItemsContextType {
  items: any[];
  setItems: (items: any[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcategory: string | null) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: any[];
}) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  console.log("ItemsProvider initialized with items--------------------->", initialItems);
  console.log("Items from context----------------------------------------------->"   , items);

  return (
    <ItemsContext.Provider
      value={{
        items,
        setItems,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
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
