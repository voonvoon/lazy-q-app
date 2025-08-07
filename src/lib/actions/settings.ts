"use server";

import dbConnect from "@/lib/mongodb";
import { auth } from "@/auth";
import { checkPermission } from "@/lib/casl/permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Merchant from "@/models/Merchant";

// ✅ Update Merchant Settings
export async function updateMerchantSettings(
  merchantId: string,
  formData: FormData
) {
  try {
    await dbConnect();

    // Get current user session
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    const user = session.user;

    // Find merchant and verify ownership for permission check
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    // Check CASL permissions
    // ✅ Check permission without resource, then manual ownership check
    await checkPermission("manage", "MerchantSettings");

    // ✅ Then manual ownership verification
    if (merchant.owner.toString() !== session.user.id) {
      throw new Error("You can only manage your own merchant settings");
    }

    // Extract and validate form data
    const tax = Number(formData.get("tax")); // Convert to number
    //tricky: formData returns strings, so we need to convert to boolean
    const allowedDelivery = formData.get("allowedDelivery") === "true"; //more explicitly: formData.get("allowedDelivery") === "true" ? true : false;
    const deliveryFee = Number(formData.get("deliveryFee"));
    const freeDeliveryThreshold = Number(formData.get("freeDeliveryThreshold"));

    // Validate data
    if (isNaN(tax) || tax < 0 || tax > 100) {
      throw new Error("Tax must be between 0 and 100");
    }

    if (isNaN(deliveryFee) || deliveryFee < 0) {
      throw new Error("Delivery fee must be 0 or greater");
    }

    if (isNaN(freeDeliveryThreshold) || freeDeliveryThreshold < 0) {
      throw new Error("Free delivery threshold must be 0 or greater");
    }

    // Update merchant settings
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      merchantId,
      {
        tax,
        allowedDelivery,
        deliveryFee,
        freeDeliveryThreshold,
      },
      { new: true, runValidators: true } // Ensure data follows the rules I set in schema!
    );

    if (!updatedMerchant) {
      throw new Error("Failed to update merchant settings");
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/admin/settings");

    return {
      success: true,
      message: "Merchant settings updated successfully",
      data: {
        tax: updatedMerchant.tax,
        allowedDelivery: updatedMerchant.allowedDelivery,
        deliveryFee: updatedMerchant.deliveryFee,
        freeDeliveryThreshold: updatedMerchant.freeDeliveryThreshold,
      },
    };
  } catch (error: any) {
    console.error("Error updating merchant settings:", error);
    return {
      success: false,
      message: error.message || "Failed to update merchant settings",
    };
  }
}

