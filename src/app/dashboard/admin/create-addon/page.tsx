"use client";

import { useMerchant } from "@/contexts/MerchantContext";
import { useState, useEffect } from "react";
import {
  createAddOn,
  getAddOnsByMerchant,
  updateAddOn,
  deleteAddOn,
} from "@/lib/actions/addon";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const addOnSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Add-on name at least 2 chars")
    .max(30, "Name too long"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
});

type AddOnForm = z.infer<typeof addOnSchema>;

export default function CreateAddOnPage() {
  const { selectedMerchant } = useMerchant();
  const [addOns, setAddOns] = useState<any[]>([]);
  const [editAddOn, setEditAddOn] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);// Used to trigger re-fetching

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddOnForm>({
    resolver: zodResolver(addOnSchema),
    defaultValues: { name: "", price: 0 },
  });

  // Fetch add-ons
  useEffect(() => {
    if (!selectedMerchant) return;
    getAddOnsByMerchant(selectedMerchant._id).then((res) => {
      if (res.success) setAddOns(res.addOns ?? []);
    });
  }, [selectedMerchant, refreshKey]);

  if (!selectedMerchant) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/admin";
    }
    return null;
  }

  // Handle create or update
  async function onFormSubmit(data: AddOnForm) {
    try {
      let result;
      if (editAddOn) {
        result = await updateAddOn(editAddOn._id, {
          name: data.name,
          price: data.price,
        });
      } else {
        result = await createAddOn({
          name: data.name,
          price: data.price,
          merchantId: selectedMerchant._id,
        });
      }
      if (result.success) {
        toast.success(editAddOn ? "Add-on updated!" : "Add-on created!");
        reset({ name: "", price: 0 });
        setEditAddOn(null);
         setRefreshKey((k) => k + 1); 
      } else {
        toast.error(result.error || "Failed to save add-on.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  // Handle edit
  function handleEdit(addOn: any) {
    setEditAddOn(addOn);
    reset({ name: addOn.name, price: addOn.price });
  }

  // Handle delete
  async function handleDelete() {
    if (!editAddOn) return;
    try {
      const result = await deleteAddOn(editAddOn._id);
      if (result.success) {
        toast.success("Add-on deleted!");
        reset({ name: "", price: 0 });
        setEditAddOn(null);
         setRefreshKey((k) => k + 1); 
      } else {
        toast.error(result.error || "Failed to delete add-on.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">
      {selectedMerchant && (
        <div className="mb-2 text-sm font-semibold text-blue-700">
          Merchant: {selectedMerchant.name}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-black">
        {editAddOn ? "Edit Add-on" : "Create New Add-on"}
      </h1>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="addOnName">
            Add-on Name
          </label>
          <input
            id="addOnName"
            type="text"
            className="w-full border rounded px-3 py-2 text-black mb-2"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <div className="text-red-600 text-sm">{errors.name.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="addOnPrice">
            Price (RM)
          </label>
          <input
            id="addOnPrice"
            type="number"
            step="0.01"
            //min="0"
            className="w-full border rounded px-3 py-2 text-black"
            {...register("price")}
            disabled={isSubmitting}
          />
          {errors.price && (
            <div className="text-red-600 text-sm">{errors.price.message}</div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
            disabled={isSubmitting || !watch("name").trim()}
          >
            {isSubmitting
              ? editAddOn
                ? "Updating..."
                : "Creating..."
              : editAddOn
              ? "Update Add-on"
              : "Create Add-on"}
          </button>
          {editAddOn && (
            <>
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
                onClick={() => {
                  setEditAddOn(null);
                  reset({ name: "", price: 0 });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
      <hr className="my-8" />
      <h2 className="text-lg font-semibold mb-2 text-black">
        Existing Add-ons
      </h2>
      <div className="flex flex-wrap gap-2">
        {addOns.map((addOn) => (
          <button
            key={addOn._id}
            type="button"
            className={`px-4 py-2 rounded border cursor-pointer ${
              editAddOn && editAddOn._id === addOn._id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-blue-100"
            }`}
            onClick={() => handleEdit(addOn)}
          >
            {addOn.name} (RM{addOn.price.toFixed(2)})
          </button>
        ))}
        {addOns.length === 0 && (
          <div className="text-gray-500">No add-ons found.</div>
        )}
      </div>
    </div>
  );
}
