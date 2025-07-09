import CategoryPanel from "@/components/CategoryPanel";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar: 30% */}
      <aside className="w-1/3 max-w-xs bg-gray-100 p-4 border-r border-gray-200">
        <CategoryPanel />
      </aside>
      {/* Main content: 70% */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}