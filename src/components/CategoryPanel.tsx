"use client";

import { useItems } from "@/contexts/ItemsContext";
import { useState, useEffect } from "react";

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
    merchantData,
  } = useItems();

  const categoryOrder = merchantData?.catOrder || [];

  // Extract unique categories from items
  //filter(Boolean) removes empty or undefined category names.
  //new Set(...) keeps only unique category names (no duplicates).
  const categoriesFromItems = Array.from(
    new Set(items.map((item) => item.category?.name).filter(Boolean))
  );

  // Sort categories by your desired order
  const sortedCategories = [
    ...categoryOrder.filter((cat: any) => categoriesFromItems.includes(cat)),
    ...categoriesFromItems.filter((cat) => !categoryOrder.includes(cat)),
  ];
  //Extract unique subcategories for selected category
  //flatmap is used to flatten the array of arrays into a single array.
  //prioritize scrollCategory if set .so your UI always reflect what the user is seeing or doing right now—scrolling wins over clicking for the highlight!
  // Add state for delayed subcategories to avoid flickering
  const [delayedSubcategories, setDelayedSubcategories] = useState<string[]>(
    []
  );

  const activeCategory = scrollCategory || selectedCategory;

  // Calculate subcategories immediately (but don't use directly in render)
  const immediateSubcategories = activeCategory
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

  // Add useEffect to delay subcategories update
  useEffect(() => {
    // Clear subcategories immediately when activeCategory changes
    setDelayedSubcategories([]);

    // Set new subcategories after a short delay
    // This prevents flickering when switching categories
    // and allows the UI to stabilize before showing subcategories.
    const timer = setTimeout(() => {
      setDelayedSubcategories(immediateSubcategories);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [activeCategory, items]); // Re-run when activeCategory or items change

  // Use delayed subcategories in render
  const subcategories = delayedSubcategories;

  return (
    <div className="flex flex-col items-center min-h-full">
      <h2 className="text-lg font-bold mb-20 text-black">Menu</h2>
      <ul className="space-y-6 text-center">
        {sortedCategories.map((cat) => (
          <li key={cat}>
            <button
              className={`text-lg font-semibold italic cursor-pointer ${
                activeCategory === cat ? "text-blue-600" : "text-gray-800 "
              }`}
              onClick={() => {
                setSelectedCategory(null); //reset ensure no stale state,need fresh state even is the same state for code to work properly
                setSelectedSubcategory(null); //Reset subcategory to ensure no stale state
                setTimeout(() => {
                  setSelectedCategory(cat); // Set again right after we clear stale state and find subcategories
                }, 0);
                setTimeout(() => {
                  setScrollCategory(null);
                  //clear to avoid conflict with selectedCategory
                }, 700); //delay to let setSelectedCategory(cat) done first else have weird behavior
              }}
            >
              {cat}
            </button>
            {activeCategory === cat && (
              <ul className="list-disc  italic">
                {subcategories.map((sub) => (
                  <li key={sub} className="list-none">
                    <button
                      className={`px-3 py-1 rounded transition-colors duration-200 cursor-pointer font-light ${
                        scrollSubcategory === sub
                          ? "bg-blue-100 text-blue-700 shadow"
                          : "bg-transparent text-gray-950 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedCategory(cat); // Always reset parent category avoid stale state lead to weird behavior
                        setSelectedSubcategory(sub); //set subcategory

                        setTimeout(() => {
                          setScrollSubcategory(sub); // sync scrollSubcategory with selectedSubcategory
                        }, 500); //delay to let setSelectedSubcategory(sub) done first else have weird behavior
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
