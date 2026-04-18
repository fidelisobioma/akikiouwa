"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/generated/prisma/client";

interface MobileNavProps {
  categories: Category[];
}

export function MobileNav({ categories }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isOpen && (
        <div className="top-full right-0 left-0 z-50 absolute bg-background shadow-sm p-4 border-b">
          <nav className="flex flex-col gap-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted
                  ${
                    pathname === `/category/${category.slug}`
                      ? "font-medium text-primary bg-muted"
                      : "text-muted-foreground"
                  }`}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
