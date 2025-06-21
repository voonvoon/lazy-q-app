'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSelectedMerchant, setSelectedMerchant as setStoredMerchant } from '@/lib/utils/merchant-storage';

interface MerchantContextType {
  selectedMerchantId: string | null;
  selectedMerchant: any | null;
  allMerchants: any[];
  isLoading: boolean;
  setSelectedMerchant: (merchantId: string) => void;
  initializeMerchants: (merchants: any[]) => void;
}

//"Like Make a magic box can hold restaurant stuff!"
//Why undefined at the start? Cuz The box starts EMPTY!
const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [allMerchants, setAllMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Initialize from localStorage on mount
  useEffect(() => {
    const storedMerchantId = getSelectedMerchant();
    if (storedMerchantId) {
      setSelectedMerchantId(storedMerchantId);
    }
    setIsLoading(false);
  }, []);

  const initializeMerchants = (merchants: any[]) => {
    setAllMerchants(merchants);
    
    // ✅ Auto-select logic
    const storedMerchantId = getSelectedMerchant();
    
    if (storedMerchantId && merchants.find(m => m._id === storedMerchantId)) {
      // Valid stored merchant
      setSelectedMerchantId(storedMerchantId);
    } else if (merchants.length === 1) {
      // Single merchant - auto select
      setSelectedMerchant(merchants[0]._id);
    } else {
      // Multiple merchants, no valid selection
      setSelectedMerchantId(null);
    }
  };

  const setSelectedMerchant = (merchantId: string) => {
    // ✅ Update both context state AND localStorage
    setSelectedMerchantId(merchantId); //context state
    setStoredMerchant(merchantId); // set localStorage
  };

  const selectedMerchant = allMerchants.find(m => m._id === selectedMerchantId) || null;

  return (
    <MerchantContext.Provider value={{
      selectedMerchantId,
      selectedMerchant,
      allMerchants,
      isLoading,
      setSelectedMerchant,
      initializeMerchants
    }}>
      {children}
    </MerchantContext.Provider>
  );
}

// ✅ Custom hook
export function useMerchant() {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
}