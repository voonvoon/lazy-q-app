// lib/utils/restaurant-status.ts

import { IMerchant } from "@/models/Merchants";

export const canPlaceOrder = (merchant: IMerchant) => {
  if (!merchant.isActive) return false;
  
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = merchant.businessHours?.find(h => h.day === today);
  
  if (!todayHours || todayHours.isClosed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};