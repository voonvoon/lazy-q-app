import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-5xl font-bold ">Welcome to LazyQ Food App!</h1>
      <p className="mt-4 text-2xl">Your one-stop solution for food order!</p>
      <p className="mt-4 text-lg font-mono">phone:03-8945238</p>
      <p className="mt-4 text-xl font-sans ">Make your order now!</p>
      <Image
      src="/food-logo.svg"
      alt="Next.js Logo"
      width={200}
      height={200}
      className="mt-8 invert"
      />
    </main>
  );
}
