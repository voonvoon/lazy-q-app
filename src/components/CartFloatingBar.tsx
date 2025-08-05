"use client";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { FiShoppingCart } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";

export default function CartFloatingBar() {
  const { totalItems, totalPrice, merchantData } = useCart();

  // Don't show if cart is empty
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-10 left-0 right-0 z-30">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <Link href="/checkout" className="block">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-600 text-white rounded-2xl px-4 py-3 transition-all duration-500 ease-in-out hover:shadow-2xl hover:scale-105">
            {/* Left side: Cart icon and items count */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FiShoppingCart className="w-6 h-6" />
                {/* Items count badge */}
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
                {merchantData && (
                  <span className="text-blue-100 text-xs">
                    from {merchantData.name}
                  </span>
                )}
              </div>
            </div>

            {/* Right side: Total price and checkout arrow */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="font-bold text-lg">
                  RM{totalPrice.toFixed(2)}
                </div>
                <div className="text-blue-100 text-xs">
                  View Cart
                </div>
              </div>
              
              <BsArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}