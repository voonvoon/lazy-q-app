// app/dashboard/super-admin/merchants/[id]/edit/page.tsx
import MerchantForm from "@/components/forms/MerchantForm";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchant";
import { notFound } from "next/navigation";

interface EditMerchantPageProps {
  //This page receives a params object that's a Promise containing an id string
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
  //.lean() = Get plain JavaScript object instead of Mongoose document!

  if (!merchant || Array.isArray(merchant)) {
    //notFound() = Shows Next.js 404 error page! 
    notFound(); // Shows 404 page
  }

  const { catOrder, ...rest } = merchant; //no need catOrder else caused serialization issues

  // Convert MongoDB document to plain object for client component
  const merchantData = {
    ...rest,
    _id: merchant._id?.toString?.() ?? "",
    owner: merchant.owner?.toString?.() ?? "",
    createdAt: merchant.createdAt?.toISOString?.() ?? "",
    updatedAt: merchant.updatedAt?.toISOString?.() ?? "",
    //extract business hours cuz each obj has an _id field that we don't want to send to the client
    businessHours: merchant.businessHours?.map((hour: { day: any; open: any; close: any; isClosed: any; }) => ({
    day: hour.day,
    open: hour.open,
    close: hour.close,
    isClosed: hour.isClosed,
    // NO _id!
  })) ?? [],
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