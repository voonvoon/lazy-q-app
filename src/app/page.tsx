"use client";

import Image from "next/image";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center p-8 sm:p-24 bg-gray-950">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-around w-full max-w-4xl">
          {/* Text Section */}
          <div className="flex-2 mb-8 sm:mb-0 sm:mr-48">
            <h1 className="font-serif text-5xl sm:text-8xl text-left bg-gradient-to-r from-white via-white-100 to-white-500 bg-clip-text text-transparent animate-shine font-light">
              Build your own food app
            </h1>
            <p className="font-serif mt-6 text-lg sm:text-2xl text-left font-thin bg-gradient-to-r from-white via-white-100 to-white-200 bg-clip-text text-transparent animate-shine">
              Explore, learn, and grow with our interactive study resources!
            </p>
          </div>
          {/* Image Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-xl  bg-gray-900 flex items-center justify-center animate-spin-slow">
              <Image
                src="/3d_img.jpg"
                alt="3D Image"
                width={260}
                height={260}
                className="rounded-xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        .animate-shine {
          animation: shine 1s linear infinite;
        }
        @keyframes shine {
          0% {
            filter: brightness(1.2);
          }
          50% {
            filter: brightness(1.5);
          }
          100% {
            filter: brightness(1.2);
          }
        }
      `}</style>
    </>
  );
}
