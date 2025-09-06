"use server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * Retrieve an order by orderid (public, no auth)
 * @param orderid The orderid to search for
 * @returns The order object or null if not found
 */
export async function getOrderByOrderId(orderid: string) {
  if (!orderid) return null;
  await dbConnect();
  const order = await Order.findOne({ orderid }).lean();
  return order || null;
}
