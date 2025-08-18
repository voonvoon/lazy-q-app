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

// Types
export type DiscountType = "amount" | "percentage";

export interface DiscountInput {
  code?: string;
  type: DiscountType;
  value: number;
  expiryDate: Date;
  useOnce?: boolean;
  merchant: string;
}

export interface DiscountUpdateInput {
  merchant: string;
  code?: string;
  type?: DiscountType;
  value?: number;
  expiryDate?: Date;
  useOnce?: boolean;
}

// CREATE
export async function createDiscount(data: DiscountInput) {
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
      useOnce: data.useOnce ?? false,
    });
   
    return { success: true };
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
      useOnce: d.useOnce ?? false,
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

  const d: any = await Discount.findById(id).lean();
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
      useOnce: d.useOnce ?? false,
    },
  };
}

// UPDATE
export async function updateDiscount(id: string, data: DiscountUpdateInput) {
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
    const updated: any = await Discount.findByIdAndUpdate(
      id,
      {
        ...data,
        useOnce: data.useOnce ?? false, //not rely on ...data to ensure useOnce defaults to false if not provided
      },
      { new: true }
    ).lean();
    if (!updated) return { success: false, error: "Discount not found or update failed." };
    
    return { success: true };
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

// VERIFY DISCOUNT CODE
export async function verifyDiscountCode(merchantId: string, code: string) {
  await dbConnect();

  // Find discount by merchant and code (case-insensitive)
  const discount: any = await Discount.findOne({
    merchant: merchantId,
    code: code.trim().toUpperCase(),
  }).lean();

  if (!discount) {
    return { success: false, error: "Invalid discount code." };
  }

  // Check expiry
  if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
    return { success: false, error: "This discount code has expired." };
  }

  // Check useOnce (assumes you have a 'used' field or similar)
  // if (discount.useOnce && discount.used) {
  //   return { success: false, error: "This discount code is invalid" };
  // }

  // If valid, return the discount object (sanitize as needed)
  return {
    success: true,
    discount: {
      _id: discount._id.toString(),
      code: discount.code,
      type: discount.type,
      value: discount.value,
      expiryDate: discount.expiryDate,
      useOnce: discount.useOnce ?? false,
      merchant: discount.merchant.toString(),
    },
  };
}