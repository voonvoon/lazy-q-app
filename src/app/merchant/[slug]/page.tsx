"use client";

import { useRef, useEffect, useState } from "react";
import { useItems } from "@/contexts/ItemsContext";
import ItemCard from "@/components/cards/ItemCard";
import React from "react";
import ItemModal from "@/components/ItemModal";
import { useCart } from "@/contexts/CartContext";

export default function MerchantPage() {
  const { setMerchantData } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const {
    items,
    selectedCategory,
    selectedSubcategory,
    setScrollCategory,
    setScrollSubcategory,
    merchantData,
  } = useItems();



  //update merchant data in CartContext/ localStorage so that it can be used in Cart
  // ✅ Clear cart data if switching merchants
  useEffect(() => {
    if (merchantData) {
      // ✅ Get current cart data to check for merchant switching
      const savedCartData = localStorage.getItem("lazy-q-cart");

      if (savedCartData) {
        try {
          const parsedData = JSON.parse(savedCartData);

          // ✅ Check if switching to a different merchant
          if (
            parsedData.merchant &&
            parsedData.merchant._id !== merchantData._id
          ) {
            //console.log("🔄 Merchant switch detected:", parsedData.merchant.name, "→", merchantData.name);

            // ✅ Clear all cart data when switching merchants
            localStorage.removeItem("lazy-q-cart");
            console.log("🗑️ Cart cleared for merchant switch");
          }
        } catch (error) {
          console.error("Error parsing cart data:", error);
          // Clear corrupted data
          localStorage.removeItem("lazy-q-cart");
        }
      }

      // ✅ Set new merchant data
      setMerchantData({
        _id: merchantData._id,
        name: merchantData.name,
        tax: merchantData.tax,
        allowedDelivery: merchantData.allowedDelivery,
        deliveryFee: merchantData.deliveryFee,
        freeDeliveryThreshold: merchantData.freeDeliveryThreshold,
        allowPreorder: merchantData.allowPreorder, 
        firstOrderTime: merchantData.firstOrderTime, 
        lastOrderTime: merchantData.lastOrderTime,
        logoUrl: merchantData.logoUrl,
        slug: merchantData.slug,
      });
    }
  }, [merchantData, setMerchantData]);

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
    const el = categoryRefs.current[selectedCategory];
    if (el) {
      const yOffset = -70; // Adjust this value to match your navbar height
      //getBoundingClientRect().top tells where the element is in the viewport.
      //window.pageYOffset tells how far you’ve scrolled.
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }
}, [selectedCategory]);

  const subcategoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to selected category when it changes(Subcategory)
  React.useEffect(() => {
  if (selectedCategory && selectedSubcategory) {
    const key = `${selectedCategory}-${selectedSubcategory}`;
    const el = subcategoryRefs.current[key];
    if (el) {
      const yOffset = -70; // Adjust this value to match your navbar height
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
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
              <h2 className="text-base sm:text-xl font-extrabold text-gray-700 mb-4 text-center rounded-lg py-1 px-3 bg-gray-50 shadow-sm  drop-shadow-amber-100 tracking-wide font-serif bg-gradient-to-r from-gray-300 via-white to-gray-300">
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
                  <h3 className="text-sm sm:text-lg font-semibold italic text-gray-600 mb-2 text-center">
                    {subcat}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1 justify-center w-full">
                    {items.map((item) => (
                      <ItemCard
                        onClick={() =>
                          openModal({
                            ...item,
                            category: item.category?.name || "Others", // ✅ Extract string from object
                            subcategory:
                              item.subCategories?.[0]?.name || "Others", // ✅ Extract string from array
                          })
                        }
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
      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
