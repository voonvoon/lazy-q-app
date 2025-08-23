"use server";
import CryptoJS from "crypto-js";
import Item from "@/models/Item";
import AddOn from "@/models/AddOn";
import Merchant from "@/models/Merchant";
import dbConnect from "@/lib/mongodb";
import { verifyDiscountCode } from "@/lib/actions/discount";

const merchantID = process.env.FIUU_MERCHANT_ID || "defaultMerchantID";
const vkey = process.env.FIUU_VERIFY_KEY || "defaultVkey";

// Helper: MD5 hash
const getMD5HashData = (data: string) => CryptoJS.MD5(data).toString();

// Helper: Generate unique order ID
const generateRandomOrderId = (): string => {
  const now = new Date();
  const dateString = now
    .toISOString() // Get ISO string
    .replace(/[-:.TZ]/g, "") // Remove unwanted chars
    .slice(0, 14); // Get first 14 chars (yyyyMMddHHmmss)
  const uniqueSuffix = Math.floor(Math.random() * 10000) // Generate random 4-digit suffix
    .toString()
    .padStart(4, "0");
  return `oi${dateString}${uniqueSuffix}`;
};

// Main server action
export const createPaymentLinkPost = async ({
  //some data receive in args redundant since no harm i leave it there first
  //as long as i fetch real data from db.
  cartItems,
  customerInfo,
  delivery,
  discount,
  merchantData,
}: {
  cartItems: any[];
  customerInfo: any;
  delivery: boolean;
  discount: any;
  merchantData: any;
}): Promise<{ url: string; data: any }> => {

  await dbConnect();

  const realMerchant: any = await Merchant.findById(merchantData?._id).lean();
  if (!realMerchant) throw new Error("Merchant not found");

  let subtotal = 0;
  const validatedCartItems: any = [];

  for (const cartItem of cartItems) {
    // Fetch real item from DB
    const realItem: any = await Item.findById(cartItem.itemId).lean();
    if (!realItem) continue; // skip if item not found

    // Fetch real add-ons from DB
    let addOnsTotal = 0;
    let validatedAddOns: any = [];
    if (Array.isArray(cartItem.addOns) && cartItem.addOns.length > 0) {
      const addOnIds = cartItem.addOns.map((a: any) => a._id);
      const realAddOns = await AddOn.find({ _id: { $in: addOnIds } }).lean();

      validatedAddOns = realAddOns.map((addOn: any) => ({
        _id: addOn._id,
        name: addOn.name,
        price: addOn.price,
      }));

      addOnsTotal = realAddOns.reduce(
        (sum: number, addOn: any) => sum + Number(addOn.price),
        0
      );
    }

    // Calculate total for this cart item
    const itemTotal =
      (Number(realItem.price) + addOnsTotal) * cartItem.quantity;
    subtotal += itemTotal;

    // Store validated item for metadata (optional)
    validatedCartItems.push({
      itemId: realItem._id,
      title: realItem.title,
      price: realItem.price,
      quantity: cartItem.quantity,
      addOns: validatedAddOns,
      remarks: cartItem.remarks,
      itemTotal,
    });
  }

  console.log("subtotal------->", subtotal);

  // Apply discount if present //
  // 1. Securely verify discount from DB
  let verifiedDiscount = null;
  let discountAmount = 0;

  if (discount?.code && merchantData?._id) {
    const res = await verifyDiscountCode(merchantData._id, discount.code); //utilize existing func here same with client used.
    if (res.success && res.discount) {
      verifiedDiscount = res.discount;
    }
  }

  // 2. Use only the verified discount for calculations
  if (verifiedDiscount) {
    if (verifiedDiscount.type === "amount") {
      discountAmount = Number(verifiedDiscount.value);
    } else if (verifiedDiscount.type === "percentage") {
      discountAmount = Number(
        (subtotal * (verifiedDiscount.value / 100)).toFixed(2)
      );
    }
  }
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0); //result never < 0
  console.log("discountedSubtotal------->", discountedSubtotal);
  // Apply discount END //

  // Calculate tax (SST) on discounted subtotal
  const taxRate = realMerchant.tax ?? 0;
  const totalTax = Number((discountedSubtotal * (taxRate / 100)).toFixed(2));

  // Calculate delivery fee
  let deliveryFee = 0;
  if (delivery && realMerchant.deliveryFee) {
    const threshold = realMerchant.freeDeliveryThreshold ?? Infinity;
    deliveryFee =
      discountedSubtotal >= threshold ? 0 : Number(realMerchant.deliveryFee);
  }

  console.log("deliveryFee------->", deliveryFee);

  // Final total
  const totalAmount = Number(
    (discountedSubtotal + totalTax + deliveryFee).toFixed(2)
  );

  console.log("totalAmount------->", totalAmount);

  // Generate order ID
  const orderId = generateRandomOrderId();

  // Prepare metadata (customize as needed)
  const metadata = JSON.stringify({
    cartItems: validatedCartItems,
    customerInfo,
    delivery,
    discount: verifiedDiscount,
    merchantData,
  });

  // Prepare Fiuu payment data
  const data = {
    merchant_id: merchantID,
    amount: totalAmount,
    orderid: orderId,
    bill_name: customerInfo?.name || "Customer",
    bill_email: customerInfo?.email || "demo@RMS.com",
    bill_mobile: customerInfo?.phone || "0123456789",
    bill_desc: "Order from Lazy-Q App",
    //returnurl: `https://lonely-food-app.vercel.app/api/return-url?id=${orderId}`,
    returnurl: `https://lazy-q-app.vercel.app/`,
    b_addr1: customerInfo?.address1 || "",
    b_addr2: customerInfo?.address2 || "",
    b_zipcode: customerInfo?.zipcode || "",
    b_city: customerInfo?.city || "",
    b_state: customerInfo?.state || "",
    country: "MY",
    s_name: customerInfo?.name || "",
    s_addr1: customerInfo?.address1 || "",
    vcode: "",
    metadata,
  };

  // Generate vcode
  data.vcode = getMD5HashData(
    `${data.amount}${merchantID}${data.orderid}${vkey}`
  );

  // Fiuu payment URL (use sandbox for testing)
  // const url = `https://sandbox.fiuu.com/RMS/pay/${merchantID}/`;
  const url = `https://pay.fiuu.com/RMS/pay/${merchantID}/`;

  return { url, data };
};
