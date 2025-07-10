// lib/actions/payment-config.ts
"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchant";
import { decrypt } from "@/lib/crypto";
import { checkPermission } from "@/lib/casl/permissions";


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