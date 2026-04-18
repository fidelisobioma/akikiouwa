"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostSidebarProps {
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  isCollapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
}

export function PostSidebar({
  categoryId,
  onCategoryChange,
  isCollapsed,
  onCollapsedChange,
}: PostSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const sidebarContent = (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Required before publishing
        </p>
      </div>
    </div>
  );

  // mobile — sheet sliding from right
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden top-30 right-0 fixed w-9 h-9"
          onClick={() => setIsMobileOpen(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Post settings</SheetTitle>
            </SheetHeader>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // desktop — collapsible sidebar
  return (
    <div
      className={`hidden md:flex flex-col fixed right-0 border-l bg-background transition-all duration-300 ${
        isCollapsed ? "w-10" : "w-64"
      }`}
      style={{ top: "120px", bottom: 0 }}
    >
      {/* collapse toggle button */}
      <div className="flex justify-end p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={() => onCollapsedChange(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* sidebar content — hidden when collapsed */}
      {!isCollapsed && sidebarContent}
    </div>
  );
}
