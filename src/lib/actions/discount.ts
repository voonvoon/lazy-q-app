"use server";

import dbConnect from "@/lib/mongodb";
import Discount from "@/models/Discount";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/casl/permissions";
import { redirect } from "next/navigation";

// Helper to generate a random code (6 uppercase letters/numbers)
function generateDiscountCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// CREATE
export async function createDiscount(data: {
  code?: string;
  type: "amount" | "percentage";
  value: number;
  expiryDate: Date;
  merchant: string;
}) {
  await checkPermission("manage", "Discount");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  // Auto-generate code if not provided
  const code = data.code?.trim() || generateDiscountCode();

  // Check uniqueness for this merchant
  const exists = await Discount.findOne({ merchant: data.merchant, code });
  if (exists) {
    return { success: false, error: "Discount code already exists for this merchant." };
  }

  try {
    const discount = await Discount.create({
      ...data,
      code,
    });
    return {
      success: true,
      discount: {
        ...discount.toObject(),
        _id: discount._id.toString(),
        merchant: discount.merchant.toString(),
        expiryDate: discount.expiryDate?.toISOString?.() ?? "",
        createdAt: discount.createdAt?.toISOString?.() ?? "",
        updatedAt: discount.updatedAt?.toISOString?.() ?? "",
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to create discount." };
  }
}

// READ (get all discounts for a merchant)
export async function getDiscountsByMerchant(merchantId: string) {
  await checkPermission("manage", "Discount");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  const discounts = await Discount.find({ merchant: merchantId }).sort({ createdAt: -1 }).lean();
  return {
    success: true,
    discounts: discounts.map((d: any) => ({
      ...d,
      _id: d._id.toString(),
      merchant: d.merchant.toString(),
      expiryDate: d.expiryDate?.toISOString?.() ?? "",
      createdAt: d.createdAt?.toISOString?.() ?? "",
      updatedAt: d.updatedAt?.toISOString?.() ?? "",
    })),
  };
}

// READ (get by id)
export async function getDiscountById(id: string) {
  await checkPermission("manage", "Discount");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  const d:any = await Discount.findById(id).lean();
  if (!d) return { success: false, error: "Discount not found." };
  return {
    success: true,
    discount: {
      ...d,
      _id: d._id.toString(),
      merchant: d.merchant.toString(),
      expiryDate: d.expiryDate?.toISOString?.() ?? "",
      createdAt: d.createdAt?.toISOString?.() ?? "",
      updatedAt: d.updatedAt?.toISOString?.() ?? "",
    },
  };
}

// UPDATE
export async function updateDiscount(id: string, data: {
  merchant: string;
  code?: string;
  type?: "amount" | "percentage";
  value?: number;
  expiryDate?: Date;
}) {
  await checkPermission("manage", "Discount");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  // If code is being changed, check uniqueness
  if (data.code) {
    const existing = await Discount.findOne({ _id: { $ne: id }, merchant: data.merchant, code: data.code });
    if (existing) {
      return { success: false, error: "Discount code already exists for this merchant." };
    }
  }

  try {
    const updated:any = await Discount.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) return { success: false, error: "Discount not found or update failed." };
    return {
      success: true,
      discount: {
        ...updated,
        _id: updated._id.toString(),
        merchant: updated.merchant.toString(),
        expiryDate: updated.expiryDate?.toISOString?.() ?? "",
        createdAt: updated.createdAt?.toISOString?.() ?? "",
        updatedAt: updated.updatedAt?.toISOString?.() ?? "",
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to update discount." };
  }
}

// DELETE
export async function deleteDiscount(id: string) {
  await checkPermission("manage", "Discount");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  try {
    await Discount.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete discount." };
  }
}