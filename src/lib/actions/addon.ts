"use server";

import AddOn from "@/models/AddOn";
import { checkPermission } from "@/lib/casl/permissions";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";

// Helper to serialize a single add-on
function serializeAddOn(addOn: any) {
  return {
    _id: addOn._id.toString(),
    name: addOn.name,
    price: addOn.price,
    merchant: addOn.merchant?.toString?.() ?? "",
    createdAt: addOn.createdAt?.toISOString?.() ?? "",
    updatedAt: addOn.updatedAt?.toISOString?.() ?? "",
  };
}

export async function createAddOn(data: {
  name: string;
  price: number;
  merchantId: string;
}) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated." };

  await dbConnect();

  try {
    const addOn = await AddOn.create({
      name: data.name,
      price: data.price,
      merchant: data.merchantId,
    });
    return { success: true, addOn: serializeAddOn(addOn) };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create add-on.",
    };
  }
}

export async function getAddOnsByMerchant(merchantId: string) {
  await dbConnect();
  try {
    const addOns = await AddOn.find({ merchant: merchantId })
      .sort({ name: 1 })
      .lean();
    return { success: true, addOns: addOns.map(serializeAddOn) };
  } catch (error) {
    return { success: false, error: "Failed to fetch add-ons." };
  }
}

export async function updateAddOn(
  addOnId: string,
  data: { name: string; price: number }
) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated." };

  await dbConnect();

  try {
    const updated = await AddOn.findByIdAndUpdate(addOnId, data, { new: true, lean: true });
    if (!updated)
      return { success: false, error: "Add-on not found or update failed." };
    return { success: true, addOn: serializeAddOn(updated) };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update add-on.",
    };
  }
}

export async function deleteAddOn(addOnId: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Not authenticated." };

  await dbConnect();

  try {
    await AddOn.findByIdAndDelete(addOnId);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete add-on." };
  }
}