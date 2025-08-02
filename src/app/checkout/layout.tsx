"use client";
import { ReactNode } from "react";
import { useCart } from "@/contexts/CartContext";

interface CheckoutLayoutProps {
  children: ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const { merchantData } = useCart();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Sidebar: Mobile top, Desktop left */}
      <aside className="w-full lg:w-2/5 lg:max-w-md bg-gray-100 p-4 border-b lg:border-b-0 lg:border-r border-gray-200 lg:overflow-y-auto lg:h-screen lg:sticky lg:top-0 text-black">
        {/* Restaurant Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {merchantData?.name || "No Merchant Selected"}
          </h2>

        </div>

        {/* Delivery Options */}
        <div className="mt-6 pt-6 border-t border-gray-300">
          <h4 className="font-semibold text-gray-800 mb-3">Delivery Option</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="deliveryOption"
                value="delivery"
                className="mr-2"
                defaultChecked
              />
              <span className="text-sm">🚚 Delivery (RM3.00)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="deliveryOption"
                value="pickup"
                className="mr-2"
              />
              <span className="text-sm">🏃 Self Pick-up (Free)</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Main content: Mobile full width, Desktop right side */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
