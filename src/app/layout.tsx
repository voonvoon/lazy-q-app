//wonghv
//VJT3Hxq4mpdjaQjV
//

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ItemsProvider } from "@/contexts/ItemsContext";

// Wrap your children with SessionProvider

const geistSans = Geist({
  variable: "--font-geist-sans", //most text, headings, etc
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", //code ,number, etc
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LazyQ - Food Ordering Made Easy",
  description:
    "Multi-tenant food ordering platform for restaurants and customers",
  keywords: ["food ordering", "restaurant", "delivery", "takeout"],
  icons: {
    icon: "/food-logo.svg",
    shortcut: "/food-logo.svg",
    apple: "/food-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <Toaster />
            <Navbar />
             <ItemsProvider>
            <main className="flex-1">{children}</main>
            </ItemsProvider>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}

