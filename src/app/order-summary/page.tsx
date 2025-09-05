"use client";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
//import { getOrderById } from "@/actions/order";

const OrderSummaryContent: React.FC = () => {
  const [showOrderInfo, setShowOrderInfo] = useState<any>(null);
  const searchParams = useSearchParams();
//   useEffect(() => {
//     const fetchOrder = async () => {
//       // Retrieve the data parameter from the URL
//       const id = searchParams.get("id");

//       if (id) {
//         const order = await getOrderById(id);
//         setShowOrderInfo(order);
//       } else {
//         setShowOrderInfo(null);
//       }

//       // Clear the cart items from localStorage
//       localStorage.setItem("cartItems", "");
//     };

//     fetchOrder();
//   }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {showOrderInfo ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <p className="text-gray-700 mb-4">
              Thank you for your purchase! Your payment has been successfully
              processed.
            </p>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-2">Order Details</h3>
              <p className="text-gray-700">Order ID: {showOrderInfo?.orderid}</p>
              <p className="text-gray-700">Name: {showOrderInfo?.name}</p>
              <p className="text-gray-700">Email: {showOrderInfo?.email}</p>
              <p className="text-gray-700">Phone: {showOrderInfo?.phone}</p>
              <h4 className="text-lg font-semibold mt-4">Items Ordered</h4>

              <ul className="list-disc list-inside text-gray-700">
                {showOrderInfo?.orderItems.map((item: any, index: any) => (
                  <li key={index}>
                    {item.title} (Qty: {item.number}): ${item.price}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Total: $ {showOrderInfo?.totalAmount}
              </h3>
            </div>
          </>
        ) : (
          <h2 className="text-2xl font-bold mb-4"> There is no order found ...</h2>
        )}
        <Link href="/">
          <div className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center">
            Back to home
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