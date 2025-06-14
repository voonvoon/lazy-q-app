// lib/actions/payment-config.ts
"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchants";
import { encrypt, decrypt } from "@/lib/crypto";
import { checkPermission } from "@/lib/casl/permissions";
import { revalidatePath } from "next/cache";

// export async function updatePaymentConfig(
//   merchantId: string, 
//   formData: FormData
// ) {
//   try {
//     // CASL Permission Check
//     await checkPermission("manage", "all");

//     const session = await auth();
//     await dbConnect();

//     const fiuuVerifyKey = formData.get("fiuuVerifyKey") as string;
//     const fiuuPrivateKey = formData.get("fiuuPrivateKey") as string;

//     // Find merchant and check ownership
//     const merchant = await Merchant.findById(merchantId);
//     if (!merchant) {
//       return { error: "Merchant not found" };
//     }


//     // Encrypt the private key before storing
//     const encryptedPrivateKey = fiuuPrivateKey ? encrypt(fiuuPrivateKey) : '';

//     // Update payment config
//     const updatedMerchant = await Merchant.findByIdAndUpdate(
//       merchantId,
//       {
//         'paymentConfig.fiuuVerifyKey': fiuuVerifyKey,
//         'paymentConfig.fiuuPrivateKey': encryptedPrivateKey,
//         'paymentConfig.isConfigured': !!(fiuuVerifyKey && fiuuPrivateKey),
//         'paymentConfig.lastUpdated': new Date(),
//       },
//       { new: true }
//     );

//     // Revalidate cached data
//     revalidatePath(`/dashboard/${merchant.slug}/payment`);
//     revalidatePath(`/dashboard/super-admin/merchants/${merchantId}/edit`);

//     return {
//       success: true,
//       message: "Payment configuration updated successfully",
//       isConfigured: updatedMerchant!.paymentConfig?.isConfigured || false,
//     };

//   } catch (error) {
//     console.error("Error updating payment config:", error);
//     return {
//       error: error instanceof Error ? error.message : "Failed to update payment configuration"
//     };
//   }
// }

export async function getPaymentConfig(merchantId: string) {
  try {
    await checkPermission("manage", "all");

    const session = await auth();
    await dbConnect();

    const merchant = await Merchant.findById(merchantId).select('paymentConfig owner');
    if (!merchant) {
      return { error: "Merchant not found" };
    }


    // Return config with decrypted private key (for editing)
    const decryptedPrivateKey = merchant.paymentConfig?.fiuuPrivateKey 
      ? decrypt(merchant.paymentConfig.fiuuPrivateKey) 
      : '';

    return {
      success: true,
      config: {
        fiuuVerifyKey: merchant.paymentConfig?.fiuuVerifyKey || '',
        fiuuPrivateKey: decryptedPrivateKey,
        isConfigured: merchant.paymentConfig?.isConfigured || false,
        lastUpdated: merchant.paymentConfig?.lastUpdated,
      }
    };

  } catch (error) {
    console.error("Error fetching payment config:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch payment configuration"
    };
  }
}