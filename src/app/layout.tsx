import type { Metadata } from "next";
import { Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

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
  description: "Multi-tenant food ordering platform for restaurants and customers",
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
        <div className="min-h-screen bg-background">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
