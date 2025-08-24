// components/forms/MerchantForm.tsx
"use client";

import { createMerchant, updateMerchant } from "@/lib/actions/merchants";
import { getAdminUsers } from "@/lib/actions/users";
import { IMerchant } from "@/models/Merchant";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiLock, FiKey } from "react-icons/fi";
import { getPaymentConfig } from "@/lib/actions/payment-config";
import BusinessHoursForm from "./BusinessHoursForm";

interface MerchantFormProps {
  merchant?: IMerchant;
  isEditing?: boolean;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
}

export default function MerchantForm({
  merchant,
  isEditing = false,
}: MerchantFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState(false); // ← New state

  // Fetch admin users on component mount
  useEffect(() => {
    async function fetchAdminUsers() {
      try {
        const result = await getAdminUsers();
        if (result.error) {
          setError(result.error);
        } else {
          setAdminUsers(result.users as AdminUser[]);
        }
      } catch (err) {
        setError("Failed to load admin users");
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchAdminUsers();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    const loadingToast = toast.loading(
      isEditing ? `Updating ${merchant?.name}...` : "Creating new restaurant..."
    );

    try {
      let result;

      if (isEditing) {
        result = await updateMerchant(
          typeof merchant === "object" && merchant !== null && "_id" in merchant
            ? String((merchant as { _id: unknown })._id)
            : "",
          formData
        );
      } else {
        result = await createMerchant(formData);
      }

      toast.dismiss(loadingToast);

      if (result && "error" in result) {
        toast.error(result.error ?? "An unknown error occurred");
        setError(result.error ?? "An unknown error occurred");
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        toast.success(`${merchant?.name} updated successfully! ✅`, {
          duration: 4000,
          icon: "🎉",
        });
      } else {
        toast.success("Restaurant created successfully! 🏪", {
          duration: 4000,
          icon: "🎉",
        });
      }

      setTimeout(() => {
        router.push("/dashboard/super-admin");
      }, 1000);
    } catch (error) {
      toast.dismiss(loadingToast);

      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

    // ✅ Prepare business hours data for editing
  const getBusinessHoursForEdit = () => {
    if (!isEditing || !merchant?.businessHours) return undefined;
    
    // Convert merchant business hours to component format
    return merchant.businessHours.map(hour => ({
      day: hour.day,
      open: hour.open || '09:00',
      close: hour.close || '22:00', 
      isClosed: hour.isClosed || false
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {isEditing ? `Edit ${merchant?.name}` : "Create New Restaurant"}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* Owner Selection - Only show for create mode */}
        {!isEditing && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Assign Owner
            </h3>

            <div>
              <label
                htmlFor="owner"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Restaurant Owner (Admin) *
              </label>
              {loadingUsers ? (
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Loading admin users...
                </div>
              ) : (
                <select
                  id="owner"
                  name="owner"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Select an admin user...</option>
                  {adminUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Only admin users can own restaurants
              </p>
            </div>
          </div>
        )}
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Basic Information
          </h3>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Restaurant Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={merchant?.name || ""}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Pizza Palace"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={merchant?.description || ""}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Best pizza in town!"
              rows={3}
            />
          </div>
        </div>
        {/* Contact Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={merchant?.phone || ""}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="+60123456789"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={merchant?.email || ""}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="admin@pizzapalace.com"
              />
            </div>
          </div>
        </div>

        {/* Business Hours Section */}
         <BusinessHoursForm 
          defaultHours={getBusinessHoursForEdit()}
          isEditing={isEditing}
        />
        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Address
          </h3>

          <div>
            <label
              htmlFor="street"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Street Address *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              required
              defaultValue={merchant?.address?.street || ""}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                defaultValue={merchant?.address?.city || ""}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Kuala Lumpur"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                defaultValue={merchant?.address?.state || ""}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Selangor"
              />
            </div>

            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Zip Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                required
                defaultValue={merchant?.address?.zipCode || ""}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="50000"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              defaultValue={merchant?.address?.country || "Malaysia"}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>
        </div>
        {/* ✅ Payment Configuration Section - Always show */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FiLock className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">
              Payment Configuration
            </h3>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <FiKey className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Security Notice:</strong> Private keys are encrypted
                  before storage. Leave empty to keep existing keys when
                  editing.
                </p>
              </div>
            </div>
          </div>
          {/* FiUU Merchant ID */}
        <div>
          <label
            htmlFor="fiuuMerchantId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            FiUU Merchant ID
          </label>
          <input
            type="text"
            id="fiuuMerchantId"
            name="fiuuMerchantId"
            defaultValue={merchant?.paymentConfig?.fiuuMerchantId || ""}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black font-mono text-sm"
            placeholder="merchant_id_1234567890"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your unique FiUU Merchant ID for payment integration.
          </p>
        </div>

          {/* Verify Key (Public) */}
          <div>
            <label
              htmlFor="fiuuVerifyKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              FiUU Verify Key (Public) 📖
            </label>
            <input
              type="text"
              id="fiuuVerifyKey"
              name="fiuuVerifyKey"
              defaultValue=""
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black font-mono text-sm"
              placeholder="verify_key_1234567890abcdef"
            />
            <p className="mt-1 text-xs text-gray-500">
              ✅ Safe for client-side code and webhooks
            </p>
          </div>

          {/* Private Key */}
          <div>
            <label
              htmlFor="fiuuPrivateKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              FiUU Private Key
            </label>
            <div className="relative">
              <input
                type={showPrivateKey ? "text" : "password"}
                id="fiuuPrivateKey"
                name="fiuuPrivateKey"
                defaultValue="" // ← Always empty for security
                className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black font-mono text-sm"
                placeholder="sk_test_..."
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPrivateKey ? (
                  <FiEyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FiEye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-red-600">
              ⚠️ Keep this secret! It will be encrypted before storage.
              {isEditing && " Leave empty to keep existing key."}
            </p>
          </div>
        </div>
        {/* Settings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="plan"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Plan
              </label>
              <select
                id="plan"
                name="plan"
                defaultValue={merchant?.plan || "free"}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="printServerApi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Print Server API
              </label>
              <input
                type="url"
                id="printServerApi"
                name="printServerApi"
                defaultValue={merchant?.printServerApi || ""}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="https://print-server.example.com/api"
              />
            </div>
          </div>
        </div>
 
        {/* Simple Debug - DEV ONLY */}
        {isEditing && process.env.NODE_ENV === "development" && (
          <div className="mt-2 p-4 bg-gray-100 rounded text-xs">
            <button
              type="button"
              onClick={async () => {
                const result = await getPaymentConfig(
                  String((merchant as any)._id)
                );
                console.log("🧪 Debug:", result);
                alert(
                  `Verify: ${result.config?.fiuuVerifyKey}\nSecret: ${result.config?.fiuuPrivateKey}`
                );
              }}
              className="px-4 py-4 bg-gray-800 text-white rounded text-xs cursor-pointer"
            >
              See Secret Values (DEV ONLY)
            </button>
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!isEditing && adminUsers.length === 0)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Restaurant"
              : "Create Restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
}
