"use client";
import { ReactNode } from "react";
import { useCart } from "@/contexts/CartContext";

interface CheckoutLayoutProps {
  children: ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const { merchantData } = useCart();

  console.log(
    "merchantData in CheckoutLayout------------------------------------------>",
    merchantData
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Sidebar: Mobile top, Desktop left */}
      <aside className="w-full lg:w-2/5 lg:max-w-md bg-gray-100 p-6 lg:p-4 min-h-[40vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-gray-200 lg:overflow-y-auto lg:h-screen lg:sticky lg:top-0 text-black">
        {/* Restaurant Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {merchantData?.name || "No Merchant Selected"}
          </h2>
        </div>

        {/* ✅ Free Delivery Threshold Message - Using ternary operator */}
        {merchantData?.freeDeliveryThreshold &&
        merchantData.freeDeliveryThreshold > 0 ? (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">
              💡 FREE delivery on orders above RM
              {merchantData.freeDeliveryThreshold.toFixed(2)}!
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Add more items to qualify for free delivery
            </p>
          </div>
        ) : (
          ""
        )}

        {/* Delivery Options */}
        {/* ✅ Conditional Delivery Options */}
        {merchantData?.allowedDelivery ? (
          // Show both delivery and pickup when delivery is allowed
          <div className="mt-2 pt-6 border-t border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-3">
              Delivery Option
            </h4>

            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deliveryOption"
                  value="delivery"
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      🚚 Delivery
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      RM{(merchantData?.deliveryFee ?? 5.0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Delivered to your doorstep
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deliveryOption"
                  value="pickup"
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      🏃 Self Pick-up
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      Free
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pick up from restaurant
                  </p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          // Show pickup only when delivery is not allowed
          <div className="mt-2 pt-6 border-t border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-3">Pickup Only</h4>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-2">🏪</span>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    This restaurant offers pickup only
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Ready for pickup in 15-20 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content: Mobile full width, Desktop right side */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
