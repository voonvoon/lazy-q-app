// app/dashboard/super-admin/merchants/[id]/edit/page.tsx
import MerchantForm from "@/components/forms/MerchantForm";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchants";
import { notFound } from "next/navigation";

interface EditMerchantPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMerchantPage({ params }: EditMerchantPageProps) {
  // Await the params in Next.js 15
  const { id } = await params;
  
  await dbConnect();
  
  // Fetch existing merchant data
  const merchant = await Merchant.findById(id).lean();

  if (!merchant || Array.isArray(merchant)) {
    notFound(); // Shows 404 page
  }

  // Convert MongoDB document to plain object for client component
  const merchantData = {
    ...merchant,
    _id: merchant._id?.toString?.() ?? "",
    owner: merchant.owner?.toString?.() ?? "",
    createdAt: merchant.createdAt?.toISOString?.() ?? "",
    updatedAt: merchant.updatedAt?.toISOString?.() ?? "",
  };

  return (
    <div className="container mx-auto py-8">
      <MerchantForm 
        merchant={merchantData as any} 
        isEditing={true} 
      />
    </div>
  );
}