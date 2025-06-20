// components/admin/MerchantSwitcher.tsx
'use client'

import { useMerchant } from '@/contexts/MerchantContext';

export default function MerchantSwitcher() {
  const { allMerchants, selectedMerchantId, setSelectedMerchant } = useMerchant();

  const handleMerchantChange = (merchantId:any) => {
    // ✅ Context handles everything - no manual reload needed!
    setSelectedMerchant(merchantId);
  };

  if (allMerchants.length <= 1) return null;

  return (
    <div className="relative">
      <select
        value={selectedMerchantId || ''}
        onChange={(e) => handleMerchantChange(e.target.value)}
        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px] text-black"
      >
        {allMerchants.map((merchant) => (
          <option key={merchant._id} value={merchant._id}>
            {merchant.name}
          </option>
        ))}
      </select>
    </div>
  );
}