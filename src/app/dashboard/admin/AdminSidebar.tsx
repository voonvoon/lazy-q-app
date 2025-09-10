"use client";

import Link from "next/link";
import { useMerchant } from "@/contexts/MerchantContext";
import {
  FiSettings,
  FiShield,
  FiGrid,
  FiFolder,
  FiLayers,
  FiGift,
  FiShoppingCart,
  FiPlusCircle,
} from "react-icons/fi";
import { GiMeal, GiKnifeFork } from "react-icons/gi";
import { SiTheboringcompany } from "react-icons/si";

export default function AdminSidebar() {
  const { selectedMerchantId, isLoading } = useMerchant();

  // Check if merchant is selected (context first, could fallback to localStorage if needed)
  const isMerchantSelected = !!selectedMerchantId;

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-6">
        <div className="px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            System Management
          </h2>
          {!isLoading && !isMerchantSelected && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Select a merchant to access all features
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          {/* ✅ Overview is always enabled */}
          <NavLink href="/dashboard/admin" icon={FiGrid}>
            Overview
          </NavLink>

          {/* ✅ All other links are disabled unless merchant is selected */}
          <NavLink
            href="/dashboard/admin/create-category"
            icon={FiFolder}
            disabled={!isMerchantSelected}
          >
            Create Category
          </NavLink>
          <NavLink
            href="/dashboard/admin/create-sub-category"
            icon={FiLayers}
            disabled={!isMerchantSelected}
          >
            Create Sub Category
          </NavLink>
          <NavLink
            href="/dashboard/admin/create-addon"
            icon={FiPlusCircle}
            disabled={!isMerchantSelected}
          >
            Create Add-on
          </NavLink>
          <NavLink
            href="/dashboard/admin/create-item"
            icon={GiMeal}
            disabled={!isMerchantSelected}
          >
            Create Item
          </NavLink>
          <NavLink
            href="/dashboard/admin/create-discount"
            icon={FiGift}
            disabled={!isMerchantSelected}
          >
            Create Discount
          </NavLink>
          <NavLink
            href="/dashboard/admin/all-items"
            icon={GiKnifeFork}
            disabled={!isMerchantSelected}
          >
            All Items
          </NavLink>
          <NavLink
            href="/dashboard/admin/all-orders"
            icon={FiShoppingCart}
            disabled={!isMerchantSelected}
          >
            All Orders
          </NavLink>

          <NavLink
            href="/dashboard/admin/logo"
            icon={SiTheboringcompany}
            disabled={!isMerchantSelected}
          >
            Logo
          </NavLink>

          <NavLink
            href="/dashboard/admin/settings"
            icon={FiSettings}
            disabled={!isMerchantSelected}
          >
            Settings
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

// Enhanced Navigation Link Component with disabled state
function NavLink({
  href,
  icon: Icon,
  children,
  disabled = false,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const baseClasses =
    "group flex items-center px-4 py-2 text-sm font-medium transition-colors relative";

  if (disabled) {
    return (
      <div
        className={`${baseClasses} text-gray-400 cursor-not-allowed pointer-events-none`}
        title="Please select a merchant first"
      >
        <Icon className="mr-3 h-5 w-5 text-gray-300" />
        <span className="text-gray-400">{children}</span>
        {/* Optional: Add a lock icon or visual indicator */}
        <div className="absolute inset-0 bg-gray-50 opacity-40 rounded"></div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-50`}
    >
      <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
      {children}
    </Link>
  );
}
