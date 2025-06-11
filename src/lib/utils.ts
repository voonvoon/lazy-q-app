// lib/utils.ts
import Merchant from '@/models/Merchants'; 
import dbConnect from '@/lib/mongodb'; 

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  await dbConnect(); 
  
  let slug = baseSlug;
  let counter = 1;
  
  while (await Merchant.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}