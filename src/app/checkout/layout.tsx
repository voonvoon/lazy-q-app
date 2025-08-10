"use client";
import { ReactNode, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { LiaRunningSolid } from "react-icons/lia";

// Helper to get now + 30 minutes in "HH:mm" format
//setMinutes, getMinutes, and getHours are all built-in methods of JavaScript’s Date object.
function getDefaultFirstOrderTime() {
  const now = new Date(); // e.g. 2025-08-09T14:15:00 -->"14:15:00"
  now.setMinutes(now.getMinutes() + 30); //Add 30 minutes to the current time ->14:45
  const hours = now.getHours().toString().padStart(2, "0"); // "14"
  const minutes = now.getMinutes().toString().padStart(2, "0"); // "45"
  return `${hours}:${minutes}`; //Return as "HH:mm" string
}

// Helper to get the later of two "HH:mm" times
function getLaterTime(timeA: string, timeB: string) {
  return timeA > timeB ? timeA : timeB;
}

interface CheckoutLayoutProps {
  children: ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const { merchantData } = useCart();

  const [isDelivery, setIsDelivery] = useState(false);

  // Handler for radio change
  const handleDeliveryOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDelivery(e.target.value === "delivery"); // is true when delivery radio btn is selected
  };

  // Use now + 30min as min and default for time picker
  // Merchant's opening time (default to "10:00" if not set)
  const firstOrderTime = merchantData?.firstOrderTime || "10:00";
  const nowPlus30 = getDefaultFirstOrderTime();

  // if nowPlus30 is later than firstOrderTime, use it as minTime
  // if nowPlus30 is earlier than firstOrderTime, use firstOrderTime
  const minTime = getLaterTime(nowPlus30, firstOrderTime);
  const maxTime = merchantData?.lastOrderTime || "20:00";

  const [selectedTime, setSelectedTime] = useState(minTime);
  const [timeError, setTimeError] = useState("");

  // Handler to validate time selection
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value < minTime || value > maxTime) {
      setTimeError(`Please select a time between ${minTime} and ${maxTime}.`);
      setSelectedTime(minTime);
    } else {
      setSelectedTime(value);
      setTimeError("");
    }
  };

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

        {/* pre-order pick up time */}
        <div className="mb-6">
          {merchantData?.allowPreorder ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <input
                type="time"
                min={minTime}
                max={maxTime}
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              {!timeError ? (
                <p className="mt-1 text-xs text-gray-500">
                  You can set pickup time between {minTime} and {maxTime}
                </p>
              ) : (
                <p className="mt-1 text-xs text-red-600">{timeError}</p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                Order will be prepared as soon as order is placed.
              </p>
            </div>
          )}
        </div>

        {/* ✅ Free Delivery Threshold Message - Using ternary operator */}
        {merchantData?.allowedDelivery &&
        merchantData?.freeDeliveryThreshold &&
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
        {/* Conditional Delivery Options */}

        {/* // Show both delivery and pickup when delivery is allowed */}
        <div className="mt-2 pt-6 border-t border-gray-300">
          <h4 className="font-semibold text-gray-800 mb-3">
            Self pick-up/Delivery Options
          </h4>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="deliveryOption"
                value="pickup"
                className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                checked={!isDelivery}
                onChange={handleDeliveryOptionChange}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex text-sm font-medium text-gray-800">
                    <LiaRunningSolid className="mr-1" size={20}/>Self Pick-up
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

            {merchantData?.allowedDelivery && (
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deliveryOption"
                  value="delivery"
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  checked={isDelivery}
                  onChange={handleDeliveryOptionChange}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm font-medium text-gray-800">
                      <MdOutlineDeliveryDining className="mr-1" size={20}/> Delivery
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
            )}

            {/* Pass delivery state to the form */}
            <CustomerInfoForm delivery={isDelivery} />
          </div>
        </div>
      </aside>

      {/* Main content: Mobile full width, Desktop right side */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
