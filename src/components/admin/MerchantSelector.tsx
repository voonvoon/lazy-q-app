// components/admin/MerchantSelector.tsx
'use client'

import { useMerchant } from '@/contexts/MerchantContext';
import { GiHotMeal } from 'react-icons/gi';

export default function MerchantSelector() {
  const { allMerchants, setSelectedMerchant } = useMerchant();

  const handleMerchantSelect = (merchant:any) => {
    // ✅ Context handles both state and localStorage
    setSelectedMerchant(merchant._id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allMerchants.map((merchant) => (
        <div
          key={merchant._id}
          onClick={() => handleMerchantSelect(merchant)}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl cursor-pointer transition-all duration-300 hover:border-blue-500 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
              <GiHotMeal className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{merchant.name}</h3>
              <p className="text-gray-600 text-sm">{merchant.email}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              merchant.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {merchant.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
            
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
              Manage →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}