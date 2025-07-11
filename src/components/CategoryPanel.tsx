'use client';

import { useItems } from "@/contexts/ItemsContext";

export default function CategoryPanel() {
  const { items, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory } = useItems();

  // Extract unique categories and subcategories from items
  const categories = Array.from(
    new Set(items.map(item => item.category?.name).filter(Boolean))
  );
  const subcategories = selectedCategory
    ? Array.from(
        new Set(
          items
            .filter(item => item.category?.name === selectedCategory)
            .flatMap(item => item.subCategories?.map((sub: { name: any; }) => sub.name) || [])
        )
      )
    : [];

  return (
    <div className="flex flex-col items-center min-h-full">
      <h2 className="text-lg font-bold mb-4 text-black">Menu Categories</h2>
      <ul className="space-y-6 ">
      {categories.map(cat => (
        <li key={cat}>
        <button
          className={`font-semibold text-gray-800 cursor-pointer ${selectedCategory === cat ? "text-blue-600" : ""}`}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </button>
        {selectedCategory === cat && (
          <ul className="ml-4 list-disc text-sm text-gray-700 ">
          {subcategories.map(sub => (
            <li key={sub} className="list-none">
            <button
              className={`px-3 py-1 rounded transition-colors duration-200 cursor-pointer font-medium ${
              selectedSubcategory === sub
              ? "bg-blue-100 text-blue-600 shadow"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedSubcategory(sub)}
              style={{ outline: "none", border: "none" }}
            >
              {sub}
            </button>
            </li>
          ))}
          </ul>
        )}
        </li>
      ))}
      </ul>
    </div>
  );
}