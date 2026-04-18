import Link from "next/link";
import { CategoryNav } from "./category-nav";
import { Search } from "./search";
import { MobileNav } from "./mobile-nav";
import AuthStatus from "@/components/auth-status";
import { ThemeToggle } from "./theme-toggle";
import { getCachedNavbarCategories } from "@/lib/cache";

export async function Navbar() {
  const categories = await getCachedNavbarCategories();

  return (
    <header className="top-0 right-0 left-0 z-50 fixed bg-background/95 supports-backdrop-filter:bg-background/60 backdrop-blur border-b h-16">
      <div className="flex justify-between items-center gap-4 mx-auto px-4 max-w-7xl h-full">
        {/* Left — logo + mobile menu */}
        <div className="flex items-center gap-2">
          <MobileNav categories={categories} />
          <Link
            href="/"
            className="font-semibold text-primary text-xl tracking-tight"
          >
            Akikouwa
          </Link>
        </div>

        {/* Center — categories */}
        <CategoryNav categories={categories} />

        {/* Right — search, dark mode, auth */}
        <div className="flex items-center gap-1">
          <Search />
          <ThemeToggle />
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
