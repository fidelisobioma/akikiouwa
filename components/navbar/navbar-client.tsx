"use client";

import { useState } from "react";
import Link from "next/link";
// import { Category } from "@prisma/client";
import { CategoryNav } from "./category-nav";
import { Search } from "./search";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import AuthStatus from "@/components/auth-status";
import { Category } from "@/lib/generated/prisma/client";

interface NavbarClientProps {
  categories: Category[];
}

export function NavbarClient({ categories }: NavbarClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="top-0 right-0 left-0 z-50 fixed bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b h-16">
      <div className="flex justify-between items-center gap-4 mx-auto px-4 max-w-7xl h-full">
        {/* Left — logo + mobile menu */}
        <div className="flex items-center gap-2 shrink-0">
          <MobileNav categories={categories} />
          <Link
            href="/"
            className="font-semibold text-primary text-xl tracking-tight"
          >
            <span className="sm:hidden">Akiko</span>
            <span className="hidden sm:block">Akikouwa</span>
          </Link>
        </div>

        {/* Center — categories */}
        <CategoryNav categories={categories} />

        {/* Right — search, dark mode, auth */}
        <div className="flex items-center gap-1 shrink-0">
          <Search onOpenChange={setSearchOpen} />

          {/* ✅ hide on mobile when search is open */}
          <div
            className={`flex items-center gap-1 ${searchOpen ? "hidden sm:flex" : "flex"}`}
          >
            <ThemeToggle />
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
