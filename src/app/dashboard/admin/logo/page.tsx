"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { updateMerchantLogo } from "@/lib/actions/settings";
import {
  uploadLogoToCloudinary,
  deleteImageFromCloudinary,
} from "@/lib/actions/cloudinary";
import { useMerchant } from "@/contexts/MerchantContext";
import { FiUpload } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

export default function LogoUploader() {
  const { selectedMerchant } = useMerchant();
  const [logo, setLogo] = useState(selectedMerchant?.logo || null);
  const [preview, setPreview] = useState(selectedMerchant?.logo?.url || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Dimension requirements
  const MIN_DIM = 128;
  const MAX_DIM = 512;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Check image dimensions before upload
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if (
        img.width !== img.height ||
        img.width < MIN_DIM ||
        img.width > MAX_DIM
      ) {
        setError(
          `Logo must be square and between ${MIN_DIM}x${MIN_DIM} and ${MAX_DIM}x${MAX_DIM} pixels.`
        );
        return;
      }
      // Convert file to base64
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

      const base64 = await toBase64(file);
      const result: any = await uploadLogoToCloudinary(
        base64,
        selectedMerchant.slug
      );
      if (result.success) {
        setLogo(result.data);
        setPreview(result.data.url);
        // Save to DB
        await updateMerchantLogo(selectedMerchant._id, result.data);
      } else {
        setError(result.message || "Upload failed");
      }
    };
    img.onerror = () => setError("Invalid image file.");
  };

  const handleRemove = async () => {
    if (logo?.public_id) {
      await deleteImageFromCloudinary(logo.public_id);
    }
    setLogo(null);
    setPreview("");
    await updateMerchantLogo(selectedMerchant._id, null);
  };

  if (!selectedMerchant) {
    return <div className="text-red-500">Merchant data not loaded.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-800">
      <label className="block mb-2 font-semibold text-gray-800 text-center">
        Merchant Logo
      </label>
      {preview ? (
        <div className="mb-2 flex flex-col items-center">
          <Image
            src={preview}
            alt="Merchant Logo"
            width={128}
            height={128}
            className="rounded shadow"
          />
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition-all text-sm"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-2 border-1 border-blue-500 text-blue-600 px-4 py-2 rounded-lg cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-700 transition-all w-fit font-semibold shadow-sm">
          <>
            <FiUpload className="text-xl" />
            <span>Select Images</span>
          </>
          <input
            type="file"
            accept="image/png,image/jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
      {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
      <div className="text-sm text-gray-800 mt-2 text-center">
        Logo must be square, between {MIN_DIM}x{MIN_DIM} and {MAX_DIM}x{MAX_DIM}{" "}
        pixels.
      </div>
    </div>
  );
}
