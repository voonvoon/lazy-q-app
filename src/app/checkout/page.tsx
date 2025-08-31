"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { getItemByIdForEdit } from "@/lib/actions/frontShop";
import ItemModal from "@/components/ItemModal";
import { FaSpinner } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineCleaningServices } from "react-icons/md";
import { MdOutlineDeliveryDining } from "react-icons/md";
import DiscountCodeInput from "@/components/DiscountCodeInput";
import { createPaymentLinkPost } from "@/lib/actions/fiuu";

export default function CheckoutPage() {
  const {
    cartItems,
    customerInfo,
    delivery,
    discount,
    merchantData,
    setCartItems,
    totalPrice,
    totalItems,
    totalTax,
    totalWithTaxAndDelivery,
    getDeliveryFee,
    clearCart,
    totalDiscount,
    remarks,
    setRemarks,
    selectedTime
  } = useCart();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State for modal and selected item
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
  const [existingItemForEdit, setExistingItemForEdit] = useState(undefined); // State for existing item being edited

  // Handler for Edit button
  const handleEdit = async (itemId: string, cartItemId: string) => {
    setLoadingEdit(itemId);
    try {
      const item: any = await getItemByIdForEdit(itemId);
      const existing: any = cartItems.find(
        (ci) => ci.cartItemId === cartItemId
      );

      setSelectedItem(item);
      setExistingItemForEdit(existing);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch item for edit:", err);
    } finally {
      setLoadingEdit(null); // stop loading
    }
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setExistingItemForEdit(undefined);
  };

  return (
    <main className="p-4 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-black mb-5">Checkout</h1>
      {/* ✅ Free Delivery Threshold Messager */}
      {merchantData?.allowedDelivery &&
      merchantData?.freeDeliveryThreshold &&
      merchantData.freeDeliveryThreshold > 0 ? (
        <div className="flex items-center justify-center bg-blue-50 animate-bounce text-gray-600 px-2 py-2 rounded-md border-1 border-blue-400 shadow-sm tracking-wide w-auto max-w-fit mx-auto text-xs sm:text-sm font-normal sm:font-semibold">
          Free Delivery For Order More than RM
          {merchantData.freeDeliveryThreshold.toFixed(2)}!
          <MdOutlineDeliveryDining color="gray" size={24} className="ml-2" />
        </div>
      ) : (
        ""
      )}

      {/* Order Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-5">
          Your Order ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h3>

        {cartItems.length > 0 ? (
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white p-1 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>

                    {/* Add-ons */}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="mt-1">
                        {item.addOns.map((addon) => (
                          <p key={addon._id} className="text-xs text-blue-600">
                            + {addon.name} (+RM{addon.price.toFixed(2)})
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Remarks */}
                    {item.remarks && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        "{item.remarks}"
                      </p>
                    )}

                    {/* --- Edit Button --- */}
                    <div className="flex items-center mt-2">
                      <button
                        title="Edit item"
                        className="py-1 px-3 bg-yellow-200 hover:bg-yellow-300 text-black text-xs rounded transition cursor-pointer flex items-center gap-2"
                        onClick={() => handleEdit(item.itemId, item.cartItemId)}
                        disabled={loadingEdit === item.itemId}
                      >
                        {loadingEdit === item.itemId ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          "Edit"
                        )}
                      </button>
                      <button
                        className="ml-2 p-2 hover:bg-blue-50 text-red-400 hover:text-red-600 rounded-full transition cursor-pointer"
                        title="Remove"
                        style={{ background: "none" }}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to remove this item from your cart?"
                            )
                          ) {
                            setCartItems(
                              cartItems.filter(
                                (ci) => ci.cartItemId !== item.cartItemId
                              )
                            );
                          }
                        }}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right ml-3">
                    <p className="font-semibold text-gray-800">
                      RM{Number(item.totalPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end items-center gap-2 mt-2 mr-2">
              <button
                title="clear all cart items"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear all items from your cart?"
                    )
                  ) {
                    clearCart();
                  }
                }}
                className="flex items-center gap-1 text-blue-600 hover:underline bg-transparent border-none p-0 m-0  cursor-pointer text-sm"
                style={{ boxShadow: "none" }}
              >
                Clear All <MdOutlineCleaningServices />
              </button>
            </div>
            {/* Discount Section */}
            <div className="flex  justify-start sm:justify-end mb-2">
              {/* <span className="text-gray-600 text-sm mr-2 underline">
                Discount Code
              </span> */}
            </div>
            <div className="flex justify-end mb-4 shadow-sm rounded bg-white p-2">
              <DiscountCodeInput merchantId={merchantData?._id ?? ""} />
            </div>
            <div className="mb-6">
              <label
                htmlFor="remarks"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Remarks (optional)
              </label>
              <textarea
                id="remarks"
                value={remarks || ""}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Add any special instructions or notes for your order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-none"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
        )}
      </div>

      {/* Price Summary */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-300 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>RM{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>
                Discount
                <span className="text-green-600">
                  {discount?.type === "percentage"
                    ? ` (${discount.value}% off)`
                    : discount?.type === "amount"
                    ? ` (RM${Number(discount.value).toFixed(2)} off)`
                    : ""}
                </span>
                :
              </span>
              <span>-RM{totalDiscount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SST ({merchantData?.tax ?? 6}%):</span>
              <span>RM{totalTax.toFixed(2) ?? "0.00"}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span>
                {getDeliveryFee() === "free"
                  ? "Free"
                  : `RM${Number(getDeliveryFee()).toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span>
                  RM
                  {totalWithTaxAndDelivery.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                title="Add more items"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto py-2 px-4 border-1 border-blue-600 text-blue-600 font-semibold rounded-2xl shadow-lg transition-all duration-200 transform hover:bg-blue-50 hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2 cursor-pointer bg-white text-sm sm:text-base"
              >
                <span className="flex items-center gap-2 justify-center w-full">
                  Add More
                  <IoAddCircleOutline size={20} />
                </span>
              </button>

              <button
                onClick={async () => {
                  // Bundle all checkout state into one object
                  const paymentPayload = {
                    cartItems,
                    customerInfo,
                    delivery,
                    discount,
                    merchantData,
                    remarks,
                    selectedTime
                  };

                  const response = await createPaymentLinkPost(paymentPayload);

                  const { url, data } = response;

                  console.log(
                    "data(after createPaymentLinkPost) ----------------------------------------------->:",
                    data.metadata
                  );

                  // Create a new form element
                  const form = document.createElement("form");
                  console.log(
                    "form ----------------------------------------------->:",
                    form
                  );
                  // Set the form's method to POST
                  form.method = "POST";
                  // Set the form's action to the URL where the POST request should be sent
                  form.action = url;
                  // Set the form's target to '_blank' to open the result in a new tab
                  form.target = "_blank";

                  // Loop through each key in the data object
                  for (const key in data) {
                    // Only add real data fields, not inherited ones
                    if (data.hasOwnProperty(key)) {
                      // Create a hidden input element for each key-value pair
                      const input = document.createElement("input");
                      input.type = "hidden";
                      input.name = key;
                      input.value = data[key];
                      // Append the input element to the form
                      form.appendChild(input);
                    }
                  }

                  // Append the form to the document body
                  document.body.appendChild(form);
                  // Submit the form, which sends the POST request and opens the result in a new tab
                  form.submit();
                  // Remove the form from the document body
                  document.body.removeChild(form);
                }}
                title="Order now"
                className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 flex items-center gap-3 cursor-pointer text-sm sm:text-base"
              >
                <span className="flex items-center gap-2 justify-center w-full">
                  Order Now
                  <MdShoppingCartCheckout size={20} />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ItemModal */}
      <ItemModal
        item={selectedItem}
        existingItem={existingItemForEdit}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}
