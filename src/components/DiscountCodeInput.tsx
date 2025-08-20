import React, { useState } from "react";
import { verifyDiscountCode } from "@/lib/actions/discount"; // adjust import as needed
import { useCart } from "@/contexts/CartContext";
import { FaSpinner } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

export default function DiscountCodeInput({
  merchantId,
}: {
  merchantId: string;
}) {
  const { discount, setDiscount } = useCart();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyDiscountCode(merchantId, code);
      if (res.success) {
        setResult({
          success: true,
          message: "Discount applied!",
        });
        if (res.discount) {
          setDiscount(res.discount);
        } else {
          setDiscount(null);
        }
      } else {
        setResult({ success: false, message: res.error || "Invalid code." });
      }
    } catch (err) {
      setResult({ success: false, message: "Server error. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="mb-1">
      <div className="flex  gap-1">
        {discount ? (
            <div className="flex items-center gap-4">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-semibold">
              {discount.code}
            </span>
            <button
              onClick={() => {
                setDiscount(null);
                setCode("");
                setResult(null);
              }}
              className="text-xs text-red-400 hover:underline cursor-pointer"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border px-3 py-2 rounded w-60 text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-0 border-gray-300"
              placeholder="Enter Discount Code"
              disabled={loading}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              className={`className="py-2 px-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-normal rounded shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 flex items-center gap-3 cursor-pointer text-xs sm:text-base" ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin text-white" />
              ) : (
                "apply"
              )}
            </button>
          </>
        )}
      </div>
      {result && (
        <div
          className={`mt-1 text-xs ${
            result.success ? "text-green-700" : "text-red-600"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
