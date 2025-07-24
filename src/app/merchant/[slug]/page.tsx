"use client";
import { useRef, useEffect } from "react";
import { useItems } from "@/contexts/ItemsContext";
import ItemCard from "@/components/cards/ItemCard";
import React from "react";

export default function MerchantPage() {
  const {
    items,
    selectedCategory,
    selectedSubcategory,
    setScrollCategory,
    setScrollSubcategory,
    merchantData,
  } = useItems();

  // Group items by category and subcategory
  //Record<K, V> = TS for an object with keys of type K and values of type V.
  const categorized: Record<string, Record<string, typeof items>> = {};

  items.forEach((item) => {
    const cat = item.category?.name || "Others";
    const subcat = item.subCategories?.length
      ? item.subCategories[0]?.name || "Others"
      : "Others";
    if (!categorized[cat]) categorized[cat] = {};
    if (!categorized[cat][subcat]) categorized[cat][subcat] = [];
    categorized[cat][subcat].push(item);
  });

  // Example structure of categorized:
  //   {
  //   "Drinks": {
  //     "Juice": [item1, item2],
  //     "Coffee": [item3]
  //   },
  //   "Main Course": {
  //     "Others": [item4, item5]
  //   }
  // }

  const categoryOrder = merchantData?.catOrder || [];

  const categoriesFromItems = Array.from(
    new Set(items.map((item) => item.category?.name).filter(Boolean))
  );

  const sortedCategories = [
    ...categoryOrder.filter((cat: any) => categorized[cat]),
    ...categoriesFromItems.filter(
      (cat) => !categoryOrder.includes(cat) && categorized[cat]
    ),
  ];

  // Create refs for each category
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to selected category when it changes(Category)
  React.useEffect(() => {
    if (selectedCategory && categoryRefs.current[selectedCategory]) {
      categoryRefs.current[selectedCategory]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedCategory]);

  const subcategoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to selected category when it changes(Subcategory)
  React.useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const key = `${selectedCategory}-${selectedSubcategory}`;
      if (subcategoryRefs.current[key]) {
        subcategoryRefs.current[key]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [selectedCategory, selectedSubcategory]);

  //Higlight in CategoryPanel when reaching a new category or subcategory
  // Track which category/subcategory is in view
  useEffect(() => {
    const handleScroll = () => {
      let foundCat = null;
      let foundSubcat = null;
      let foundCatFromSubcat = null; // Track category found via subcategory

      // Check all category sections
      sortedCategories.forEach((cat) => {
        const catEl = categoryRefs.current[cat];
        if (catEl) {
          const rect = catEl.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight * 0.2) {
            foundCat = cat;
          }
        }

        // Check subcategories inside this category
        Object.keys(categorized[cat] || {}).forEach((subcat) => {
          const subcatEl = subcategoryRefs.current[`${cat}-${subcat}`];
          if (subcatEl) {
            const rect = subcatEl.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight * 0.2) {
              foundSubcat = subcat;
              foundCatFromSubcat = cat; // Remember which category this subcat belongs to
            }
          }
        });
      });

      // Update category - prioritize direct category hit, fallback to subcategory's parent
      const categoryToHighlight = foundCat || foundCatFromSubcat;
      if (categoryToHighlight) {
        setScrollCategory(categoryToHighlight);
      }

      // Update subcategory
      if (foundSubcat) {
        setScrollSubcategory(foundSubcat);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); 

  return (
    <div className="flex flex-col items-center h-full w-full mb-96">
      <h1 className="text-2xl font-extrabold mb-6 text-center text-blue-600 drop-shadow-lg tracking-wide font-serif bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-xl py-2 px-4 shadow-xl">
       Welcome to {merchantData?.name || "Merchant Menu"}
      </h1>
      <div className="w-full">
        {/* Object.entries(categorized): turns obj into [category, subcategories] pair*/}
        {sortedCategories
          //.filter((cat) => categorized[cat]) // Only show categories that exist
          .map((cat) => (
            <div
              key={cat}
              ref={(el) => {
                categoryRefs.current[cat] = el;
              }}
              className="mb-8"
            >
              <h2 className="text-xl font-extrabold text-gray-700 mb-2 text-center border-2 border-gray-300 rounded-lg py-2 px-4 bg-gray-50 shadow-sm">
                {cat}
              </h2>
              {/* Object.entries(categorized[cat]) turns it into an array of pairs */}
              {Object.entries(categorized[cat]).map(([subcat, items]) => (
                <div
                  key={subcat}
                  ref={(el) => {
                    // Use a unique key for each subcat, e.g. `${cat}-${subcat}`
                    subcategoryRefs.current[`${cat}-${subcat}`] = el;
                  }}
                  className="mb-4"
                >
                  <h3 className="text-lg italic text-gray-600 mb-2 text-center">
                    {subcat}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center w-full">
                    {items.map((item) => (
                      <ItemCard
                        key={item._id}
                        title={item.title}
                        price={item.price}
                        description={item.description}
                        images={item.image[0]?.url ? [item.image[0]] : []}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
