"use client";

import { ReactNode, useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { LiaRunningSolid } from "react-icons/lia";
import { MdAccessTime } from "react-icons/md";

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
  const { merchantData, setDelivery, delivery, selectedTime, setSelectedTime, showTimePicker, setShowTimePicker } =
    useCart();

  // Handler for radio change
  const handleDeliveryOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    //setIsDelivery(e.target.value === "delivery"); // is true when delivery radio btn is selected
    setDelivery(e.target.value === "delivery"); // Pass to CartContext
  };

  // Use now + 30min as min and default for time picker
  // Merchant's opening time (default to "10:00" if not set)
  const firstOrderTime = merchantData?.firstOrderTime || "10:00";
  const nowPlus30 = getDefaultFirstOrderTime();

  // if nowPlus30 is later than firstOrderTime, use it as minTime
  // if nowPlus30 is earlier than firstOrderTime, use firstOrderTime
  const minTime = getLaterTime(nowPlus30, firstOrderTime);
  const maxTime = merchantData?.lastOrderTime || "20:00";

  //by default, set selectedTime to ASAP
  useEffect(() => {
    setSelectedTime(selectedTime);
  }, [setSelectedTime]);

  // const [selectedTime, setSelectedTime] = useState(minTime);
  const [timeError, setTimeError] = useState("");


  // Handler for checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowTimePicker(e.target.checked);
    if (!e.target.checked) {
      setSelectedTime("ASAP");
      setTimeError("");
    } else {
      setSelectedTime(selectedTime); //if refers to the previously selected time
    }
  };

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
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  {delivery ? "Select a delivery Time" : "Select a pickup time"}
                  <MdAccessTime className="ml-1" size={16} />
                </span>
                <label className="flex items-center justify-between mb-2 select-none">
                  <input
                    type="checkbox"
                    checked={showTimePicker}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 rounded-full peer cursor-pointer  peer-checked:bg-blue-500 transition-colors duration-200 relative">
                    <div
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        showTimePicker ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
              {showTimePicker ? (
                <>
                  <input
                    type="time"
                    min={minTime}
                    max={maxTime}
                    value={selectedTime || minTime}
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
                </>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    Order will be prepared ASAP.
                  </p>
                </div>
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

        {/* Delivery Options */}
        {/* Conditional Delivery Options */}

        {/* // Show both delivery and pickup when delivery is allowed */}
        <div className="mt-2 pt-6 border-t border-gray-300">
          <h4 className="font-semibold text-gray-800 mb-3">
            Self pick-up/Delivery Options
          </h4>
          <div className="space-y-3">
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors
    ${
      !delivery
        ? "border-blue-500 bg-blue-50 shadow"
        : "border-gray-200 hover:bg-gray-50"
    }
  `}
            >
              <input
                type="radio"
                name="deliveryOption"
                value="pickup"
                className=" appearance-none  text-blue-600 focus:ring-blue-500"
                checked={!delivery}
                onChange={handleDeliveryOptionChange}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex text-sm font-medium text-gray-800">
                    <LiaRunningSolid className="mr-1" size={20} />
                    Self Pick-up
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
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors
    ${
      delivery
        ? "border-blue-500 bg-blue-50 shadow"
        : "border-gray-200 hover:bg-gray-50"
    }
  `}
              >
                <input
                  type="radio"
                  name="deliveryOption"
                  value="delivery"
                  className="appearance-none  text-blue-600 focus:ring-blue-500"
                  checked={delivery}
                  onChange={handleDeliveryOptionChange}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm font-medium text-gray-800">
                      <MdOutlineDeliveryDining className="mr-1" size={20} />{" "}
                      Delivery
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
            <span className="block text-sm font-light text-gray-800 ml-1 mt-2">
              Fill in details
            </span>
            {/* Pass delivery state to the form */}
            <CustomerInfoForm delivery={delivery} />
          </div>
        </div>
      </aside>

      {/* Main content: Mobile full width, Desktop right side */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
