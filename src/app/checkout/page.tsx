"use client";

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { getItemByIdForEdit } from "@/lib/actions/frontShop";
import ItemModal from "@/components/ItemModal";

export default function CheckoutPage() {
  const { cartItems, totalPrice, totalItems, clearCart, merchantData } =
    useCart();

  // State for modal and selected item
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  console.log("selectedItem--------------------->", selectedItem);
  console.log("modalOpen--------------------->", modalOpen);  

  // Handler for Edit button
  const handleEdit = async (itemId: string) => {
    try {
      const item: any = await getItemByIdForEdit(itemId);
      setSelectedItem(item);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch item for edit:", err);
    }
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <main className="p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-black mb-4">Checkout</h1>
      <p className="text-black">Welcome to the checkout page.</p>
      {/* Order Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Your Order ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h3>

        {cartItems.length > 0 ? (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white p-3 rounded-lg shadow-sm"
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
                    <button
                      className="mt-2 py-1 px-3 bg-yellow-400 hover:bg-yellow-500 text-black text-xs rounded transition cursor-pointer"
                      onClick={() => handleEdit(item.itemId)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="text-right ml-3">
                    <p className="font-semibold text-gray-800">
                      RM
                      {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
              <span>SST ({merchantData?.tax ?? 6}%):</span>
              <span>
                RM{(totalPrice * ((merchantData?.tax ?? 6) / 100)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span>RM{merchantData?.deliveryFee?.toFixed(2) ?? "Free"}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span>
                  RM{(totalPrice + totalPrice * 0.06 + 3.0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => window.history.back()}
                className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded transition cursor-pointer"
              >
                Add Order
              </button>
              <button
                onClick={clearCart}
                className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition cursor-pointer"
              >
                Clear Cart
              </button>
              <button className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition cursor-pointer">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ItemModal */}
      <ItemModal
        item={selectedItem}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}
