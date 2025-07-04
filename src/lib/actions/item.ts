"use server";

import dbConnect from "@/lib/mongodb";
import Item from "@/models/Item";
import { generateSlug } from "@/lib/utils";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/casl/permissions";
import { redirect } from "next/navigation";

export async function createItem(data: any) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();

  // Generate slug from title
  const slug = generateSlug(data.title);

  // Create item
  const item = await Item.create({
    ...data,
    slug,
  });

  return {
    success: true,
    itemId: item._id.toString(),
    error: "Failed to create item.",
  };
}

export async function getItemById(itemId: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();

  try {
    const item: any = await Item.findById(itemId).lean();
    if (!item) {
      return { success: false, error: "Item not found." };
    }
    // Serialize item fields
    const serializedItem = {
      _id: (item._id as any).toString(),
      title: item.title || "",
      description: item.description || "",
      price: item.price ?? 0,
      availability: item.availability ?? true,
      image: Array.isArray(item.image)
        ? item.image.map((img: any) => ({
            url: img.url || "",
            public_id: img.public_id || "",
          }))
        : [],
      category: item.category ? item.category.toString() : "",
      subCategories: Array.isArray(item.subCategories)
        ? item.subCategories.map((id: any) => id.toString())
        : [],
      addOns: Array.isArray(item.addOns)
        ? item.addOns.map((id: any) => id.toString())
        : [],
      merchant: item.merchant ? item.merchant.toString() : "",
      createdAt: item.createdAt?.toISOString?.() ?? "",
      updatedAt: item.updatedAt?.toISOString?.() ?? "",
    };
    return { success: true, item: serializedItem };
  } catch (error) {
    return { success: false, error: "Failed to fetch item." };
  }
}

export async function updateItem(itemId: string, data: any) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();

  try {
    // Optionally, regenerate slug if title changes
    if (data.title) {
      data.slug = generateSlug(data.title);
    }
    const updated = await Item.findByIdAndUpdate(itemId, data, { new: true });
    if (!updated) {
      return { success: false, error: "Item not found or update failed." };
    }
    //return { success: true, item: updated }; tis hv err:RangeError: Maximum call stack size exceeded
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update item." };
  }
}

//for all items
export async function getItemsByMerchant({
  merchantId,
  page = 1,
  pageSize = 12,
  categoryId,
  search,
}: {
  merchantId: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
  search?: string;
}) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  const filter: any = { merchant: merchantId };
  if (categoryId) filter.category = categoryId;
  if (search) filter.title = { $regex: search, $options: "i" };

  const total = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  // Serialize items for client
  const serialized = items.map((item: any) => ({
    _id: item._id.toString(),
    title: item.title,
    price: item.price,
    category: item.category?.toString() || "",
    image:
      Array.isArray(item.image) && item.image[0]?.url ? item.image[0].url : "",
    createdAt: item.createdAt?.toISOString?.() ?? "",
    updatedAt: item.updatedAt?.toISOString?.() ?? "",
  }));

  return {
    success: true,
    items: serialized,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function deleteItem(itemId: string) {
  await checkPermission("manage", "Product");
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await dbConnect();

  try {
    await Item.findByIdAndDelete(itemId);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete item." };
  }
}
