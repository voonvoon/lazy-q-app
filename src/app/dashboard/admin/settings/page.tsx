"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useMerchant } from "@/contexts/MerchantContext";
import { updateMerchantSettings } from "@/lib/actions/settings";
import AdminSkeleton from "@/components/skeleton/AdminSkeleton";

// ✅ Zod Schema - Same validation as server
const merchantSettingsSchema = z.object({
  tax: z
    .number()
    .min(0, "Tax must be 0 or greater")
    .max(100, "Tax must be 100 or less"),
  allowedDelivery: z.boolean(),
  deliveryFee: z
    .number()
    .min(0, "Delivery fee must be 0 or greater")
    .max(100, "Delivery fee must be 100 or less"),
  freeDeliveryThreshold: z
    .number()
    .min(0, "Free delivery threshold must be 0 or greater"),
  allowPreorder: z.boolean().optional(),
  firstOrderTime: z.string().optional(),
  lastOrderTime: z.string().optional(),
});

type MerchantSettingsForm = z.infer<typeof merchantSettingsSchema>;

export default function AdminSettingsPage() {
  const { selectedMerchant, isLoading: merchantLoading } = useMerchant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // React Hook Form with Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MerchantSettingsForm>({
    resolver: zodResolver(merchantSettingsSchema),
    defaultValues: {
      tax: 6,
      allowedDelivery: true,
      deliveryFee: 5.0,
      freeDeliveryThreshold: 0,
      allowPreorder: false,
      firstOrderTime: "10:00",
      lastOrderTime: "21:00",
    },
  });

  // ✅ Watch allowedDelivery for conditional rendering
  const watchAllowedDelivery = watch("allowedDelivery");
  const watchAllowPreorder = watch("allowPreorder");

  // ✅ Auto-load current user's merchant settings
  useEffect(() => {
    if (!merchantLoading && selectedMerchant && !settingsLoaded) {
      // Populate form with current merchant data
      setValue("tax", selectedMerchant.tax || 6);
      setValue("allowedDelivery", selectedMerchant.allowedDelivery ?? true); // use ?? over||to preserve false, ?? only replaces null/undefined, NOT false!
      setValue("deliveryFee", selectedMerchant.deliveryFee || 5.0);
      setValue(
        "freeDeliveryThreshold",
        selectedMerchant.freeDeliveryThreshold || 0
      );
      setValue("allowPreorder", selectedMerchant.allowPreorder ?? false);
      setValue("firstOrderTime", selectedMerchant.firstOrderTime || "10:00");
      setValue("lastOrderTime", selectedMerchant.lastOrderTime || "21:00");
      setSettingsLoaded(true);
    }
  }, [selectedMerchant, merchantLoading, setValue, settingsLoaded]);

  // ✅ Form Submit Handler
  const onSubmit = async (data: MerchantSettingsForm) => {
    if (!selectedMerchant) {
      toast.error("No merchant selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("tax", data.tax.toString());
      formData.append(
        "allowedDelivery",
        data.allowedDelivery ? "true" : "false"
      );
      formData.append("deliveryFee", data.deliveryFee.toString());
      formData.append(
        "freeDeliveryThreshold",
        data.freeDeliveryThreshold.toString()
      );
      formData.append("allowPreorder", data.allowPreorder ? "true" : "false");
      formData.append("firstOrderTime", data.firstOrderTime || "");
      formData.append("lastOrderTime", data.lastOrderTime || "");

      // Call server action
      const result = await updateMerchantSettings(
        selectedMerchant._id,
        formData
      );

      if (result.success) {
        toast.success("Settings updated successfully! 🎉");
        // Stay on same page - no redirect
      } else {
        toast.error(result.message || "Failed to update settings");
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error("An error occurred while updating settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset to defaults
  const handleResetDefaults = () => {
    if (confirm("Reset all settings to defaults? This cannot be undone.")) {
      reset({
        tax: 6,
        allowedDelivery: true,
        deliveryFee: 5.0,
        freeDeliveryThreshold: 0,
        allowPreorder: false,
        firstOrderTime: "10:00", 
        lastOrderTime: "21:00", 
      });
      toast.success("Settings reset to defaults, please review and save.");
    }
  };

  // ✅ Loading state
  if (merchantLoading) {
    return <AdminSkeleton />;
  }

  // ✅ No merchant selected
  if (!selectedMerchant) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4 text-black">
            Merchant Settings
          </h1>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No merchant found for your account.
            </p>
            <p className="text-sm text-gray-500">
              Please select a merchant to manage their settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        {/* ✅ Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Merchant Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure your restaurant business settings
            </p>
            <p className="text-sm text-blue-600 font-medium">
              {selectedMerchant.name}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Reset to Defaults
          </button>
        </div>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ✅ Tax Setting */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tax Configuration
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register("tax", { valueAsNumber: true })} //Auto converts input string values to numbers
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="6.0"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">
                  %
                </span>
              </div>
              {errors.tax && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tax.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Standard SST in Malaysia is 6%
              </p>
            </div>
          </div>

          {/* ✅ Delivery Settings */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delivery Configuration
            </h3>

            <div className="space-y-4">
              {/* ✅ Toggle Switch for Delivery */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enable Delivery Service
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow customers to order for delivery
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("allowedDelivery")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* ✅ Delivery Fee (conditional) */}
              {watchAllowedDelivery && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">
                        RM
                      </span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        {...register("deliveryFee", { valueAsNumber: true })}
                        className="w-full pl-10 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="5.00"
                      />
                    </div>
                    {errors.deliveryFee && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.deliveryFee.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Delivery Threshold
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">
                        RM
                      </span>
                      <input
                        type="number"
                        step="1.00"
                        min="0"
                        {...register("freeDeliveryThreshold", {
                          valueAsNumber: true,
                        })}
                        className="w-full pl-10 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="0"
                      />
                    </div>
                    {errors.freeDeliveryThreshold && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.freeDeliveryThreshold.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Set to 0 to disable free delivery. Orders above this
                      amount get free delivery.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pre-order Settings */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pre-order Configuration
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Allow Pre-order
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Let customers schedule orders for later
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("allowPreorder")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {/* Show time fields only if allowPreorder is true */}
            {watchAllowPreorder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Order Time
                  </label>
                  <input
                    type="time"
                    {...register("firstOrderTime")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Earliest time customers can pre-order (e.g. 10:00)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Order Time
                  </label>
                  <input
                    type="time"
                    {...register("lastOrderTime")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Latest time customers can pre-order (e.g. 21:30)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
