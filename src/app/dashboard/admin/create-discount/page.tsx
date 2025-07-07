"use client";

import { useState, useEffect } from "react";
import { useMerchant } from "@/contexts/MerchantContext";
import { createDiscount, getDiscountsByMerchant, updateDiscount, deleteDiscount } from "@/lib/actions/discount";
import { z } from "zod";
import toast from "react-hot-toast";

// Zod schema for validation
const discountSchema = z.object({
  code: z.string().optional(),
  type: z.enum(["amount", "percentage"], { required_error: "Type is required" }),
  value: z
    .string()
    .min(1, "Value is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Value must be a positive number",
    }),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

export default function CreateDiscountPage() {
  const { selectedMerchant } = useMerchant();

  const [form, setForm] = useState({
    code: "",
    type: "amount",
    value: "",
    expiryDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // For listing and editing
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch discounts on mount or merchant change
  useEffect(() => {
    if (!selectedMerchant?._id) return;
    getDiscountsByMerchant(selectedMerchant._id).then((res) => {
      if (res.success) setDiscounts(res.discounts);
    });
  }, [selectedMerchant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = discountSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!selectedMerchant?._id) {
      toast.error("No merchant selected.");
      return;
    }

    setLoading(true);
    let res;
    if (editingId) {
      res = await updateDiscount(editingId, {
        ...result.data,
        merchant: selectedMerchant._id,
        expiryDate: new Date(result.data.expiryDate),
      });
    } else {
      res = await createDiscount({
        ...result.data,
        merchant: selectedMerchant._id,
        expiryDate: new Date(result.data.expiryDate),
      });
    }
    setLoading(false);

    if (res.success) {
      toast.success(editingId ? "Discount updated!" : "Discount created!");
      setForm({
        code: "",
        type: "amount",
        value: "",
        expiryDate: "",
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

  // Auto-generate code
  const handleAutoGenerate = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm((prev) => ({ ...prev, code }));
  };

  // Load discount into form for editing
  const handleEdit = (d: any) => {
    setForm({
      code: d.code || "",
      type: d.type,
      value: d.value.toString(),
      expiryDate: d.expiryDate?.split("T")[0] || "",
    });
    setEditingId(d._id);
    setErrors({});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setForm({
      code: "",
      type: "amount",
      value: "",
      expiryDate: "",
    });
    setEditingId(null);
    setErrors({});
  };

  // Delete discount
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this discount?")) return;
    setLoading(true);
    const res = await deleteDiscount(id);
    setLoading(false);
    if (res.success) {
      toast.success("Discount deleted!");
      // Refresh list
      getDiscountsByMerchant(selectedMerchant._id).then((res) => {
        if (res.success) setDiscounts(res.discounts);
      });
      // If deleting the one being edited, reset form
      if (editingId === id) handleCancelEdit();
    } else {
      toast.error(res.error || "Failed to delete discount.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{editingId ? "Edit Discount" : "Create Discount"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Discount Code */}
          <div>
            <label className="block font-medium mb-1">
              Discount Code
              <button
                type="button"
                className="ml-2 text-xs text-blue-600 underline cursor-pointer"
                onClick={handleAutoGenerate}
                tabIndex={-1}
              >
                Auto-generate
              </button>
            </label>
            <input
              type="text"
              name="code"
              className="border rounded px-3 py-2 w-full text-black"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. SAVE10"
              autoComplete="off"
            />
            {errors.code && <div className="text-red-600 text-sm mt-1">{errors.code}</div>}
          </div>
          {/* Type */}
          <div>
            <label className="block font-medium mb-1 cursor-pointer">Type</label>
            <select
              name="type"
              className="border rounded px-3 py-2 w-full text-black cursor-pointer"
              value={form.type}
              onChange={handleChange}
            >
              <option value="amount">Amount (RM)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
            {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
          </div>
          {/* Value */}
          <div>
            <label className="block font-medium mb-1">
              {form.type === "amount" ? "Amount (RM)" : "Percentage (%)"}
            </label>
            <input
              type="number"
              name="value"
              className="border rounded px-3 py-2 w-full text-black"
              value={form.value}
              onChange={handleChange}
              min={form.type === "percentage" ? 1 : 0.01}
              max={form.type === "percentage" ? 100 : undefined}
              step="any"
              placeholder={form.type === "amount" ? "e.g. 10" : "e.g. 5"}
            />
            {errors.value && <div className="text-red-600 text-sm mt-1">{errors.value}</div>}
          </div>
          {/* Expiry Date */}
          <div>
            <label className="block font-medium mb-1 cursor-pointer">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              className="border rounded px-3 py-2 w-full text-black cursor-pointer"
              value={form.expiryDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.expiryDate && <div className="text-red-600 text-sm mt-1">{errors.expiryDate}</div>}
          </div>
          {/* Submit */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition cursor-pointer"
              disabled={loading}
            >
              {loading ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update Discount" : "Create Discount"}
            </button>
            {editingId && (
              <button
                type="button"
                className="flex-1 bg-gray-300 text-black py-2 rounded font-semibold hover:bg-gray-400 transition cursor-pointer"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
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
                  onClick={() => handleDelete(d._id)}
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
                    {d.type === "amount"
                      ? `RM${d.value}`
                      : `${d.value}%`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Exp: {d.expiryDate?.split("T")[0]}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}