"use server";

import dbConnect from "@/lib/mongodb";
import SubCategory from "@/models/SubCategory";
import { generateSlug } from "@/lib/utils";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/casl/permissions";
import { redirect } from "next/navigation";

// CREATE
export async function createSubCategory({
  name,
  merchantId,
  parentCategoryId,
}: {
  name: string;
  merchantId: string;
  parentCategoryId: string;
}) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const slug = generateSlug(name);

  // Prevent duplicate slugs for the same merchant and parent category
  const exists = await SubCategory.findOne({ slug, merchant: merchantId, parentCategory: parentCategoryId });
  if (exists) {
    return {
      success: false,
      error: "SubCategory with this name/slug already exists for this merchant and category.",
    };
  }

  const subCategory = await SubCategory.create({ name, slug, merchant: merchantId, parentCategory: parentCategoryId });
  return { success: true };
}

// READ ALL by merchant and parent category
export async function getSubCategoriesByMerchantAndCategory(merchantId: string, parentCategoryId: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const subCategories = await SubCategory.find({ merchant: merchantId, parentCategory: parentCategoryId })
    .sort({ createdAt: -1 })// Sort by createdAt descending
    .lean();// .lean() returns plain JavaScript objects instead of Mongoose documents

  const safeSubCategories = subCategories.map((sub: any) => ({
    ...sub,
    _id: sub._id.toString(),
    merchant: sub.merchant?.toString?.() ?? sub.merchant, //?? = if the left side is null or undefined
    parentCategory: sub.parentCategory?.toString?.() ?? sub.parentCategory,
  }));

  return { success: true, subCategories: safeSubCategories };
}

// UPDATE
export async function updateSubCategory(id: string, { name }: { name: string }) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const slug = generateSlug(name);

  // Find the current subcategory to get merchantId and parentCategoryId
  const current = await SubCategory.findById(id);
  if (!current) return { success: false, error: "SubCategory not found." };

  // Prevent duplicate slugs for the same merchant and parent category (exclude current subcategory)
  const exists = await SubCategory.findOne({
    slug,
    merchant: current.merchant,
    parentCategory: current.parentCategory,
    _id: { $ne: id }, //$ne means "not equal" //exclude the current subcategory
  });
  if (exists) {
    return {
      success: false,
      error: "SubCategory with this name/slug already exists for this merchant and category.",
    };
  }

  const subCategory: any = await SubCategory.findByIdAndUpdate(
    id,
    { name, slug },
    { new: true }
  ).lean();

  if (!subCategory) return { success: false, error: "SubCategory not found." };

  const safeSubCategory = {
    ...subCategory,
    _id: subCategory._id.toString(),
    merchant: subCategory.merchant?.toString?.() ?? subCategory.merchant,
    parentCategory: subCategory.parentCategory?.toString?.() ?? subCategory.parentCategory,
  };

  return { success: true, subCategory: safeSubCategory };
}

// DELETE
export async function deleteSubCategory(id: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();
  const result = await SubCategory.findByIdAndDelete(id);
  if (!result) return { success: false, error: "SubCategory not found." };
  return { success: true };
}