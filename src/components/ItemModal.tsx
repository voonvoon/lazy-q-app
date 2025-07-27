import { useState, useEffect } from "react";
import Image from "next/image";
import React from "react";
import { MdCancel } from "react-icons/md";

interface ItemModalProps {
  item: {
    _id: string;
    title: string;
    price: string | number;
    description: string;
    category: string;
    subcategory: string;
    image: Array<{ url: string }>;
    // Add any other properties your item has
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemModal({ item, isOpen, onClose }: ItemModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log("ItemModal item------------------------------------------>>>", item);

  // Reset image index when modal opens with new item
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?._id]);

  if (!isOpen || !item) return null;

  const images = item.image || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const getCurrentImageUrl = () => {
    if (images.length === 0) return "/food_placeholer.jpg";

    return images[currentImageIndex].url.replace(
      "/upload/",
      "/upload/w_600,h_400,c_fill,q_auto/" // Higher quality for modal
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 cursor-pointer"
        >
          <MdCancel className="w-9 h-9 text-gray-900" />
        </button>

        {/* Image Section */}
        <div className="relative">
          <div className="relative h-80 bg-gray-100 rounded-t-2xl overflow-hidden">
            <Image
              src={getCurrentImageUrl()}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Image Navigation - Only show if multiple images */}
            {hasMultipleImages && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                        index === currentImageIndex
                          ? "bg-black"
                          : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title and Price */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex-1 pr-4">
              {item.title}
            </h2>
            <div className="text-2xl font-bold text-blue-600 flex-shrink-0">
              RM{item.price}
            </div>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {item.category}
            </span>
            {item.subcategory && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {item.subcategory}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
            >
              Close
            </button>
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium cursor-pointer">
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
