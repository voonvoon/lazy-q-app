// components/forms/MerchantForm.tsx
"use client";

import { createMerchant, updateMerchant } from "@/lib/actions/merchants";
import { getAdminUsers } from "@/lib/actions/users";
import { IMerchant } from "@/models/Merchants";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast'; // ← Add this import

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

    try {
      let result;

      if (isEditing) {
        result = await updateMerchant(
          //Is this really a restaurant? not empty?
          //Does it have an ID number?
          //can safely read the ID?
          typeof merchant === "object" && merchant !== null && "_id" in merchant
            ? String((merchant as { _id: unknown })._id)
            : "",
          formData
        );
      } else {
        result = await createMerchant(formData);
      }

      // Check if there's an error in the result
      if (result && "error" in result) {
        setError(result.error ?? "An unknown error occurred");
        setIsSubmitting(false);
        return;
      }

     // ✅ Success toast
      if (isEditing) {
        toast.success(`${merchant?.name} updated successfully! ✅`, {
          duration: 4000,
          icon: '🎉',
        });
      } else {
        toast.success('Restaurant created successfully! 🏪', {
          duration: 4000,
          icon: '🎉',
        });
      }

      // Small delay to let user see the success toast before redirect
      setTimeout(() => {
        router.push("/dashboard/super-admin");
      }, 1000);
    } catch (error) {
      // This might catch the NEXT_REDIRECT error, which is actually success
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        // This is actually a successful redirect, let it happen
        return;
      }

      // Real error
      setError(error instanceof Error ? error.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 ">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="admin@pizzapalace.com"
              />
            </div>
          </div>
        </div>

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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="https://print-server.example.com/api"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()} //Go back to the previous page!
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
