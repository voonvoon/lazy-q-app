// components/DeleteMerchantButton.tsx
'use client'

import { deleteMerchant } from "@/lib/actions/merchants";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

interface DeleteMerchantButtonProps {
  merchantId: string;
  merchantName: string;
}

export default function DeleteMerchantButton({ 
  merchantId, 
  merchantName 
}: DeleteMerchantButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await deleteMerchant(merchantId);
      
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(`Success: ${result.message}`);
        // Page will automatically refresh due to revalidatePath
      }
    } catch (error) {
      alert('Failed to delete merchant');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex space-x-1">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50 cursor-pointer"
        >
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          className="text-gray-600 hover:text-gray-800 text-xs font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 hover:underline transition-colors flex items-center space-x-1 cursor-pointer"
      title={`Delete ${merchantName}`}
    >
      <FiTrash2 className="w-3 h-3" />
      <span>Delete</span>
    </button>
  );
}