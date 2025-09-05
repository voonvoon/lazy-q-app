import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import querystring from "querystring";
import dbConnect from "@/lib/mongodb";
import Merchant from "@/models/Merchant";
import Order from "@/models/Order";
import Counter from "@/models/Counter";
import OrderCounter from "@/models/OrderCounter";
import { decrypt } from "@/lib/crypto";
import mongoose from "mongoose";
import {
  sendLongTelegramMessage,
  buildOrderMessage,
} from "@/lib/utils/telegram";

//Create order in DB
async function createOrderFromWebhook(
  data: any,
  meta: any,
  receiptNo: string,
  orderSequentialNoForDay: string
) {
  const customer = meta.customerInfo || {};
  const discount = meta.discount
    ? {
        _id: meta.discount._id,
        code: meta.discount.code,
        type: meta.discount.type,
        value: meta.discount.value,
      }
    : undefined;

  const orderData = {
    items: meta.cartItems || [],
    merchantId: meta.merchantData?._id,
    customerInfo: {
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      state: customer.state || "",
      postcode: customer.postcode || "",
      city: customer.city || "",
    },

    subTotal: meta.subtotal ? parseFloat(meta.subtotal) : 0, // before tax, discount and delivery
    discount,
    discountAmount: meta.discountAmount ? meta.discountAmount : 0,
    tax: {
      rate: meta.taxRate ?? 0,
      totalTax: meta.totalTax ?? 0,
    },
    delivery: meta.delivery ?? false,
    deliveryFee: meta.deliveryFee ?? 0,
    totalAmount: parseFloat(data.amount),
    tranID: data.tranID,
    orderid: data.orderid,
    paymentStatus: data.status,
    paymentMeta: {
      currency: data.currency,
      paydate: data.paydate,
      channel: data.channel,
    },
    status: "new",
    notes: meta.remarks || "",
    receiptNo: receiptNo || "",
    orderSequentialNoForDay: orderSequentialNoForDay || "",
    pickTime: meta.selectedTime || "",
  };

  await Order.create(orderData);
}

// Helper: Get next receipt number
async function getNextReceiptNo(merchantId: mongoose.Types.ObjectId) {
  const result = await Counter.findByIdAndUpdate(
    merchantId,
    { $inc: { seq: 1 } }, //+ by 1
    { new: true, upsert: true } //upsert: true -->If the doc for this merchant not exist, create with seq starting at 1.
  );
  return `RN-${result.seq.toString().padStart(6, "0")}`; // e.g., "RN-000001"
}

// Helper: Get order sequential number for the day
async function getOrderSequentialNoForDay(merchantId: mongoose.Types.ObjectId) {
  const today = new Date();
  const yyyyMMdd = today.toISOString().slice(0, 10).replace(/-/g, ""); // e.g., "20250829"
  const counterId = `${merchantId}_${yyyyMMdd}`; // e.g., "merchantId_20250829"

  const result = await OrderCounter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq.toString().padStart(3, "0"); // e.g., "001"
}

// Webhook handler
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

    //“Fiuu! I got your webhook!”
    data.treq = 1; // Additional parameter for IPN. Value always set to 1.

    // Fetch merchant and decrypt fiuuPrivateKey
    await dbConnect();
    const merchantId = data.extraP?.metadata?.merchantData?._id;
    const hasMetadata = !!data.extraP?.metadata; // Check if metadata exists

    //convinient for fiuu webhook checking. else error due to no metadata ...
    if (hasMetadata && !merchantId) {
      return NextResponse.json(
        { error: "Merchant ID missing in metadata" },
        { status: 400 }
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
      // Prepare order data from webhook payload
      const meta = data.extraP?.metadata || {};
      const merchantObjectId = new mongoose.Types.ObjectId(
        meta.merchantData?._id
      );

      const receiptNo = await getNextReceiptNo(merchantObjectId);
      const orderSequentialNoForDay = await getOrderSequentialNoForDay(
        merchantObjectId
      );

      // collect data send to telegram
      const orderNumber = orderSequentialNoForDay; // already padded, e.g. "001"
      const orderSummaryTelegram = buildOrderMessage(data, meta, orderNumber);

      try {
        await createOrderFromWebhook(
          data,
          meta,
          receiptNo,
          orderSequentialNoForDay
        );
        try {
          if (merchant.telegramId) {
            await sendLongTelegramMessage(
              merchant.telegramId,
              orderSummaryTelegram
            );
          } else {
            console.warn(
              "Merchant telegramId not set, skipping Telegram notification."
            );
          }
        } catch (telegramErr: any) {
          console.error(
            "Error sending Telegram message:",
            telegramErr?.response?.data || telegramErr
          );
        }
        console.log("Order created for orderid----->", data.orderid);
      } catch (err) {
        console.error("Error creating order:", err);
      }
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
