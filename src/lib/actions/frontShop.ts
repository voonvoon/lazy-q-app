"use server";

import dbConnect from "@/lib/mongodb";
// import Category from "@/models/Category";
// import AddOn from "@/models/AddOn";
// import SubCategory from "@/models/SubCategory";
import Merchant from "@/models/Merchant";
import Item from "@/models/Item";

// Fetch merchant by slug (public, no auth)
export async function getMerchantBySlug(slug: string) {
  await dbConnect();
  const merchant: any = await Merchant.findOne({ slug }).lean();
  if (!merchant) return null;
  return {
    _id: merchant._id.toString(),
  };
}

// Fetch all items by merchant id (public, no auth)
export async function getItemsByMerchantId(merchantId: string) {
  await dbConnect();

  // Hack: Dynamic imports to force model registration avoid MissiongSchemaError
  //const Item = (await import("@/models/Item")).default;
  await import("@/models/Category");
  await import("@/models/SubCategory");
  await import("@/models/AddOn");

  const items = await Item.find({ merchant: merchantId })
    .populate("category", "name")
    .populate("subCategories", "name parentCategory")
    .populate("addOns", "name price")
    .lean();

  return items.map((item: any) => ({
    _id: item._id.toString(),
    merchant: item.merchant.toString(),
    title: item.title,
    slug: item.slug,
    image: item.image ?? [],
    price:
      typeof item.price === "object" && item.price.toString
        ? item.price.toString()
        : item.price,
    description: item.description ?? "",
    category: item.category
      ? {
          _id: item.category._id?.toString?.(),
          name: item.category.name,
        }
      : null,
    subCategories: Array.isArray(item.subCategories)
      ? item.subCategories.map((sub: any) =>
          sub
            ? {
                _id: sub._id?.toString?.(),
                name: sub.name,
                parentCategory: sub.parentCategory?.toString?.(),
              }
            : null
        )
      : [],
    addOns: Array.isArray(item.addOns)
      ? item.addOns.map((ad: any) =>
          ad
            ? { _id: ad._id?.toString?.(), name: ad.name, price: ad.price }
            : null
        )
      : [],
    createdAt: item.createdAt?.toISOString?.() ?? "",
    updatedAt: item.updatedAt?.toISOString?.() ?? "",
  }));
}
