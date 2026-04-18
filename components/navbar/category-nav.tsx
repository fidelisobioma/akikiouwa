"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Category } from "@/lib/generated/prisma/client";

interface CategoryNavProps {
  categories: Category[];
}

const VISIBLE_COUNT = 6;

export function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();

  const visibleCategories = categories.slice(0, VISIBLE_COUNT);
  const moreCategories = categories.slice(VISIBLE_COUNT);

  return (
    <nav className="hidden md:flex items-center gap-1">
      {visibleCategories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-muted
            ${
              pathname === `/category/${category.slug}`
                ? "font-medium text-primary bg-muted"
                : "text-muted-foreground"
            }`}
        >
          {category.name}
        </Link>
      ))}

      {moreCategories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground cursor-pointer"
            >
              More
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {moreCategories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link
                  href={`/category/${category.slug}`}
                  className={`cursor-pointer ${
                    pathname === `/category/${category.slug}`
                      ? "font-medium text-primary"
                      : ""
                  }`}
                >
                  {category.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
