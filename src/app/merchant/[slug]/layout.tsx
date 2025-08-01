import { ReactNode } from "react";
import CategoryPanel from "@/components/CategoryPanel";
import { getMerchantBySlug, getItemsByMerchantId } from "@/lib/actions/frontShop";
import { ItemsProvider } from "@/contexts/ItemsContext";



interface MerchantLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function MerchantLayout({ children, params }: MerchantLayoutProps) {

  // 1. Await params first (Next.js 15 requirement)
  const { slug } = await params;
  
  // 2. Fetch merchant by slug
  const merchant = await getMerchantBySlug(slug);

  if (!merchant) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Merchant not found.
      </div>
    );
  }



  // 2. Fetch items by merchant id
  const items = await getItemsByMerchantId(merchant._id);


  return (
    <ItemsProvider initialItems={items} merchant={merchant}>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar: 30% */}
        <aside className="w-1/3 max-w-xs bg-gray-100 p-4 border-r border-gray-200 overflow-y-auto h-screen sticky top-0">
          <CategoryPanel />
        </aside>
        {/* Main content: 70% */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </ItemsProvider>
  );
}


//<img src={img.url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto/')} alt="thumbnail" />