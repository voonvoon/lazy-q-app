import Image from "next/image";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <>  
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 bg-gray-800">
        <h1 className="text-3xl sm:text-5xl font-bold text-center">
          Welcome to LazyQ 
        </h1>
        <p className="mt-4 text-lg sm:text-2xl text-center font-thin">
          Your one-stop solution for E-Menu and food order!
        </p>
        <p className="mt-4 text-base sm:text-lg font-mono text-center font-thin">
          phone: 03-8945238
        </p>
        <p className="mt-4 text-lg sm:text-xl font-sans text-center font-thin">
          Make your order now!
        </p>
        <Image
          src="/food-logo.svg"
          alt="Next.js Logo"
          width={160}
          height={160}
          className="mt-8 invert"
        />
      </main>
    </>
  );
}
