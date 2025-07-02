//[[...id]] syntax makes the id param optional.
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMerchant } from "@/contexts/MerchantContext";
import { capitalizeFirst } from "@/lib/utils/capitalize";
import { createItem, getItemById, updateItem } from "@/lib/actions/item";
import { getCategoriesByMerchant } from "@/lib/actions/category";
import { getSubCategoriesByMerchantAndCategory } from "@/lib/actions/subCategory";
import imageCompression from "browser-image-compression";
import {
  uploadImagesToCloudinary,
  deleteImageFromCloudinary,
} from "@/lib/actions/cloudinary";

import toast from "react-hot-toast";
import { FiUpload } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

// Zod schema
const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  //price: z.coerce.number().min(0, "Price must be positive"), //coerce let str to num so to avoid validation error on string input
  price: z
    .string()
    .min(1, "Price is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Price must be positive",
    }),
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
  const params = useParams();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id; //safely get id, sometime maybe is array/undefined
  const { selectedMerchant, isLoading } = useMerchant();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  //console.log("Selected Merchant-------------------->", selectedMerchant);

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
      price: "0", //str cuz zod schema start with checking for string then transform to number
      availability: true,
      image: [],
      category: "",
      subCategories: [],
      addOns: [],
    },
  });

  //fetch item data if editing
  useEffect(() => {
    if (itemId) {
      getItemById(itemId).then((res) => {
        if (res.success && res.item) {
          const itemData = {
            ...res.item,
            price: res.item.price?.toString() ?? "0",
          };
          reset(itemData);
          setSelectedCategory(res.item.category);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      });
    } else {
      setNotFound(false);
    }
  }, [itemId]);

  //log live form data for debugging
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

    // Upload to Cloudinary
    if (selectedMerchant?.slug) {
      const result = await uploadImagesToCloudinary(
        base64Files,
        selectedMerchant.slug
      );

      if (result.success) {
        // Combine existing and new images, but max 4
        const newImages = result.images ?? [];

        //update form value for images (with url and public_id)
        const prevImages =
          (getValues("image") as { url: string; public_id: string }[]) ?? [];
        const combinedImageObjs = [...prevImages, ...newImages].slice(0, 4); //slice for safety although we already check total images above
        setValue("image", combinedImageObjs);
        setImageLoading(false);

        // auto update item in edit mode when admidn uploads new images
        if (itemId) {
          await updateItem(itemId, {
            ...getValues(),
            image: combinedImageObjs,
            merchant: selectedMerchant._id,
          });
          toast.success("Item auto saved after new image upload!");
        }
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

  // Handle form submission
  const onSubmit = async (data: any) => {
    setSuccessMsg("");
    setErrorMsg("");
    if (!selectedMerchant?._id) {
      setErrorMsg("Merchant not selected.");
      return;
    }

    let result;
    if (itemId) {
      // Edit mode: update item
      result = await updateItem(itemId, {
        ...data,
        merchant: selectedMerchant._id,
      });
    } else {
      // Create mode: create item
      result = await createItem({
        ...data,
        merchant: selectedMerchant._id,
      });
    }

    if (result.success) {
      //setSuccessMsg(itemId ? "Item updated!" : "Item created!");
      toast.success(
        itemId ? "Item updated successfully!" : "Item created successfully!"
      );
      if (!itemId) {
        reset();
        setSelectedCategory("");
        setSubCategories([]);
      }
    } else {
      // setErrorMsg(
      //   result.error ??
      //     (itemId ? "Failed to update item." : "Failed to create item.")
      // );
      toast.error(
        result.error ??
          (itemId ? "Failed to update item." : "Failed to create item.")
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!selectedMerchant) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/admin";
    }
    return null;
  }

  //if itemId is there but not valid
  if (notFound) {
    return (
      <main className="max-w-xl mx-auto my-8 p-8 border border-gray-200 rounded-lg bg-white text-black">
        <h1 className="text-2xl font-bold mb-6 text-red-600">
          No such product found.
        </h1>
        <p>
          The product ID is invalid or the item no longer exists in the
          database.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto my-8 p-8 border border-gray-200 rounded-lg bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">Create New Item</h1>
      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
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
          className="border border-green-500 text-green-600 px-3 py-2 rounded w-fit cursor-pointer hover:bg-green-50 hover:border-green-600 transition-colors bg-white font-semibold"
          onClick={() => appendAddOn({ name: "", price: 0 })}
          disabled={isSubmitting}
        >
          Add Add-on
        </button>

        {/* Image upload */}
        <label className="font-medium">Upload Images (max 4)</label>
        <label className="inline-flex items-center gap-2 border-1 border-blue-500 text-blue-600 px-4 py-2 rounded-lg cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-700 transition-all w-fit font-semibold shadow-sm">
          {imageLoading ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="animate-spin text-lg" /> Loading...
            </span>
          ) : (
            <>
              <FiUpload className="text-xl" />
              <span>Select Images</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={isSubmitting || imageLoading}
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
                className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer"
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

                    // 🟢 Auto-update DB if editing
                    if (itemId) {
                      await updateItem(itemId, {
                        ...getValues(), // get all current form values
                        image: updatedImages,
                        merchant: selectedMerchant._id,
                      });
                      toast.success("Item auto saved after image delete!");
                    }
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

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-3 rounded mt-4 hover:bg-blue-700 cursor-pointer transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? itemId
              ? "Updating..."
              : "Creating..."
            : itemId
            ? "Update"
            : "Create"}
        </button>
      </form>
    </main>
  );
}
