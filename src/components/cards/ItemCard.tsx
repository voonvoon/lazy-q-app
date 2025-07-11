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
          "/upload/w_250,h_250,c_fill,q_auto/"
        )
      : "/placeholder.png"; // fallback image

  return (
    <div
      className="max-w-xs rounded-lg overflow-hidden shadow-lg bg-white transform transition duration-500 hover:scale-105 cursor-pointer "
      style={{ width: "30vw", height: "33vh" }}
      onClick={onClick}
    >
      {images.length > 0 && (
        <Image
          className="w-full h-40 object-cover object-center rounded-md border"
          src={thumbnailUrl}
          alt={title}
          width={250}
          height={250}
        />
      )}
      <div className="flex flex-col items-center px-3 py-1 text-gray-800">
        <div className="text-sm mt-2 sm:text-lg font-thin">RM{price}</div>
        <div className="font-bold text-sm sm:text-lg text-center sm:text-md">{title}</div>
        <p className="text-gray-700 text-sm custom-hidden pb-4">
          {description.length > 100
            ? `${description.substring(0, 50)}...`
            : description}
        </p>
              <div className="mt-8" />
      </div>
    </div>
  );
}