"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoMenu } from "react-icons/io5";
import { signOut, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
    <nav className="bg-white sticky top-0 z-50 " ref={menuRef}>
      <div className="mx-auto px-4">
        <div className="relative flex h-24 items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="flex flex-col items-center justify-center text-center mt-1"
              >
                <Image
                  src="/food-logo.svg"
                  alt="Next.js Logo"
                  width={35}
                  height={35}
                  className="mb-1"
                />
                <span className="mb-1 text-sm sm:text-base font-bold tracking-wide text-gray-800 drop-shadow-lg font-serif">
                  Lazy<span className="text-red-400"> Q</span>
                </span>
                <div className="flex items-center justify-center"> </div>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 flex items-center ">
            <button
              className="flex items-center justify-center rounded-md p-1 text-gray-700 hover:text-gray-900 cursor-pointer"
              onClick={toggleMenu}
            >
              <IoMenu size={40} />
            </button>
          </div>

          <div className="absolute right-10 flex items-center space-x-3">
            {session ? (
              <>
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user?.name || "Profile"}
                      className="w-8 h-8 rounded-full border-2 border-gray-400"
                    />
                  )}
                  <span className="text-base text-gray-700 hover:text-gray-900 transition-colors">
                    Hello,
                  </span>
                  <Link
                    href={
                      session.user?.role === "super_admin"
                        ? "/dashboard/super-admin"
                        : session.user?.role === "admin"
                        ? "/dashboard/admin"
                        : "/"
                    }
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {session.user?.name}
                  </Link>
                </div>
                <button
                  onClick={async () => {
                    const promise = signOut({ callbackUrl: "/" });
                    toast.success("Signed out successfully");
                    await promise;
                  }}
                  className="rounded-md px-1 py-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="rounded-md px-3 py-2 mr-2 text-base sm:text-lg font-semibold text-[#ecfef6] bg-[#34d0a8] hover:bg-[#5ec2a7] hover:text-[#ecfef6] shadow transition-all duration-200 border border-[#34d0a8]"
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
        <div className="px-2 pb-1 pt-2 text-center transition-all duration-300 ease-in-out">
          <Link
            href={
              session?.user?.role === "super_admin"
                ? "/dashboard/super-admin"
                : session?.user?.role === "admin"
                ? "/dashboard/admin"
                : "/"
            }
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
