"use client";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderByOrderId } from "@/lib/actions/order";
import { FaCheckCircle, FaReceipt, FaMoneyBillWave } from "react-icons/fa";

const OrderSummaryContent: React.FC = () => {
  const [showOrderInfo, setShowOrderInfo] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchOrder = async () => {
      const id = searchParams.get("id");
      if (id) {
        const order = await getOrderByOrderId(id);
        setShowOrderInfo(order);
      } else {
        setShowOrderInfo(null);
      }
      localStorage.setItem("lazy-q-cart", "");
    };
    fetchOrder();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-100">
        {showOrderInfo ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <FaCheckCircle className="text-green-500 text-5xl mb-2 animate-bounce" />
              <h2 className="text-xl font-bold mb-2 text-blue-700 text-center sm:text-3xl">
                Payment Successful!
              </h2>
              <p className="text-gray-700 text-center text-base sm:text-lg">
                Your order has been received and is being processed.
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              {showOrderInfo?.merchantName && (
                <div className="text-2xl sm:text-3xl font-extrabold text-center text-blue-800 mb-4 tracking-wide">
                  {showOrderInfo.merchantName}
                </div>
              )}
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-blue-600">
                <FaReceipt /> Order Details
              </h3>
              <div className="space-y-1 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <span>Order No (Today):</span>
                  <span className="font-semibold">
                    {showOrderInfo?.orderSequentialNoForDay}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Pick Time:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.pickTime || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Receipt No:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.receiptNo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">#</span>
                  <span>Order ID:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.orderid}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Name:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.customerInfo?.name}
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <span>Email:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.customerInfo?.email}
                  </span>
                </div> */}
                {/* <div className="flex items-center gap-2">
                  <span>Phone:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.customerInfo?.phone}
                  </span>
                </div> */}

                {showOrderInfo.delivery && (
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-lg">Delivery</div>
                    <div className="flex items-center gap-2">
                      <span>
                        Address: {showOrderInfo.customerInfo?.address}
                        {", "}
                        {showOrderInfo.customerInfo?.postcode},{" "}
                        {showOrderInfo.customerInfo?.state}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span>Order Time:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.createdAt
                      ? new Date(showOrderInfo.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Payment Method:</span>
                  <span className="font-semibold">
                    {showOrderInfo?.paymentMeta?.channel || "-"}
                  </span>
                </div>
              </div>
              <h4 className="text-lg font-semibold mt-6 mb-2 flex items-center gap-2 text-blue-600">
                Items Ordered
              </h4>
              <ul className="mb-2">
                {showOrderInfo?.items?.map((item: any, index: number) => (
                  <li key={index} className="mb-4">
                    <div className="flex items-start gap-2">
                      <div>
                        <span className="font-semibold">
                          {item.title || "-"}
                        </span>{" "}
                        (Qty: {item.quantity || 1}):{" "}
                        <span className="text-blue-700 font-semibold">
                          RM{item.itemTotal?.toFixed(2) ?? "0.00"}
                        </span>
                        {item.addOns && item.addOns.length > 0 && (
                          <ul className="ml-4 mt-1 text-gray-500 text-sm">
                            {item.addOns.map((addOn: any, idx: number) => (
                              <li key={idx}>
                                <span className="text-blue-300">+</span> Add-on:{" "}
                                {addOn.name} (RM
                                {addOn.price?.toFixed(2) ?? "0.00"})
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.remarks && item.remarks.trim() !== "" && (
                          <div className="ml-1 mt-1 text-xs text-gray-600 italic flex items-center gap-1">
                            <span>Remarks: {item.remarks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              {/* Show notes if present */}
              {showOrderInfo?.notes && (
                <div className="mb-1 text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">Remarks:</span>
                  <span>{showOrderInfo.notes}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                <span className="font-semibold">Subtotal:</span>
                <span>RM{showOrderInfo?.subTotal?.toFixed(2) ?? "0.00"}</span>
              </div>

              {/* Discount */}
              {showOrderInfo?.discountAmount > 0 && (
                <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <span className="font-semibold">Discount:</span>
                  <span className="text-red-600">
                    -RM{showOrderInfo.discountAmount?.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Tax */}
              <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                <span className="font-semibold">Tax:</span>
                <span>
                  RM{Number(showOrderInfo?.tax?.totalTax || 0).toFixed(2)}
                </span>
              </div>

              {/* Delivery Fee */}
              {showOrderInfo?.delivery && (
                <div className="mb-1 text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <span className="font-semibold">Delivery Fee:</span>
                  <span>
                    RM{showOrderInfo?.deliveryFee?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
              )}

              {/* Total Paid */}
              <h3 className="text-xl font-bold mt-3 text-green-700 flex items-center gap-2">
                <FaMoneyBillWave />
                Total Paid: RM{showOrderInfo?.totalAmount?.toFixed(2) ?? "0.00"}
              </h3>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-12">
            <FaReceipt className="text-4xl text-gray-400 mb-2" />
            <h2 className="text-2xl font-bold mb-2 text-gray-700">
              There is no order found ...
            </h2>
            <p className="text-gray-500">
              Please check your order ID or try again.
            </p>
          </div>
        )}
        <Link href="/">
          <div className="mt-8 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 text-center font-semibold shadow transition-all duration-200">
            Back to Home
          </div>
        </Link>
      </div>
    </div>
  );
};

const OrderSummary: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSummaryContent />
    </Suspense>
  );
};

export default OrderSummary;
