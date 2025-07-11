'use client';

import { useItems } from "@/contexts/ItemsContext";
import ItemCard from "@/components/cards/ItemCard";

export default function MerchantPage() {
  const { items } = useItems();

  console.log("Items from context in MerchantPage-------------------------------------------------->", items);

  return (
    <div className="flex flex-col items-center h-full w-full">
      <h1 className="text-2xl font-bold mb-4 text-black">Merchant Menu</h1>
      <p className="text-gray-600 mb-4">
        Please select a category to view items.
      </p>
      <div className="flex flex-wrap gap-6 justify-center w-full ">
        {items.length === 0 ? (
          <div className="text-gray-500">No items found.</div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item._id}
              title={item.title}
              price={item.price}
              description={item.description}
              images={item.image[0]?.url ? [item.image[0]] : []}
            />
          ))
        )}
      </div>
    </div>
  );
}
