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

  return { success: true, itemId: item._id.toString(), error: "Failed to create item." };
}