"use client";

import { useMerchant } from "@/contexts/MerchantContext";
import { useState, useEffect } from "react";
import {
  createCategory,
  getCategoriesByMerchant,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category";
import { useForm } from "react-hook-form"; //helps you manage form state, validation, and submission
import { z } from "zod"; //TypeScript-first schema validation library.
import { zodResolver } from "@hookform/resolvers/zod"; //connects React Hook Form and Zod
import { capitalizeFirst } from "@/lib/utils/capitalize";
import toast from "react-hot-toast";

const COMMON_CATEGORIES = [
  "Appetizers",
  "Main Course",
  "Drinks",
  "Dessert",
  "Snacks",
  "Salad",
  "Soup",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Other",
];

//Zod schema for category validation
const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name at least 2 chars")
    .max(20, "Category name too long"),
});

//Auto Give me the TypeScript type for this schema.
type CategoryForm = z.infer<typeof categorySchema>;

export default function CreateCategoryPage() {
  const { selectedMerchant } = useMerchant(); //to get the selected merchant from context
  const [dropdown, setDropdown] = useState(COMMON_CATEGORIES[0]); //to hold selected category from dropdown
  const [categories, setCategories] = useState<any[]>([]); //to hold fetched categories
  const [editCategory, setEditCategory] = useState<any>(null); //to hold category being edited
const [refreshKey, setRefreshKey] = useState(0);
  const {
    register, //Connects input field to React Hook Form so can track their values & validation.
    handleSubmit, //func use on your <form> to handle form submission & validation.
    setValue, //programmatically set the value of a form field
    reset, //Resets the form to its default values
    watch, //Allows you to watch the value of a form field
    formState: { errors, isSubmitting, touchedFields }, //obj destuctured from formState contains current state of form, incl errors & submission status
    //clearErrors, //Clears specific errors or all errors from the form
  } = useForm<CategoryForm>({
    //sets up the form
    resolver: zodResolver(categorySchema), //tells React Hook Form to use your Zod schema
    defaultValues: { name: COMMON_CATEGORIES[0] },
  });

  // Fetch categories
  useEffect(() => {
    if (!selectedMerchant) return;
    getCategoriesByMerchant(selectedMerchant._id).then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, [selectedMerchant,refreshKey]);

  if (!selectedMerchant) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/admin";
    }
    return null;
  }

  function resetErrorHack() {
    //this is a hack to reset errors without submitting the form
    //it marks all fields as touched and updates errors, even if you don't actually submit.
    //React Hook Form sometimes fails to sync validation/touched state for fields that are conditionally rendered (like your "Other" input).
    //This hack ensures the form state is always correct, no matter how the user interacts.
  }

  // Handle create or update
  async function onFormSubmit(data: CategoryForm) {
    try {
      let result;
      if (editCategory) {
        result = await updateCategory(editCategory._id, { name: data.name });
      } else {
        result = await createCategory({
          name: data.name,
          merchantId: selectedMerchant._id,
        });
      }
      if (result.success) {
        toast.success(editCategory ? "Category updated!" : "Category created!");
        reset({ name: COMMON_CATEGORIES[0] });
        setDropdown(COMMON_CATEGORIES[0]);
        setEditCategory(null);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(result.error || "Failed to save category.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  // Handle edit
  function handleEdit(cat: any) {
    setEditCategory(cat);
    if (COMMON_CATEGORIES.includes(cat.name)) {
      setDropdown(cat.name);
      reset({ name: cat.name });
    } else {
      setDropdown("Other");
      reset({ name: cat.name });
      handleSubmit(resetErrorHack)(); //trick to make error state updated, else no validation.
    }
  }

  // Handle delete
  async function handleDelete() {
    if (!editCategory) return;
    try {
      const result = await deleteCategory(editCategory._id);
      if (result.success) {
        toast.success("Category deleted!");
        reset({ name: COMMON_CATEGORIES[0] });
        setDropdown(COMMON_CATEGORIES[0]);
        setEditCategory(null);
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(result.error || "Failed to delete category.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  // console.log("errors------------------>>>", errors.name);
  // console.log("name value-------------->>>>", watch("name"));
  // console.log("dropdown value-------------->>>>", dropdown);

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">
      {selectedMerchant && (
        <div className="mb-2 text-sm font-semibold text-blue-700">
          Merchant: {selectedMerchant.name}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-black">
        {editCategory ? "Edit Category" : "Create New Category"}
      </h1>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="categorySelect">
            Category Name
          </label>
          <select
            id="categorySelect"
            className="w-full border rounded px-3 py-2 text-black mb-2"
            value={dropdown}
            onChange={(e) => {
              setDropdown(e.target.value);
              if (e.target.value !== "Other") {
                setValue("name", e.target.value, { shouldValidate: true });
              } else {
                setValue("name", "", { shouldValidate: true });
                //below trick react-hook-form to triggers a full validation cycle
                //marking all fields as touched and updating errors, even if you don't actually submit.
                //handleSubmit(onFormSubmit)(); //trick
                handleSubmit(resetErrorHack)();
              }
            }}
            disabled={isSubmitting}
          >
            {COMMON_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {dropdown === "Other" && (
            <input
              type="text"
              placeholder="Enter custom category"
              className="w-full border rounded px-3 py-2 text-black mt-2"
              {...register("name")} //connects this input to React Hook Form
              disabled={isSubmitting}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  setValue("name", capitalizeFirst(value), {
                    shouldValidate: true,
                  });
                }
              }}
            />
          )}
          {errors.name && (
            <div className="text-red-600 text-sm">{errors.name.message}</div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
            disabled={
              isSubmitting ||
              (dropdown === "Other" &&
                !Boolean(watch("name") && watch("name").trim())) //mean name is empty
            }
          >
            {isSubmitting
              ? editCategory
                ? "Updating..."
                : "Creating..."
              : editCategory
              ? "Update Category"
              : "Create Category"}
          </button>
          {editCategory && (
            <>
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
                onClick={() => {
                  setEditCategory(null);
                  reset({ name: COMMON_CATEGORIES[0] });
                  setDropdown(COMMON_CATEGORIES[0]);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
      <hr className="my-8" />
      <h2 className="text-lg font-semibold mb-2 text-black">
        Existing Categories
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            className={`px-4 py-2 rounded border cursor-pointer ${
              editCategory && editCategory._id === cat._id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-blue-100"
            }`}
            onClick={() => handleEdit(cat)}
          >
            {cat.name}
          </button>
        ))}
        {categories.length === 0 && (
          <div className="text-gray-500">No categories found.</div>
        )}
      </div>
    </div>
  );
}

//below is using react-state and not react-hook-form
// 'use client'

// import { useMerchant } from '@/contexts/MerchantContext';
// import { useState, useEffect } from 'react';
// import { createCategory, getCategoriesByMerchant, updateCategory, deleteCategory } from '@/lib/actions/category';

// const COMMON_CATEGORIES = [
//   "Appetizers", "Main Course", "Drinks", "Dessert", "Snacks",
//   "Salad", "Soup", "Breakfast", "Lunch", "Dinner", "Other"
// ];

// export default function CreateCategoryPage() {
//   const { selectedMerchant } = useMerchant();
//   const [selected, setSelected] = useState(COMMON_CATEGORIES[0]);
//   const [custom, setCustom] = useState(''); //for other category
//   const [loading, setLoading] = useState(false);
//   const [successMsg, setSuccessMsg] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');
//   const [categories, setCategories] = useState<any[]>([]);
//   const [editCategory, setEditCategory] = useState<any>(null);

//   // Fetch categories
//   useEffect(() => {
//     if (!selectedMerchant) return;
//     getCategoriesByMerchant(selectedMerchant._id).then(res => {
//       if (res.success) setCategories(res.categories);
//     });
//   }, [selectedMerchant, successMsg]);

//   if (!selectedMerchant) {
//     return (
//       <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow text-center">
//         <h2 className="text-xl font-bold mb-2">Please select a restaurant first</h2>
//         <p className="text-gray-600">You need to select a merchant before creating a category.</p>
//       </div>
//     );
//   }

//   // Handle create or update
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setSuccessMsg('');
//     setErrorMsg('');
//     const name = selected === "Other" ? custom : selected;
//     try {
//       let result;
//       if (editCategory) {
//         result = await updateCategory(editCategory._id, { name });
//       } else {
//         result = await createCategory({ name, merchantId: selectedMerchant._id });
//       }
//       if (result.success) {
//         setSuccessMsg(editCategory ? 'Category updated!' : 'Category created!');
//         setCustom('');
//         setSelected(COMMON_CATEGORIES[0]);
//         setEditCategory(null);
//       } else {
//         setErrorMsg(result.error || 'Failed to save category.');
//       }
//     } catch (err) {
//       setErrorMsg('Something went wrong.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Handle edit
//   function handleEdit(cat: any) {
//     setEditCategory(cat);
//     setSelected(COMMON_CATEGORIES.includes(cat.name) ? cat.name : "Other");
//     setCustom(COMMON_CATEGORIES.includes(cat.name) ? '' : cat.name);
//     setSuccessMsg('');
//     setErrorMsg('');
//   }

//   // Handle delete
//   async function handleDelete() {
//     if (!editCategory) return;
//     setLoading(true);
//     setSuccessMsg('');
//     setErrorMsg('');
//     try {
//       const result = await deleteCategory(editCategory._id);
//       if (result.success) {
//         setSuccessMsg('Category deleted!');
//         setCustom('');
//         setSelected(COMMON_CATEGORIES[0]);
//         setEditCategory(null);
//       } else {
//         setErrorMsg(result.error || 'Failed to delete category.');
//       }
//     } catch (err) {
//       setErrorMsg('Something went wrong.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">
//       <h1 className="text-2xl font-bold mb-4 text-black">
//         {editCategory ? 'Edit Category' : 'Create New Category'}
//       </h1>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-1" htmlFor="categorySelect">
//             Category Name
//           </label>
//           <select
//             id="categorySelect"
//             className="w-full border rounded px-3 py-2 text-black mb-2"
//             value={selected}
//             onChange={e => setSelected(e.target.value)}
//             disabled={loading}
//           >
//             {COMMON_CATEGORIES.map(cat => (
//               <option key={cat} value={cat}>{cat}</option>
//             ))}
//           </select>
//           {selected === "Other" && (
//             <input
//               type="text"
//               placeholder="Enter custom category"
//               className="w-full border rounded px-3 py-2 text-black mt-2"
//               value={custom}
//               onChange={e => setCustom(e.target.value)}
//               required
//               disabled={loading}
//             />
//           )}
//         </div>
//         {successMsg && (
//           <div className="mb-4 text-green-600">{successMsg}</div>
//         )}
//         {errorMsg && (
//           <div className="mb-4 text-red-600">{errorMsg}</div>
//         )}
//         <div className="flex gap-2">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
//             disabled={loading || (selected === "Other" && !custom.trim())}
//           >
//             {loading ? (editCategory ? 'Updating...' : 'Creating...') : (editCategory ? 'Update Category' : 'Create Category')}
//           </button>
//           {editCategory && (
//             <button
//               type="button"
//               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
//               onClick={handleDelete}
//               disabled={loading}
//             >
//               Delete
//             </button>
//           )}
//           {editCategory && (
//             <button
//               type="button"
//               className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
//               onClick={() => {
//                 setEditCategory(null);
//                 setCustom('');
//                 setSelected(COMMON_CATEGORIES[0]);
//                 setSuccessMsg('');
//                 setErrorMsg('');
//               }}
//               disabled={loading}
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>
//       <hr className="my-8" />
//       <h2 className="text-lg font-semibold mb-2 text-black">Existing Categories</h2>
//       <div className="flex flex-wrap gap-2">
//         {categories.map(cat => (
//           <button
//             key={cat._id}
//             type="button"
//             className={`px-4 py-2 rounded border cursor-pointer ${editCategory && editCategory._id === cat._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-blue-100'}`}
//             onClick={() => handleEdit(cat)}
//           >
//             {cat.name}
//           </button>
//         ))}
//         {categories.length === 0 && (
//           <div className="text-gray-500">No categories found.</div>
//         )}
//       </div>
//     </div>
//   );
// }
