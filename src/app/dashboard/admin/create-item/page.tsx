"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMerchant } from "@/contexts/MerchantContext";
import { capitalizeFirst } from "@/lib/utils/capitalize";
import { createItem } from "@/lib/actions/item";
import { getCategoriesByMerchant } from "@/lib/actions/category";
import { getSubCategoriesByMerchantAndCategory } from "@/lib/actions/subCategory";
import imageCompression from "browser-image-compression";
import {
  uploadImagesToCloudinary,
  deleteImageFromCloudinary,
} from "@/lib/actions/cloudinary";

import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
// Zod schema
const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"), //coerce let str to num so to avoid validation error on string input
  availability: z.boolean(),
  image: z.array(
    z.object({
      url: z.string(),
      public_id: z.string(),
    })
  ),
  category: z.string().min(1, "Category is required"),
  subCategories: z.array(z.string()),
  addOns: z.array(
    z.object({
      name: z.string().min(1, "Add-on name required"),
      price: z.coerce.number().min(0, "Add-on price must be positive"),
    })
  ),
});

export default function CreateItemPage() {
  const { selectedMerchant } = useMerchant();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]); // File[]= array of File objects.
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  console.log("Selected Merchant-------------------->", selectedMerchant);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control, //is require for advanced form features like field arrays & custom components in React Hook Form.
    reset,
    watch, //watch is used to get live form data
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      availability: true,
      image: [],
      category: "",
      subCategories: [],
      addOns: [],
    },
  });

  const formValues = watch();

  useEffect(() => {
    console.log(
      "Live form data---------------------------------->>",
      formValues
    );
  }, [formValues]);

  // AddOns field array
  const {
    fields: addOnFields, //from the useFieldArray hook
    append: appendAddOn, //function to add new add-on
    remove: removeAddOn, //function to remove an add-on
  } = useFieldArray({
    control,
    name: "addOns",
  });

  // Fetch categories on mount
  useEffect(() => {
    if (!selectedMerchant?._id) return;
    getCategoriesByMerchant(selectedMerchant._id).then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, [selectedMerchant]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!selectedMerchant?._id || !selectedCategory) {
      setSubCategories([]);
      return;
    }
    getSubCategoriesByMerchantAndCategory(
      selectedMerchant._id,
      selectedCategory
    ).then((res) => {
      if (res.success) setSubCategories(res.subCategories);
    });
  }, [selectedMerchant, selectedCategory]);

  // Handle image file input
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageLoading(true);
    const files = Array.from(e.target.files || []);
    const prevImages =
      (getValues("image") as { url: string; public_id: string }[]) || [];
    const totalImages = prevImages.length + files.length;
    if (totalImages > 4) {
      toast.error("You can upload up to 4 images only.");
      setImageLoading(false);
      return;
    }
    setImageFiles(files);

    // Compress images
    const compressedFiles = await Promise.all(
      files.map((file) =>
        imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true, // Use web worker for compression so it doesn't block UI
        })
      )
    );

    console.log("Compressed files:", compressedFiles);

    // Convert to base64 for server upload
    const base64Files = await Promise.all(
      compressedFiles.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader(); // reads the file.
          reader.onload = () => resolve(reader.result as string); //handles success.
          reader.onerror = reject; //handles failure.
          reader.readAsDataURL(file); // starts the process and produces the base64 string.
        });
      })
    );

    console.log("Base64 files:", base64Files);

    // Upload to Cloudinary
    if (selectedMerchant?.slug) {
      const result = await uploadImagesToCloudinary(
        base64Files,
        selectedMerchant.slug
      );
      console.log("Cloudinary upload result:", result);
      if (result.success) {
        // Combine existing and new images, but max 4
        const newImages = result.images ?? [];

        //update form value for images (with url and public_id)
        const prevImages =
          (getValues("image") as { url: string; public_id: string }[]) ?? [];
        const combinedImageObjs = [...prevImages, ...newImages].slice(0, 4);
        setValue("image", combinedImageObjs);
        console.log("Images uploaded successfully:", result.images);
        setImageLoading(false);
      } else {
        setErrorMsg(result.error || "Image upload failed.");
        setImageLoading(false);
      }
    }
  };

  // Capitalize title on blur
  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setValue("title", capitalizeFirst(value), { shouldValidate: true });
    }
  };

  // Handle form submit
  const onSubmit = async (data: any) => {
    setSuccessMsg("");
    setErrorMsg("");
    if (!selectedMerchant?._id) {
      setErrorMsg("Merchant not selected.");
      return;
    }
    // For now, image array will be empty or dummy data
    const result = await createItem({
      ...data,
      merchant: selectedMerchant._id,
    });
    if (result.success) {
      setSuccessMsg("Item created!");
      reset();
      setImageFiles([]);
      setSelectedCategory("");
      setSubCategories([]);
    } else {
      setErrorMsg(result.error ?? "Failed to create item.");
    }
  };

  if (!selectedMerchant) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/admin";
    }
    return null;
  }

  return (
    <main className="max-w-xl mx-auto my-8 p-8 border border-gray-200 rounded-lg bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">Create New Item</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        {/* Image upload */}
        <label className="font-medium">Images (max 4)</label>
        <label className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors w-fit">
          {imageLoading ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="animate-spin" /> Loading...
            </span>
          ) : (
            <span>Select Images</span>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={isSubmitting}
            className="hidden"
          />
        </label>

        <div className="flex gap-2 mt-2">
          {getValues("image")?.map((img, idx) => (
            <div key={img.public_id} className="relative w-20 h-20">
              <img
                src={img.url}
                alt={`preview-${idx}`}
                className="w-20 h-20 object-cover rounded border"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete this image?"
                  );
                  if (!confirmDelete) return;
                  // Call server action to delete from Cloudinary
                  setImageLoading(true);
                  const res = await deleteImageFromCloudinary(img.public_id);
                  if (res.success) {
                    // Remove from form value and previews
                    const updatedImages = getValues("image").filter(
                      (i: any) => i.public_id !== img.public_id
                    );
                    setValue("image", updatedImages);
                    setImageLoading(false);
                    toast.success("Image deleted!");
                  } else {
                    toast.error(res.error || "Failed to delete image.");
                    setImageLoading(false);
                  }
                }}
                disabled={isSubmitting}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Title */}
        <label htmlFor="title" className="font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="border rounded px-3 py-2"
          {...register("title")}
          onBlur={handleTitleBlur}
          disabled={isSubmitting}
        />
        {errors.title && (
          <div className="text-red-600 text-sm">{errors.title.message}</div>
        )}

        {/* Description */}
        <label htmlFor="description" className="font-medium">
          Description
        </label>
        <textarea
          id="description"
          className="border rounded px-3 py-2"
          {...register("description")}
          disabled={isSubmitting}
        />
        {errors.description && (
          <div className="text-red-600 text-sm">
            {errors.description.message}
          </div>
        )}

        {/* Price */}
        <label htmlFor="price" className="font-medium">
          Price (RM)
        </label>
        <input
          id="price"
          type="number"
          step="0.05"
          min="0"
          className="border rounded px-3 py-2"
          {...register("price")}
          disabled={isSubmitting}
        />
        {errors.price && (
          <div className="text-red-600 text-sm">{errors.price.message}</div>
        )}

        {/* Availability */}
        <label className="font-medium flex items-center gap-2">
          <input
            type="checkbox"
            {...register("availability")}
            defaultChecked
            disabled={isSubmitting}
          />
          Available
        </label>

        {/* Category */}
        <label htmlFor="category" className="font-medium">
          Category
        </label>
        <select
          id="category"
          className="border rounded px-3 py-2"
          {...register("category")}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setValue("category", e.target.value);
            setValue("subCategories", []);
          }}
          disabled={isSubmitting}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <div className="text-red-600 text-sm">{errors.category.message}</div>
        )}

        {/* Sub-Categories */}
        {selectedCategory && (
          <div>
            <label className="font-medium">Sub-Categories</label>
            <div className="flex flex-wrap gap-2">
              {subCategories.map((subCat) => (
                <label key={subCat._id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    value={subCat._id}
                    {...register("subCategories")}
                    disabled={isSubmitting}
                  />
                  {subCat.name}
                </label>
              ))}
              {subCategories.length === 0 && (
                <span className="text-gray-500">No sub-categories found.</span>
              )}
            </div>
          </div>
        )}

        {/* Add-ons */}
        <label className="font-medium">Add-ons</label>
        {addOnFields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 items-center mb-2">
            <input
              type="text"
              placeholder="Add-on name"
              className="border rounded px-2 py-1"
              {...register(`addOns.${idx}.name`)}
              disabled={isSubmitting}
            />
            <input
              type="number"
              min="0"
              step="0.10"
              placeholder="Price"
              className="border rounded px-2 py-1 w-24"
              {...register(`addOns.${idx}.price`)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="text-red-600 px-2 cursor-pointer"
              onClick={() => removeAddOn(idx)}
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="bg-green-500 text-white px-3 py-2 rounded w-fit cursor-pointer hover:bg-green-600 transition-colors"
          onClick={() => appendAddOn({ name: "", price: 0 })}
          disabled={isSubmitting}
        >
          Add Add-on
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 cursor-pointer transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
        {successMsg && <div className="text-green-600 mt-2">{successMsg}</div>}
        {errorMsg && <div className="text-red-600 mt-2">{errorMsg}</div>}
      </form>
    </main>
  );
}
