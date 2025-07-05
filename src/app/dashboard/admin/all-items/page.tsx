"use client";

import { useState, useEffect, useRef } from "react";
import { useMerchant } from "@/contexts/MerchantContext";
import { getItemsByMerchant, deleteItem } from "@/lib/actions/item";
import { getCategoriesByMerchant } from "@/lib/actions/category";
import Link from "next/link";
import type { Item, Category } from "@/lib/type";

export default function AllItemsPage() {
  const { selectedMerchant } = useMerchant();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  // Fetch categories on mount
  useEffect(() => {
    if (!selectedMerchant?._id) return;
    getCategoriesByMerchant(selectedMerchant._id).then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, [selectedMerchant]);

  // Fetch items when filters change
  useEffect(() => {
    if (!selectedMerchant?._id) return;
    setLoading(true);
    getItemsByMerchant({
      merchantId: selectedMerchant._id,
      page,
      categoryId: category || undefined,
      search: debouncedSearch || undefined,
    }).then((res) => {
      if (res.success) {
        setItems(res.items);
        setTotalPages(res.totalPages);
      }
      setLoading(false);
    });
  }, [selectedMerchant, page, category, debouncedSearch]);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  // Pagination controls
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">All Items</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Category Filter */}
          <select
            className="border-1 rounded px-3 py-2 text-black cursor-pointer"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {/* Search Box */}
          <input
            type="text"
            className="border-1 rounded px-3 py-2 flex-1 text-black"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Item List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items found.</div>
        ) : (
          <table className="w-full rounded mb-4 text-black border-separate border-spacing-0 s">
            <thead>
              <tr className="bg-gray-200 text-left border-gray-200">
                <th className="p-2">Image</th>
                <th className="p-2">Title</th>
                <th className="p-2">Price</th>
                <th className="p-2">Category</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className=" border-gray-100 odd:bg-gray-100">
                  <td className="p-2">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </td>
                  <td className="p-2">{item.title}</td>
                  <td className="p-2">RM{item.price.toFixed(2)}</td>
                  <td className="p-2">
                    {categories.find((cat) => cat._id === item.category)
                      ?.name || "-"}
                  </td>
                  <td className="p-2">
                    <div className="flex justify-end items-center gap-2">
                    <Link
                      href={`/dashboard/admin/create-item/${item._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:underline ml-1 cursor-pointer"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this item? This action cannot be undone."
                          )
                        ) {
                          const res = await deleteItem(item._id);
                          if (res.success) {
                            setItems((prev) =>
                              prev.filter((i) => i._id !== item._id)
                            );
                          } else {
                            alert(res.error || "Failed to delete item.");
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-3 py-1 rounded disabled:opacity-50 text-black cursor-pointer"
          >
            Prev
          </button>
          <span className="text-black">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-3 py-1 rounded disabled:opacity-50 text-black cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
