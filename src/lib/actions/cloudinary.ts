"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImagesToCloudinary(
  files:string[], //an array of base64 strings, Next.js server action cannot send a real File obj
  merchantSlug: string
) {
  // Convert File objects to buffers (Node.js doesn't have File, so you may need to use Buffer or handle base64)
  // This example assumes files are sent as base64 strings from the frontend
  try {
    const results = await Promise.all(
      files.map(async (file: any) => {
        // file should be a base64 string or buffer
        const uploadResult = await cloudinary.uploader.upload(file, {
          folder: `lazy_Q/${merchantSlug}`,
        });
        return {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        };
      })
    );
    return { success: true, images: results };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return { success: false, error: "Cloudinary upload failed." };
  }
  }

export async function deleteImageFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return { success: false, error: "Failed to delete image from Cloudinary." };
  }
}

export async function uploadLogoToCloudinary(
  file: string, // base64 string from frontend
  merchantSlug: string
) {
  try {
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: `lazy_Q/${merchantSlug}/logo`,
      overwrite: true, // always overwrite the logo if re-uploaded
      resource_type: "image",
    });
    return {
      success: true,
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    };
  } catch (err) {
    console.error("Cloudinary logo upload error:", err);
    return { success: false, error: "Cloudinary logo upload failed." };
  }
}