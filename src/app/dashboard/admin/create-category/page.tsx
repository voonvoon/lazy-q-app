"use client";

import { useMerchant } from "@/contexts/MerchantContext";
import { useState, useEffect, useRef } from "react";
import {
  createCategory,
  getCategoriesByMerchant,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category";
import { saveCatOrder } from "@/lib/actions/merchants";
import { useForm } from "react-hook-form"; //helps you manage form state, validation, and submission
import { z } from "zod"; //TypeScript-first schema validation library.
import { zodResolver } from "@hookform/resolvers/zod"; //connects React Hook Form and Zod
import { capitalizeFirst } from "@/lib/utils/capitalize";
import toast from "react-hot-toast";
import { MdDragIndicator } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";

//drag and drop STEP1
import {
  DndContext, //main provider for drag-and-drop logic
  closestCenter, //finds the closest drop target
  useSensor, //Hooks to set up drag sensors
  useSensors, //use more than one drag sensor at once.
  PointerSensor, //Sensor for mouse and touch events
} from "@dnd-kit/core"; //general drag-and-drop.
import {
  SortableContext, //Context for sortable lists (enables reordering).
  arrayMove, //Helper to move items in an array after drag.
  verticalListSortingStrategy, //Strategy for vertical list sorting.
  useSortable, //Hook to make an item draggable and sortable.
} from "@dnd-kit/sortable"; //for sortable/reorderable lists.
import { CSS } from "@dnd-kit/utilities";

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

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  console.log("selectedMerchant", selectedMerchant);

  //drag and drop STEP2
  //Initialize items for drag-and-drop
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    if (
      selectedMerchant &&
      Array.isArray(selectedMerchant.catOrder) &&
      selectedMerchant.catOrder.length > 0
    ) {
      // Order items by catOrder, add any missing category IDs at the end(for safety)
      const ordered = [
        ...selectedMerchant.catOrder.filter((id: string) =>
          categories.some((cat) => cat._id === id)
        ),
        ...categories
          .map((cat) => cat._id)
          .filter((id) => !selectedMerchant.catOrder.includes(id)),
      ];
      setItems(ordered);
    } else {
      setItems(categories.map((cat) => cat._id));
    }
  }, [categories, selectedMerchant]);

  //drag and drop STEP2 END

  // console.log(
  //   "items----------------------------------------------------->>",
  //   items
  // );
  // console.log(
  //   "categories----------------------------------------------------->>",
  //   categories
  // );

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
  }, [selectedMerchant, refreshKey]);

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
    console.log("Editing category receive --------------------------->>:", cat);
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

  // drag and drop setup STEP3
  function SortableCategory({ cat }: { cat: { _id: string; name: string } }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: cat._id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div
        ref={setNodeRef} //Connects the div to dnd-kit for drag-and-drop.
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        {...attributes} //Adds drag-and-drop attributes.
        className={`flex items-center gap-3 w-full bg-white rounded-lg shadow-sm px-4 py-2 border ${
          editCategory && editCategory._id === cat._id
            ? "border-blue-600 bg-blue-50"
            : "border-gray-200"
        }`}
      >
        {/* Drag handle button with icon */}
        <button
          type="button"
          {...listeners} //Makes this button the drag handle.
          tabIndex={-1} //Prevents this button from being focusable.
          className="flex items-center gap-2 cursor-grab focus:outline-none bg-transparent border-none p-0"
        >
          <MdDragIndicator className="text-2xl text-gray-400" />
        </button>
        {/* Category name, always same width */}
        <span className="flex-1 truncate font-medium text-gray-800">
          {cat.name}
        </span>
        {/* Edit button, modern style */}
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
          onClick={() => handleEdit(cat)}
        >
          <FiEdit2 className="text-base" />
          Edit
        </button>
      </div>
    );
  }

  function triggerAutoSaveCatOrder(newOrder: string[]) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      if (!selectedMerchant) return;
      const result = await saveCatOrder(selectedMerchant._id, newOrder);
      if (result.success) {
        toast.success("Category order saved!");
      } else {
        toast.error(result.error || "Failed to save category order.");
      }
    }, 500); // 1.5 seconds debounce
  }

  // Call this whenever items (order) changes
  useEffect(() => {
    if (items.length > 0) {
      triggerAutoSaveCatOrder(items);
    }
  }, [items]); // Save on reorder or category change

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
      <div className="text-gray-800 text-sm mb-2">
        Drag categories to reorder to your desired order. Click "Edit" to
        modify.
      </div>
      <div className="flex flex-col gap-2">
        {/* Drag and drop STEP4 */}
        <DndContext
          sensors={useSensors(useSensor(PointerSensor))}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (over && active.id !== over.id) {
              const oldIndex = items.indexOf(String(active.id));
              const newIndex = items.indexOf(String(over.id));
              const newItems = arrayMove(items, oldIndex, newIndex);
              setItems(newItems);
              triggerAutoSaveCatOrder(newItems);
            }
          }}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((id) => {
                const cat = categories.find((cat) => cat._id === id);
                if (!cat) return null; // Ensure cat exists
                return <SortableCategory key={id} cat={cat} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
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
