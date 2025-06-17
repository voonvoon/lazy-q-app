import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiUsers, FiShoppingBag, FiSettings, FiShield } from "react-icons/fi";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check authorization
  if (!session?.user || session.user.role !== "super_admin") {
    redirect("/dashboard/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <FiShield className="text-red-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">
                Super Admin Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-6">
            <div className="px-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                System Management
              </h2>
            </div>
            <div className="mt-4 space-y-1">
              <NavLink href="/dashboard/super-admin" icon={FiShield}>
                Overview
              </NavLink>
              <NavLink href="/dashboard/super-admin/create-admin" icon={FiUsers}>
               Create Admin
              </NavLink>
              <NavLink
                href="/dashboard/super-admin/merchants"
                icon={FiShoppingBag}
              >
                Merchants
              </NavLink>

              <NavLink href="/dashboard/super-admin/analytics" icon={FiShield}>
                Analytics
              </NavLink>
              <NavLink href="/dashboard/super-admin/settings" icon={FiSettings}>
                Settings
              </NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Navigation Link Component
function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
    >
      <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
      {children}
    </Link>
  );
}
