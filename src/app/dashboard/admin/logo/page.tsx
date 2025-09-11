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
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dimension requirements
  const MIN_DIM = 128;
  const MAX_DIM = 512;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check image dimensions before upload
    const img = new window.Image(); //Creates new Img obj in the browser.
    img.src = URL.createObjectURL(file);//Sets img source to temporary URL so the browser can load it
    //onload event triggers when the image is fully loaded
    img.onload = async () => {
      if (
        img.width !== img.height ||
        img.width < MIN_DIM ||
        img.width > MAX_DIM
      ) {
        setError(
          `Logo must be square and between ${MIN_DIM}x${MIN_DIM} and ${MAX_DIM}x${MAX_DIM} pixels.`
        );
        setLoading(false);
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
      setLoading(false);
    };
    img.onerror = () => {
    setError("Invalid image file.");
    setLoading(false); // Stop loading on error
  };
  };

  const handleRemove = async () => {
    setLoading(true);
    if (logo?.public_id) {
      await deleteImageFromCloudinary(logo.public_id);
    }
    setLogo(null);
    setPreview("");
    await updateMerchantLogo(selectedMerchant._id, null);
    setLoading(false);
  };

  if (!selectedMerchant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="text-gray-500 text-lg font-semibold text-center">
        Merchant data not loaded.
      </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-800">
      <label className="block mb-2 font-semibold text-gray-800 text-center">
        Merchant Logo
      </label>
      {loading ? (
        <div className="flex flex-col items-center justify-center my-8">
          <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
            <span className="text-blue-500 text-sm">Loading...</span>
        </div>
      ) : preview ? (
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
            <span>Select Logo image</span>
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
      {error && <div className="text-red-500 mt-2 text-center text-sm">{error}</div>}
      <div className="text-sm text-gray-600 mt-2 text-center font-normal">
        Logo must be square, between {MIN_DIM}x{MIN_DIM} and {MAX_DIM}x{MAX_DIM} pixels.<br />
        Accepted formats: <span className="font-mono">PNG, JPEG</span>
      </div>
    </div>
  );
}
