"use server";

import dbConnect from "@/lib/mongodb";
// import Category from "@/models/Category";
// import AddOn from "@/models/AddOn";
// import SubCategory from "@/models/SubCategory";
import Merchant from "@/models/Merchant";
import Item from "@/models/Item";

// Fetch merchant by slug (public, no auth)
// export async function getMerchantBySlug(slug: string) {
//   await dbConnect();

//   // Import Category model to avoid MissingSchemaError
//   await import("@/models/Category");

//   const merchant: any = await Merchant.findOne({ slug })
//     .select("_id name slug catOrder") // Select the fields you need
//     .populate("catOrder", "name") // Populate catOrder with category names
//     .lean();

//   if (!merchant) return null;

//   // Extract category names from populated catOrder
//   const categoryOrder = merchant.catOrder?.map((cat: any) => cat.name) || [];

//   return {
//     _id: merchant._id.toString(),
//     name: merchant.name,
//     slug: merchant.slug,
//     catOrder: JSON.parse(JSON.stringify(categoryOrder)) // Serialized category names
//   };
// }

// export async function getMerchantBySlug(slug: string) {
//   await dbConnect();

//   // Import Category model to avoid MissingSchemaError
//   await import("@/models/Category");

//   const merchant: any = await Merchant.findOne({ slug })
//     .select("_id name slug catOrder tax allowedDelivery deliveryFee freeDeliveryThreshold") // ✅ Added settings fields
//     .populate("catOrder", "name") // Populate catOrder with category names
//     .lean();

//   if (!merchant) return null;

//   // Extract category names from populated catOrder
//   const categoryOrder = merchant.catOrder?.map((cat: any) => cat.name) || [];

//   return {
//     _id: merchant._id.toString(),
//     name: merchant.name,
//     slug: merchant.slug,
//     catOrder: JSON.parse(JSON.stringify(categoryOrder)), // Serialized category names

//     // ✅ Business settings for public front shop
//     tax: merchant.tax ?? 6,                                    // Default 6% SST
//     allowedDelivery: merchant.allowedDelivery ?? true,         // Default delivery enabled
//     deliveryFee: merchant.deliveryFee ?? 5.0,                  // Default RM5.00
//     freeDeliveryThreshold: merchant.freeDeliveryThreshold ?? 0 // Default no free delivery
//   };
// }

export async function getMerchantBySlug(slug: string) {
  await dbConnect();

  // Import Category model to avoid MissingSchemaError
  await import("@/models/Category");

  const merchant: any = await Merchant.findOne({ slug })
    .select(
      "_id name slug catOrder tax allowedDelivery deliveryFee freeDeliveryThreshold allowPreorder firstOrderTime lastOrderTime"
    ) // ✅ Added new fields
    .populate("catOrder", "name")
    .lean();

  if (!merchant) return null;

  // Extract category names from populated catOrder
  const categoryOrder = merchant.catOrder?.map((cat: any) => cat.name) || [];

  return {
    _id: merchant._id.toString(),
    name: merchant.name,
    slug: merchant.slug,
    catOrder: JSON.parse(JSON.stringify(categoryOrder)),
    tax: merchant.tax ?? 6,
    allowedDelivery: merchant.allowedDelivery ?? true,
    deliveryFee: merchant.deliveryFee ?? 5.0,
    freeDeliveryThreshold: merchant.freeDeliveryThreshold ?? 0,

    // ✅ Newly added fields
    allowPreorder: merchant.allowPreorder ?? false,
    firstOrderTime: merchant.firstOrderTime || "10:00",
    lastOrderTime: merchant.lastOrderTime || "21:00",
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
