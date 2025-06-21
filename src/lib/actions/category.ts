'use server'

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { generateSlug } from "@/lib/utils";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/casl/permissions";
import { redirect } from "next/navigation";

// CREATE
export async function createCategory({ name, merchantId }: { name: string; merchantId: string }) {
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
export async function getAllCategories() {
  await dbConnect();
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  return { success: true, categories };
}

// READ BY ID
export async function getCategoryById(id: string) {
  await dbConnect();
  const category = await Category.findById(id).lean();
  if (!category) return { success: false, error: "Category not found." };
  return { success: true, category };
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

  const category = await Category.findByIdAndUpdate(
    id,
    { name, slug },
    { new: true }
  ).lean();

  if (!category) return { success: false, error: "Category not found." };
  return { success: true, category };
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
