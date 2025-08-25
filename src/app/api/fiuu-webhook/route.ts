import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import querystring from "querystring";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchant";
//import Order from "@/models/Order";
import { decrypt } from "@/lib/crypto";

// Helper: Create order in DB
// async function createOrder(data: any) {
//   try {
//     const orderData = {
//       customerName: data.extraP?.metadata?.customerInfo?.name,
//       items: data.extraP?.metadata?.cartItems,
//       email: data.extraP?.metadata?.customerInfo?.email,
//       phone: data.extraP?.metadata?.customerInfo?.phone,
//       totalAmount: parseFloat(data.amount),
//       tranID: data.tranID,
//       orderid: data.orderid,
//       paymentStatus: data.status,
//       paymentMeta: data,
//     };

//     await dbConnect();
//     await Order.create(orderData);
//   } catch (error) {
//     console.error("Error creating order:", error);
//   }
// }

export async function POST(req: NextRequest) {
  try {
    let data: any;
    const contentType = req.headers.get("content-type");

    if (contentType === "application/x-www-form-urlencoded") {
      const text = await req.text();
      data = querystring.parse(text);
    } else {
      data = await req.json();
    }

    // Parse extraP and metadata if needed
    if (typeof data.extraP === "string") {
      data.extraP = JSON.parse(data.extraP);
    }
    if (typeof data.extraP?.metadata === "string") {
      data.extraP.metadata = JSON.parse(data.extraP.metadata);
    }

    data.treq = 1; // Additional parameter for IPN. Value always set to 1.

    // Fetch merchant and decrypt fiuuPrivateKey
    await dbConnect();
    const merchantId = data.extraP?.metadata?.merchantData?._id;
    const hasMetadata = !!data.extraP?.metadata;

    if (hasMetadata && !merchantId) {
      return NextResponse.json(
        { error: "Merchant ID missing in metadata" },
        { status: 400 }
      );
    }

    if (!hasMetadata) {
      // Likely a Fiuu test webhook or non-app payment, just log and return 200
      console.log(
        "No metadata found in webhook payload. Skipping merchant validation."
      );
      return NextResponse.json(
        { message: "Webhook received (no metadata, likely test)" },
        { status: 200 }
      );
    }

    const merchant: any = await Merchant.findById(merchantId).lean();
    if (!merchant || !merchant.paymentConfig?.fiuuPrivateKey) {
      return NextResponse.json(
        { error: "Merchant or private key not found" },
        { status: 400 }
      );
    }
    const sec_key = decrypt(merchant.paymentConfig.fiuuPrivateKey);
    console.log("Decrypted fiuuPrivateKey:", sec_key);

    // Data integrity check
    let {
      tranID,
      orderid,
      status,
      domain,
      amount,
      currency,
      appcode,
      paydate,
      skey,
    } = data;

    const key0 = CryptoJS.MD5(
      tranID + orderid + status + domain + amount + currency
    ).toString();
    const key1 = CryptoJS.MD5(
      paydate + domain + key0 + appcode + sec_key
    ).toString();

    if (skey !== key1) {
      status = "-1"; // Invalid transaction
    }

    // Only create order if payment is successful
    if (status === "00") {
      //await createOrder(data);
      console.log("Order created for orderid----->", orderid);
    } else {
      console.log("Payment failed or invalid for orderid:", orderid);
    }

    return NextResponse.json(
      { message: "Payment status received" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Fiuu webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
