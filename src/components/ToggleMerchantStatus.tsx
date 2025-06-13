// components/ToggleMerchantStatus.tsx
'use client'

import { toggleMerchantStatus } from "@/lib/actions/merchants";
import { useState } from "react";
import toast from 'react-hot-toast';

interface ToggleMerchantStatusProps {
  merchantId: string;
  merchantName: string;
  initialStatus: boolean;
}

export default function ToggleMerchantStatus({ 
  merchantId, 
  merchantName,
  initialStatus 
}: ToggleMerchantStatusProps) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    
    // Show loading toast
    const loadingToast = toast.loading(`${isActive ? 'Deactivating' : 'Activating'} ${merchantName}...`);
    
    try {
      const result = await toggleMerchantStatus(merchantId);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (result.error) {
        toast.error(`Failed to toggle status: ${result.error}`);
      } else {
        // Update local state
        setIsActive(result.isActive!);
        
        // Show success toast
        toast.success(result.message!, {
          icon: result.isActive ? '✅' : '❌',
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to toggle merchant status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${isActive 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
      `}
      title={`${isActive ? 'Deactivate' : 'Activate'} ${merchantName}`}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isActive ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
      <span className="sr-only">
        {isActive ? 'Deactivate' : 'Activate'} merchant
      </span>
    </button>
  );
}