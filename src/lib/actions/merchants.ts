// lib/actions/merchants.ts
'use server'

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchants";
import { generateSlug, ensureUniqueSlug } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPermission } from "@/lib/casl/permissions";

// Create merchant action
export async function createMerchant(formData: FormData) {
  try {
    // CASL Permission Check
    await checkPermission('create', 'Merchant');

    const session = await auth();
    await dbConnect();

    // Extract form data
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const country = formData.get('country') as string || 'Malaysia';
    const plan = formData.get('plan') as string || 'free';
    const printServerApi = formData.get('printServerApi') as string;

    // Validate required fields
    if (!name || !street || !city || !state || !zipCode) {
      throw new Error("Name and address fields are required");
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
      owner: session!.user.id,
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
    revalidatePath('/dashboard');
    
    // Redirect to the new merchant dashboard
    //redirect(`/dashboard/${merchant.slug}/admin`);
    //  redirect(`/dashboard/super-admin`);

  } catch (error) {
    console.error("Error creating merchant:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create merchant"
    };
  }
}

// Get user's merchants action
export async function getUserMerchants() {
  try {
    // CASL Permission Check
    await checkPermission('read', 'Merchant');

    const session = await auth();
    await dbConnect();

    // For super_admin, get all merchants
    // For admin, get only their merchants
    const query = session!.user.role === 'super_admin' 
      ? {} 
      : { owner: session!.user.id };

    const merchants = await Merchant.find(query)
      .select('name slug merchantId address isActive plan printServerApi createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return { merchants };

  } catch (error) {
    console.error("Error fetching merchants:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch merchants",
      merchants: []
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
    await checkPermission('update', 'Merchant');

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const printServerApi = formData.get('printServerApi') as string;

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

    return { success: true, merchant: updatedMerchant };

  } catch (error) {
    console.error("Error updating merchant:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update merchant"
    };
  }
}

// Delete merchant action
export async function deleteMerchant(merchantId: string) {
  try {
    const session = await auth();
    await dbConnect();

    // Get the merchant first to check permissions
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // CASL Permission Check with resource (includes business rules like premium check)
    await checkPermission('delete', 'Merchant', merchant);

    // Delete merchant
    await Merchant.findByIdAndDelete(merchantId);

    // Revalidate cached data
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error("Error deleting merchant:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete merchant"
    };
  }
}