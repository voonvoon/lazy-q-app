"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {

      const { cartItems, totalPrice, totalItems } = useCart();
    return (
        <main className="p-8 bg-white rounded shadow">
            <h1 className="text-3xl font-bold text-black mb-4">Checkout</h1>
            <p className="text-black">Welcome to the checkout page.</p>
                 {/* Order Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Your Order ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h3>
          
          {cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      
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
                    </div>
                    
                    <div className="text-right ml-3">
                      <p className="font-semibold text-gray-800">
                        RM{(Number(item.price) * Number(item.quantity)).toFixed(2)}
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
                <span>Tax (6%):</span>
                <span>RM{(totalPrice * 0.06).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>RM3.00</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total:</span>
                  <span>RM{(totalPrice + (totalPrice * 0.06) + 3.00).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
    );
}