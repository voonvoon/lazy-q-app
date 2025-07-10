import { IMerchant } from "@/models/Merchant";

// lib/utils/restaurant-status.ts
export const isRestaurantOpen = (merchant: IMerchant) => {
  // First check if restaurant is active
  if (!merchant.isActive) {
    return {
      isOpen: false,
      reason: 'Restaurant is temporarily closed',
      nextOpen: null
    };
  }

  // ✅ Get current Malaysian time
  const now = new Date();
  const malaysianTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"}));
  
  const currentDay = malaysianTime.toLocaleDateString('en-US', { 
    weekday: 'long',
    timeZone: 'Asia/Kuala_Lumpur' 
  }).toLowerCase();
  
  const currentTime = malaysianTime.toTimeString().slice(0, 5); // "14:30"
  
  console.log(`🇲🇾 Malaysian time: ${malaysianTime}`);
  console.log(`📅 Current day: ${currentDay}`);
  console.log(`🕐 Current time: ${currentTime}`);

  const todayHours = merchant.businessHours?.find((h: { day: string; }) => h.day === currentDay);
  
  if (!todayHours || todayHours.isClosed) {
    return {
      isOpen: false,
      reason: 'Closed today',
    };
  }

  const isWithinHours = currentTime >= todayHours.open && currentTime <= todayHours.close;
  
  return {
    isOpen: isWithinHours,
    reason: isWithinHours ? 'Open' : 'Outside business hours',
    currentMalaysianTime: malaysianTime.toLocaleString('en-MY')
  };
};