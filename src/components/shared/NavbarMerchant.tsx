"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoMenu } from "react-icons/io5";

interface NavbarMerchantProps {
  logoUrl?: string;
  name: string;
  slug?: string;
}

const NavbarMerchant = ({ logoUrl, name, slug }: NavbarMerchantProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav
      className="bg-gray-100 sticky top-0 z-50 shadow-lg"
      ref={menuRef}
    >
      <div className="mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="flex items-center justify-center">
              <Link
                href={`/merchant/${slug}`}
                className="flex flex-col items-center justify-center text-center mt-1"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name || "Merchant Logo"}
                    width={30}
                    height={30}
                    className="bg-white rounded mb-1 border border-gray-300"
                  />
                ) : null}
                <span
                  className={`mb-1 font-bold tracking-wide drop-shadow-lg font-serif ${
                    logoUrl
                      ? "text-xs text-gray-800"
                      : "text-lg text-gray-800 border border-gray-400 p-2 rounded-md"
                  }`}
                >
                  {name}
                </span>
                <div className="flex items-center justify-center"> </div>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 flex items-center ">
            <button
              className="flex items-center justify-center rounded-md p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
              onClick={toggleMenu}
            >
              <IoMenu size={30} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-1000 ease-in-out ${
          isMenuOpen
            ? "max-h-screen opacity-100 visible"
            : "max-h-0 opacity-0 invisible"
        }`}
      >
        <div className="px-2 pb-1 pt-2 text-center transition-all duration-300 ease-in-out space-y-1">
          <Link
            href="/checkout"
            className="block rounded-md px-3 py-2 text-base  tracking-wide text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
          >
            My Cart
          </Link>
          <Link
            href="/menu"
            className="block rounded-md px-3 py-2 text-base  tracking-wide text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
          >
            About Us
          </Link>
          <Link
            href="/menu"
            className="block rounded-md px-3 py-2 text-base  tracking-wide text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
          >
            Contact
          </Link>
          <Link
            href="/dashboard/admin"
            className="block rounded-md px-3 py-2 text-base tracking-wide text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
          >
            Opening Hours
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavbarMerchant;
