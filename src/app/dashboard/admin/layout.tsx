import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MerchantProvider } from "@/contexts/MerchantContext";
// ✅ Import relevant icons
import { FiShield } from "react-icons/fi";
import AdminSidebar from "@/app/dashboard/admin/AdminSidebar";
import Navbar from "@/components/shared/Navbar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check authorization
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "super_admin")
  ) {
    redirect("/dashboard/unauthorized");
  }
  return (
    <MerchantProvider>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <FiShield className="text-red-600 text-2xl" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Merchant Admin Dashboard
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar - now using client component */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </MerchantProvider>
  );
}
