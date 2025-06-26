"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMerchant } from "@/contexts/MerchantContext";

// Import your actions
import { getCategoriesByMerchant } from "@/lib/actions/category";
import {
  createSubCategory,
  getSubCategoriesByMerchantAndCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/lib/actions/subCategory";

// Zod schema
const subCategorySchema = z.object({
  name: z.string().min(1, "Sub Category name is required"),
  parentCategory: z.string().min(1, "Please select a category"),
});

export default function CreateSubCategoryPage() {
  const { selectedMerchant } = useMerchant();// Get the selected merchant from context
  const [categories, setCategories] = useState<any[]>([]);// State to hold categories
  const [subCategories, setSubCategories] = useState<any[]>([]);// State to hold subcategories
  const [selectedCategory, setSelectedCategory] = useState<string>("");// State to hold selected category
  const [editSubCategory, setEditSubCategory] = useState<any>(null);// State to hold subcategory being edited
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: { name: "", parentCategory: "" },
  });

  // Fetch categories on mount
  useEffect(() => {
    getCategoriesByMerchant(selectedMerchant?._id).then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      getSubCategoriesByMerchantAndCategory(
        selectedMerchant._id,
        selectedCategory
      ).then((res) => {
        if (res.success) setSubCategories(res.subCategories);
      });
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  // Check if merchant is selected
  if (!selectedMerchant) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/admin";
    }
    return null;
  }

  // Handle form submit
  const onSubmit = async (data: any) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      let result;
      if (editSubCategory) {
        result = await updateSubCategory(editSubCategory._id, {
          name: data.name,
        });
      } else {
        result = await createSubCategory({
          name: data.name,
          merchantId:selectedMerchant._id ,
          parentCategoryId: data.parentCategory,
        });
      }
      if (result.success) {
        setSuccessMsg(
          editSubCategory ? "Sub Category updated!" : "Sub Category created!"
        );
        reset({ name: "", parentCategory: selectedCategory });// parent category dropdown stays on the currently selected category 
        setEditSubCategory(null);
        // Refresh subcategories
        if (selectedCategory) {
          getSubCategoriesByMerchantAndCategory(selectedMerchant._id, selectedCategory).then(
            (res) => {
              if (res.success) setSubCategories(res.subCategories);
            }
          );
        }
      } else {
        setErrorMsg(result.error || "Failed to save sub category.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    }
  };

  // Handle edit
  const handleEdit = (subCat: any) => {
    setEditSubCategory(subCat);
    setValue("name", subCat.name);
    setValue("parentCategory", subCat.parentCategory);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    setSuccessMsg("");
    setErrorMsg("");
    const result = await deleteSubCategory(id);
    if (result.success) {
      setSuccessMsg("Sub Category deleted!");
      setEditSubCategory(null);
      reset({ name: "", parentCategory: selectedCategory });
      // Refresh subcategories
      if (selectedCategory) {
        getSubCategoriesByMerchantAndCategory(selectedMerchant._id, selectedCategory).then(
          (res) => {
            if (res.success) setSubCategories(res.subCategories);
          }
        );
      }
    } else {
      setErrorMsg(result.error || "Failed to delete sub category.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">
        {editSubCategory ? "Edit Sub Category" : "Create Sub Category"}
      </h1>
      <form
        className="flex flex-col max-w-md"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <label htmlFor="parentCategory" className="mb-2 font-medium text-black">
          Parent Category
        </label>
        <select
          id="parentCategory"
          className="border border-gray-300 rounded px-3 py-2 mb-4 text-black"
          {...register("parentCategory")}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setValue("parentCategory", e.target.value);
            reset({ name: "", parentCategory: e.target.value });
            setEditSubCategory(null);
          }}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.parentCategory && (
          <div className="text-red-600 text-sm mb-2">
            {errors.parentCategory.message}
          </div>
        )}

        <label htmlFor="name" className="mb-2 font-medium text-black">
          Sub Category Name
        </label>
        <input
          id="name"
          type="text"
          className="border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <div className="text-red-600 text-sm mb-2">{errors.name.message}</div>
        )}

        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? editSubCategory
              ? "Updating..."
              : "Creating..."
            : editSubCategory
            ? "Update"
            : "Create"}
        </button>
        {editSubCategory && (
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
              onClick={() => handleDelete(editSubCategory._id)}
              disabled={isSubmitting}
            >
              Delete
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
              onClick={() => {
                setEditSubCategory(null);
                reset({ name: "", parentCategory: selectedCategory });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        )}
        {successMsg && <div className="mt-4 text-green-600">{successMsg}</div>}
        {errorMsg && <div className="mt-4 text-red-600">{errorMsg}</div>}
      </form>

      {/* Subcategories list */}
      {selectedCategory && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2 text-black">Sub Categories</h2>
          <div className="flex flex-wrap gap-2">
            {subCategories.map((subCat) => (
              <button
                key={subCat._id}
                type="button"
                //className="bg-gray-200 px-4 py-2 rounded hover:bg-blue-200"
                className={`px-4 py-2 rounded border cursor-pointer ${
              editSubCategory && editSubCategory._id === subCat._id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-blue-100"
            }`}
                onClick={() => handleEdit(subCat)}
              >
                {subCat.name}
              </button>
            ))}
            {subCategories.length === 0 && (
              <span className="text-gray-500">No sub categories found.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
