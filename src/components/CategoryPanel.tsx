

export default function CategoryPanel() {
  // Example static categories and subcategories
  const categories = [
    {
      name: "Food",
      subcategories: ["Burger", "Pizza", "Salad"],
    },
    {
      name: "Drinks",
      subcategories: ["Coffee", "Tea", "Juice"],
    },
    {
      name: "Dessert",
      subcategories: ["Cake", "Ice Cream"],
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-full">
        <h2 className="text-lg font-bold mb-4 text-black">Menu Categories</h2>
        <ul className="space-y-2">
            {categories.map((cat) => (
                <li key={cat.name}>
                    <div className="font-semibold">{cat.name}</div>
                    <ul className="ml-4 list-disc text-sm text-gray-700">
                        {cat.subcategories.map((sub) => (
                            <li key={sub}>{sub}</li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>
    </div>
  );
}