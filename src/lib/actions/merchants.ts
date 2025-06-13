// lib/actions/merchants.ts
"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchants";
import { generateSlug, ensureUniqueSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { checkPermission } from "@/lib/casl/permissions";

// Create merchant action
export async function createMerchant(formData: FormData) {
  try {
    // CASL Permission Check
    await checkPermission("create", "Merchant");

    const session = await auth();
    await dbConnect();

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = (formData.get("country") as string) || "Malaysia";
    const plan = (formData.get("plan") as string) || "free";
    const printServerApi = formData.get("printServerApi") as string;
    const ownerId = formData.get("owner") as string;

    // Validate required fields
    if (!name || !street || !city || !state || !zipCode || !ownerId) {
      throw new Error("Name and address fields are required");
    }

    // 🛡️ Validate ObjectId format
    const mongoose = await import("mongoose");
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      throw new Error("Invalid owner ID format");
    }

    // Validate that the owner exists and is an admin
    const User = (await import("@/models/User")).default;
    const ownerUser = await User.findById(ownerId);
    if (!ownerUser) {
      throw new Error("Selected owner not found");
    }
    if (ownerUser.role !== "admin") {
      throw new Error("Owner must be an admin user");
    }

    // Generate unique slug
    const baseSlug = generateSlug(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    // Create merchant
    const merchant = await Merchant.create({
      name,
      slug: uniqueSlug,
      description,
      phone,
      email,
      owner: ownerId,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
      plan,
      printServerApi,
    });

    // Revalidate any cached data
    revalidatePath("/dashboard");

    // Convert to plain object before returning
    return {
      success: true,
      merchant: {
        id: merchant._id.toString(),
        slug: merchant.slug,
        name: merchant.name,
      },
    };

    // Redirect to the new merchant dashboard
    //redirect(`/dashboard/${merchant.slug}/admin`);
    //  redirect(`/dashboard/super-admin`);
  } catch (error) {
    console.error("Error creating merchant:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create merchant",
    };
  }
}

// Get user's merchants action
export async function getUserMerchants() {
  try {
    // CASL Permission Check
    await checkPermission("read", "Merchant");

    const session = await auth();
    await dbConnect();

    // For super_admin, get all merchants
    // For admin, get only their merchants
    const query =
      session!.user.role === "super_admin" ? {} : { owner: session!.user.id };

    const merchants = await Merchant.find(query)
       .select("name slug merchantId address isActive plan printServerApi createdAt updatedAt owner")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Convert ObjectIds to strings for client serialization
    const serializedMerchants = merchants.map((merchant) => ({
      _id: (merchant._id as any).toString(),
      name: merchant.name || "", // ✅ Explicitly include name
      slug: merchant.slug || "",
      merchantId: merchant.merchantId || "",
      address: merchant.address || {},
      isActive: merchant.isActive ?? true,
      plan: merchant.plan || "free",
      printServerApi: merchant.printServerApi || "",
      owner: (merchant.owner as any)?.toString() ?? "",
      createdAt: merchant.createdAt?.toISOString?.() ?? "",
      updatedAt: merchant.updatedAt?.toISOString?.() ?? "",
    }));

    return { merchants: serializedMerchants };
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch merchants",
      merchants: [],
    };
  }
}

// Update merchant action
export async function updateMerchant(merchantId: string, formData: FormData) {
  try {
    const session = await auth();
    await dbConnect();

    // Get the merchant first to check permissions
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // CASL Permission Check with resource
    await checkPermission("update", "Merchant");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const printServerApi = formData.get("printServerApi") as string;

    // Update merchant
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      merchantId,
      {
        name,
        description,
        phone,
        email,
        printServerApi,
      },
      { new: true }
    );

    // Revalidate cached data
    revalidatePath(`/dashboard/${updatedMerchant!.slug}`);

    // ✅ Convert to plain object before returning
    return {
      success: true,
      merchant: {
        id: updatedMerchant._id.toString(),
        slug: updatedMerchant.slug,
        name: updatedMerchant.name,
      },
    };
  } catch (error) {
    console.error("Error updating merchant:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update merchant",
    };
  }
}

// Delete merchant action
export async function deleteMerchant(merchantId: string) {
  try {
    // CASL Permission Check
    await checkPermission("manage", "all");

    const session = await auth();
    await dbConnect();

    // Find the merchant first to get slug for revalidation
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return {
        error: "Merchant not found",
      };
    }

    // Delete the merchant
    await Merchant.findByIdAndDelete(merchantId);

    // Revalidate cached data
    revalidatePath("/dashboard/super-admin");
    // revalidatePath(`/dashboard/${merchant.slug}`);

    return {
      success: true,
      message: `${merchant.name} has been deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting merchant:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete merchant",
    };
  }
}


export async function toggleMerchantStatus(merchantId: string) {
  try {
    // CASL Permission Check
    await checkPermission("update", "Merchant");

    await dbConnect();

    // Find the current merchant
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return {
        error: "Merchant not found"
      };
    }

    // Toggle the status
    const newStatus = !merchant.isActive;
    
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { isActive: newStatus },
      { new: true }
    );

    // Revalidate cached data
    revalidatePath("/dashboard/super-admin");
    revalidatePath(`/dashboard/${merchant.slug}`);
    
    return { 
      success: true,
      isActive: newStatus,
      message: `${merchant.name} ${newStatus ? 'activated' : 'deactivated'} successfully`
    };

  } catch (error) {
    console.error("Error toggling merchant status:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to toggle merchant status"
    };
  }
}
