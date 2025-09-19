import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-gray-300 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm mb-2 sm:mb-0">
            &copy; {new Date().getFullYear()} LazyQ Food App. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;