"use client";

import Link from "next/link";
import { FiShoppingBag, FiUsers, FiDollarSign } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useMerchant } from "@/contexts/MerchantContext";
import MerchantSwitcher from "@/components/admin/MerchantSwitcher";
import MerchantSelector from "@/components/admin/MerchantSelector";
import { getMerchantsByUserId } from "@/lib/actions/merchants";

export default function AdminPage() {
    const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | undefined | null>(null);
  
  // const [mockMerchants] = useState([
  //   {
  //     _id: "test-restaurant-1",
  //     name: "Pizza Palace",
  //     email: "pizza@example.com",
  //     isActive: true,
  //     address: "123 Pizza Street",
  //   },
  //   {
  //     _id: "test-restaurant-2",
  //     name: "Burger Barn",
  //     email: "burger@example.com",
  //     isActive: true,
  //     address: "456 Burger Avenue",
  //   },
  // ]);

  const {
    selectedMerchant,
    selectedMerchantId,
    isLoading,
    initializeMerchants,
    allMerchants,
  } = useMerchant();



  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🚀 Fetching real merchant data...');
        setIsLoadingData(true);
        
        const result = await getMerchantsByUserId();
        
        if (result.success) {
          console.log('✅ Got real data:', result.merchants);
          initializeMerchants(result.merchants);
        } else {
          console.error('❌ Server action failed:', result.error);
          setError(result.error);
        }
        
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load merchant data');
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, []);

  console.log("🧪 Current State:");
  console.log("- Selected ID:", selectedMerchantId);
  console.log("- Selected Merchant:", selectedMerchant);
  console.log("- All Merchants:", allMerchants);

  // Show loading
  if (isLoading || isLoadingData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">❌ Error Loading Data</h2>
          <p className="text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // No merchants found
  if (allMerchants.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-6">🏪</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">No Restaurants Found</h1>
        <p className="text-gray-600 mb-8">
          You don't have any restaurants associated with your account yet.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">🔍 Real Database Query Results:</p>
          <p className="text-blue-700 text-sm mt-1">
            Searched for merchants with owner ID from your session.
          </p>
        </div>
      </div>
    );
  }

  // You'll need to create these functions for super admin stats
  const totalMerchants = 0;
  const totalUsers = 0; // TODO: Implement getUserCount()
  const totalRevenue = 0; // TODO: Implement getTotalRevenue()
  // No merchant selected - show MerchantSelector
  if (!selectedMerchantId || !selectedMerchant) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏪 Restaurant Dashboard
          </h1>
          <p className="text-gray-600">
            You manage {allMerchants.length} restaurants. Select one to
            continue:
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800">🧪 TEST DEBUG:</h3>
          <ul className="text-sm text-blue-700 mt-2">
            <li>• Found {allMerchants.length} restaurants</li>
            <li>• Current selection: {selectedMerchantId || "None"}</li>
            <li>
              • Context initialized: {allMerchants.length > 0 ? "Yes" : "No"}
            </li>
          </ul>
        </div>

        {/* ✅ Use your MerchantSelector component */}
        <MerchantSelector />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">Admin dashboard overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Customers"
          value={totalMerchants}
          icon={FiShoppingBag}
          color="blue"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={FiUsers}
          color="green"
        />
        <StatsCard
          title="System Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={FiDollarSign}
          color="purple"
        />
      </div>

      {/* Recent Merchants */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            All Merchants
          </h2>
          <p className="text-sm text-gray-500">
            All merchants under the same user admin
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-green-800 font-semibold flex items-center">
              🎉 SUCCESS! Dashboard Loaded
            </h2>
            <p className="text-green-700 mt-1">
              You're now managing: <strong>{selectedMerchant.name}</strong>
            </p>
            <p className="text-sm text-green-600">
              Merchant ID: {selectedMerchant._id}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedMerchant.name} Dashboard
                </h1>
                <p className="text-gray-600">{selectedMerchant.email}</p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  {selectedMerchant.isActive ? "🟢 Active" : "🔴 Inactive"}
                </p>
              </div>

              {/* ✅ Show switcher only if multiple merchants */}
              {allMerchants.length > 1 && (
                <div className="flex flex-col items-end space-y-2">
                  <p className="text-sm text-gray-500">Switch Restaurant:</p>
                  <MerchantSwitcher />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Restaurant Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Restaurant Name</p>
                <p className="font-medium text-gray-900">{selectedMerchant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedMerchant.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-sm text-gray-900">{selectedMerchant.address?.street}</p>
                <p className="font-sm text-gray-900">{selectedMerchant.address?.city}</p>
                <p className="font-sm text-gray-900">{selectedMerchant.address?.state}</p>
                <p className="font-sm text-gray-900">{selectedMerchant.address?.zipCode}</p>
                <p className="font-sm  text-gray-900">{selectedMerchant.address?.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{selectedMerchant.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {selectedMerchant.isActive ? (
                    <span className="text-green-600">🟢 Active</span>
                  ) : (
                    <span className="text-red-600">🔴 Inactive</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🧪 Test Actions
          </h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Test Reload (Should Remember Selection)
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              🗑️ Clear Selection & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div
          className={`${
            colorClasses[color as keyof typeof colorClasses]
          } p-3 rounded-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
