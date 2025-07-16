"use client";

import { useItems } from "@/contexts/ItemsContext";

const categoryOrder = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Appetizers",
  "Salad",
  "Soup",
  "Main Course",
  "Snacks",
  "Drinks",
  "Dessert",
  "Other",
];

export default function CategoryPanel() {
  const {
    items,
    selectedCategory,
    setSelectedCategory,
    setSelectedSubcategory,
    scrollCategory,
    setScrollCategory,
    scrollSubcategory,
    setScrollSubcategory,
  } = useItems();

  // Extract unique categories from items
  //filter(Boolean) removes empty or undefined category names.
  //new Set(...) keeps only unique category names (no duplicates).
  const categories = Array.from(
    new Set(items.map((item) => item.category?.name).filter(Boolean))
  );

  // Sort categories by your desired order
  const sortedCategories = categoryOrder.filter((cat) =>
    categories.includes(cat)
  );

  // Extract unique subcategories for selected category
  //flatmap is used to flatten the array of arrays into a single array.`
  const activeCategory = scrollCategory || selectedCategory;

  const subcategories = activeCategory
    ? Array.from(
        new Set(
          items
            .filter((item) => item.category?.name === activeCategory)
            .flatMap(
              (item) =>
                item.subCategories?.map((sub: { name: any }) => sub.name) || []
            )
        )
      )
    : [];

  return (
    <div className="flex flex-col items-center min-h-full">
      <h2 className="text-lg font-bold mb-20 text-black">Menu Categories</h2>
      <ul className="space-y-6 text-center">
        {sortedCategories.map((cat) => (
          <li key={cat}>
            <button
              className={`text-lg font-semibold italic cursor-pointer ${
                activeCategory === cat ? "text-blue-600" : "text-gray-800 "
              }`}
              onClick={() => {
                setSelectedCategory(null); // Clear first to reset state
                setSelectedSubcategory(null); // Clear subcategory first
                setTimeout(() => {
                  setSelectedCategory(cat); // Set again right after
                }, 0);

                setTimeout(() => {
                  setScrollCategory(null);
                }, 800);
              }}
            >
              {cat}
            </button>
            {activeCategory === cat && (
              <ul className="list-disc text-sm text-gray-700 font-thin italic">
                {subcategories.map((sub) => (
                  <li key={sub} className="list-none">
                    <button
                      className={`px-3 py-1 rounded transition-colors duration-200 cursor-pointer font-medium ${
                        scrollSubcategory === sub
                          ? "bg-blue-100 text-blue-600 shadow"
                          : "bg-transparent text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedCategory(cat); // Always set parent category
                        setSelectedSubcategory(sub);
                        setTimeout(() => {
                          setScrollSubcategory(sub);
                        }, 800);
                      }}
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
