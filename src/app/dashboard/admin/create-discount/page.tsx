"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMerchant } from "@/contexts/MerchantContext";
import {
  createDiscount,
  getDiscountsByMerchant,
  updateDiscount,
  deleteDiscount,
} from "@/lib/actions/discount";
import toast from "react-hot-toast";

// Zod schema for validation
const discountSchema = z.object({
  code: z.string().optional(),
  type: z.enum(["amount", "percentage"], {
    required_error: "Type is required",
  }),
  value: z
    .string()
    .min(1, "Value is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Value must be a positive number",
    }),
  expiryDate: z.string().min(1, "Expiry date is required"),
  useOnce: z.boolean().optional(),
});

type DiscountFormType = z.infer<typeof discountSchema>;

export default function CreateDiscountPage() {
  const { selectedMerchant } = useMerchant();
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: "",
      type: "amount",
      value: "",
      expiryDate: "",
      useOnce: false,
    },
  });

  // Fetch discounts on mount or merchant change
  useEffect(() => {
    if (!selectedMerchant?._id) return;
    getDiscountsByMerchant(selectedMerchant._id).then((res) => {
      if (res.success) setDiscounts(res.discounts);
    });
  }, [selectedMerchant]);

  // Auto-generate code
  const handleAutoGenerate = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setValue("code", code);
  };

  // Load discount into form for editing
  const handleEdit = (d: any) => {
    reset({
      code: d.code || "",
      type: d.type,
      value: d.value.toString(),
      expiryDate: d.expiryDate?.split("T")[0] || "", //2025-07-08T00:00:00.000Z,take 1st part
      useOnce: !!d.useOnce, //!!convert any value to a strict boolean
    });
    setEditingId(d._id);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    reset({
      code: "",
      type: "amount",
      value: "",
      expiryDate: "",
      useOnce: false,
    });
    setEditingId(null);
  };

  // Delete discount
  const handleDeleteDiscount = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this discount?"))
      return;
    setLoading(true);
    const res = await deleteDiscount(id);
    setLoading(false);
    if (res.success) {
      toast.success("Discount deleted!");
      // If deleting the one being edited, reset form
      if (editingId === id) handleCancelEdit();
      // Refresh list
      getDiscountsByMerchant(selectedMerchant._id).then((res) => {
        if (res.success) setDiscounts(res.discounts);
      });
    } else {
      toast.error(res.error || "Failed to delete discount.");
    }
  };

  // Submit handler
  const onSubmit = async (data: DiscountFormType) => {
    if (!selectedMerchant?._id) {
      toast.error("No merchant selected.");
      return;
    }

    setLoading(true);
    let res;
    if (editingId) {
      res = await updateDiscount(editingId, {
        ...data,
        merchant: selectedMerchant._id,
        expiryDate: new Date(data.expiryDate),
      });
    } else {
      res = await createDiscount({
        ...data,
        merchant: selectedMerchant._id,
        expiryDate: new Date(data.expiryDate),
      });
    }
    setLoading(false);

    if (res.success) {
      toast.success(editingId ? "Discount updated!" : "Discount created!");
      reset({
        code: "",
        type: "amount",
        value: "",
        expiryDate: "",
        useOnce: false,
      });
      setEditingId(null);
      // Refresh list
      getDiscountsByMerchant(selectedMerchant._id).then((res) => {
        if (res.success) setDiscounts(res.discounts);
      });
    } else {
      toast.error(res.error || "Failed to save discount.");
    }
  };

  // Watch the type field
  const selectedType = watch("type");

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          {editingId ? "Edit Discount" : "Create Discount"}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Discount Code */}
          <div>
            <label className="block font-medium mb-1">
              Discount Code
              <button
                type="button"
                className="ml-2 text-xs text-blue-600 underline cursor-pointer"
                onClick={handleAutoGenerate}
                tabIndex={-1} //not reachable by keyboard tab
              >
                Auto-generate
              </button>
            </label>
            <input
              type="text"
              {...register("code")}
              className="border rounded px-3 py-2 w-full text-black"
              placeholder="e.g. SAVE10"
              autoComplete="off" // Prevent browser from suggesting autofill
            />
            {errors.code && (
              <div className="text-red-600 text-sm mt-1">
                {errors.code.message}
              </div>
            )}
          </div>
          {/* Type */}
          <div>
            <label className="block font-medium mb-1 cursor-pointer">
              Type
            </label>
            <select
              {...register("type")}
              className="border rounded px-3 py-2 w-full text-black cursor-pointer"
            >
              <option value="amount">Amount (RM)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
            {errors.type && (
              <div className="text-red-600 text-sm mt-1">
                {errors.type.message}
              </div>
            )}
          </div>
          {/* Value */}
          <div>
            <label className="block font-medium mb-1">
              {selectedType === "percentage" ? "Percentage (%)" : "Amount (RM)"}
            </label>
            <input
              type="number"
              {...register("value")}
              className="border rounded px-3 py-2 w-full text-black"
              min={1}
              step="any"
              placeholder={selectedType === "percentage" ? "e.g. 5" : "e.g. 10"}
            />
            {errors.value && (
              <div className="text-red-600 text-sm mt-1">
                {errors.value.message}
              </div>
            )}
          </div>
          {/* Expiry Date */}
          <div>
            <label className="block font-medium mb-1 cursor-pointer">
              Expiry Date
            </label>
            <input
              type="date"
              {...register("expiryDate")}
              className="border rounded px-3 py-2 w-full text-black cursor-pointer"
              min={new Date().toISOString().split("T")[0]} //Users cannot pick a date in the past.
            />
            {errors.expiryDate && (
              <div className="text-red-600 text-sm mt-1">
                {errors.expiryDate.message}
              </div>
            )}
          </div>
          {/* Use Once Toggle */}
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("useOnce")}
                className="mr-2 cursor-pointer"
              />
              <span className="font-medium">
                Allow only one use (Auto delete after use)
              </span>
            </label>
          </div>
          {/* Submit & Delete */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition cursor-pointer"
              disabled={loading}
            >
              {loading
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update Discount"
                : "Create Discount"}
            </button>
            {editingId && (
              <>
                <button
                  type="button"
                  className="flex-1 bg-gray-300 text-black py-2 rounded font-semibold hover:bg-gray-400 transition cursor-pointer"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition cursor-pointer"
                  onClick={() => handleDeleteDiscount(editingId)}
                  disabled={loading}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </form>

        {/* Discount List */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">All Discounts</h2>
          <div className="flex flex-wrap gap-2">
            {discounts.length === 0 && (
              <div className="text-gray-500 text-sm">No discounts yet.</div>
            )}
            {discounts.map((d) => (
              <div
                key={d._id}
                className={`px-3 py-2 rounded border text-left text-sm flex flex-col gap-1 min-w-[120px] relative group ${
                  editingId === d._id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-300 hover:bg-blue-50"
                }`}
                style={{ cursor: "pointer" }}
              >
                <button
                  className="absolute top-1 right-1 text-red-500 text-xs opacity-70 hover:opacity-100 cursor-pointer"
                  title="Delete"
                  onClick={() => handleDeleteDiscount(d._id)}
                  type="button"
                >
                  ✕
                </button>
                <button
                  className="text-left w-full"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdit(d)}
                  type="button"
                >
                  <div className="font-bold">{d.code}</div>
                  <div>
                    {d.type === "amount" ? `RM${d.value}` : `${d.value}%`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Exp: {d.expiryDate?.split("T")[0]}
                  </div>
                  {d.useOnce && (
                    <div className="text-xs text-orange-600 font-semibold">
                      Use Once
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
