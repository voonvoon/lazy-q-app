// app/dashboard/super-admin/merchants/[id]/edit/page.tsx
import MerchantForm from "@/components/forms/MerchantForm";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchants";
import { notFound } from "next/navigation";

interface EditMerchantPageProps {
  params: {
    id: string;
  };
}

export default async function EditMerchantPage({ params }: EditMerchantPageProps) {
  await dbConnect();
  
  // Fetch existing merchant data
  const merchant = await Merchant.findById(params.id).lean();

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