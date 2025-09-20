"use client";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
     <main className="relative min-h-screen flex items-start justify-center pt-20 sm:pt-48 overflow-hidden" style={{ backgroundColor: "#F0EEF7" }}>
        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row sm:flex-row items-center justify-center w-full px-6 sm:px-0">
          {/* Text Section */}
          <div className="flex flex-col items-center sm:items-center justify-center flex-2 mx-16">
            <h1
              className="font-serif text-4xl sm:text-7xl font-extrabold text-center sm:text-left mb-6 animate-shine"
              style={{
                color: "#476167",
                textShadow: "0 2px 8px #ffeacb",
              }}
            >
              Welcome to 
               <span className="mx-1 font-serif text-4xl sm:text-7xl font-bold tracking-wide  drop-shadow-lg">
                  Lazy<span className="text-red-400"> Q</span>
                </span>
            </h1>
            <p
              className="font-serif text-base sm:text-2xl text-center sm:text-left font-light mb-8 max-w-xl"
              style={{
                color: "#476167",
              }}
            >
              Now Everyone Can Create Their Own Online Food Ordering System Effortlessly!
            </p>
            <a
              href="/menu"
              className="inline-block px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200"
              style={{
                backgroundColor: "#34d0a8",
                color: "#ecfef6",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#5ec2a7";
                e.currentTarget.style.color = "#ecfef6";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#34d0a8";
                e.currentTarget.style.color = "#ecfef6";
              }}
            >
              Enquire Now
            </a>
          </div>
          {/* Image Section */}
          <div className="flex items-center justify-center flex-2 mt-8 sm:mt-0">
            <div className="animate-spin-slow">
              <Image
                src="/food-logo.svg"
                alt="Food Logo"
                width={150}
                height={150}
                className="w-32 h-32 sm:w-64 sm:h-64"
                priority
              />
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .animate-shine {
          animation: shine 2s linear infinite;
        }
        @keyframes shine {
          0% {
            filter: brightness(1.1);
          }
          50% {
            filter: brightness(1.5);
          }
          100% {
            filter: brightness(1.1);
          }
        }
       .animate-spin-slow {
    animation: spinY 8s linear infinite;
  }
  @keyframes spinY {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
      `}</style>
    </>
  );
}
