"use server";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { generateSlug } from "@/lib/utils";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/casl/permissions";
import { redirect } from "next/navigation";

// CREATE
export async function createCategory({
  name,
  merchantId,
}: {
  name: string;
  merchantId: string;
}) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const slug = generateSlug(name);

  // Prevent duplicate slugs for the same merchant only
  const exists = await Category.findOne({ slug, merchant: merchantId });
  if (exists) {
    return {
      success: false,
      error: "Category with this name/slug already exists for this merchant.",
    };
  }

  const category = await Category.create({ name, slug, merchant: merchantId });
  return { success: true };
}

// READ ALL
export async function getCategoriesByMerchant(merchantId: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const categories = await Category.find({ merchant: merchantId })
    .sort({ createdAt: -1 })
    .lean();
  // Convert only _id (and merchant if you use it on client) to string
  const safeCategories = categories.map((cat: any) => ({
    ...cat,
    _id: cat._id.toString(),
    merchant: cat.merchant?.toString?.() ?? cat.merchant,
  }));

  return { success: true, categories: safeCategories };
}


// UPDATE

export async function updateCategory(id: string, { name }: { name: string }) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const slug = generateSlug(name);

  // Find the current category to get merchantId
  const current = await Category.findById(id);
  if (!current) return { success: false, error: "Category not found." };

  // Prevent duplicate slugs for the same merchant (exclude current category)
  const exists = await Category.findOne({
    slug,
    merchant: current.merchant,
    _id: { $ne: id },//Find doc where the _id is not equal ($ne = "not equal") to the given id.
  });
  if (exists) {
    return {
      success: false,
      error: "Category with this name/slug already exists for this merchant.",
    };
  }

  const category: any = await Category.findByIdAndUpdate(
    id,
    { name, slug },
    { new: true }
  ).lean();

  if (!category) return { success: false, error: "Category not found." };

  const safeCategory = {
    ...category,
    _id: category._id.toString(),
    merchant: category.merchant?.toString?.() ?? category.merchant,
  };

  return { success: true, category: safeCategory };
}

// DELETE
export async function deleteCategory(id: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();
  const result = await Category.findByIdAndDelete(id);
  if (!result) return { success: false, error: "Category not found." };
  return { success: true };
}
