"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoFastFoodOutline } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import { signOut, useSession } from "next-auth/react"
import { toast } from "react-hot-toast"


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

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

    // Only add listener when menu is open
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-gray-900" ref={menuRef}>
      <div className="mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="flex flex-col items-center justify-center text-center mt-2"
              >
                <IoFastFoodOutline size={32} color="white" />
                <span className="mb-1 text-lg font-bold tracking-wide text-white drop-shadow-lg font-serif">
                  Lazy<span className="text-red-400"> Q</span>
                </span>
                <div className="flex items-center justify-center"> </div>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 flex items-center ">
            <button
              className="flex items-center justify-center rounded-md p-1 text-gray-400 hover:text-white cursor-pointer"
              onClick={toggleMenu}
            >
              <IoMenu size={30} />
            </button>
          </div>

        <div className="absolute right-10 flex items-center space-x-3">
            {session ? (
              <>
                <span className="text-sm text-gray-300">
                  Hello, {session.user?.name}
                </span>
                <button
                  onClick={async () => {
                  const promise = signOut({ callbackUrl: '/' });
                  // Show toast before redirect
                  toast.success('Signed out successfully');
                  await promise;
                  }}
                  className="rounded-md px-1 py-2 text-sm text-gray-300 hover:text-white cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="rounded-md px-1 py-2 text-sm text-gray-300 hover:text-white"
              >
                Login
              </Link>
            )}
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
        <div className="px-2 pb-1 pt-2 text-center  transition-all duration-300 ease-in-out">
          <Link
            href="/cart"
            className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cart
          </Link>
          <Link
            href="/menu"
            className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:text-white"
          >
            Menu
          </Link>
          <Link
            href="/dashboard/admin"
            className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
