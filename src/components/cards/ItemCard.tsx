import Image from "next/image";

interface ItemCardProps {
  title: string;
  price: string | number;
  description: string;
  images?: { url: string }[];
  onClick?: () => void;
}

export default function ItemCard({
  title,
  price,
  description,
  images = [],
  onClick,
}: ItemCardProps) {
  // Use Cloudinary thumbnail transformation if image exists
  const thumbnailUrl =
    images.length > 0
      ? images[0].url.replace(
          "/upload/",
          "/upload/w_150,h_150,c_fill,q_auto/" // Smaller thumbnail
        )
      : "/food_placeholer.jpg";

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden shadow-lg bg-white transform transition duration-300 hover:scale-102 cursor-pointer p-4 gap-4"
      style={{ minHeight: "100px" }} // Fixed height for consistency
      onClick={onClick}
    >
      {/* Left side - Info */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="font-bold text-lg text-gray-800 mb-1">{title}</div>
        <div className="text-xl font-semibold text-blue-600">RM{price}</div>
      </div>

      <div className="flex-shrink-0">
        <Image
          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
          src={thumbnailUrl}
          alt={title}
          width={80}
          height={80}
        />
      </div>
    </div>
  );
}
