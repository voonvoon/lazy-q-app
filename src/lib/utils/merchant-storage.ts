// lib/utils/merchant-storage.ts
export const setSelectedMerchant = (merchantId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedMerchantId', merchantId);
  }
};

export const getSelectedMerchant = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedMerchantId');
  }
  return null;
};

export const clearSelectedMerchant = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('selectedMerchantId');
  }
};