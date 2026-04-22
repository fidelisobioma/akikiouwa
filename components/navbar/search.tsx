"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchProps {
  onOpenChange?: (open: boolean) => void;
}

export function Search({ onOpenChange }: SearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
    onOpenChange?.(isOpen); // ✅ notify parent
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="flex items-center">
      {isOpen ? (
        <form onSubmit={handleSearch} className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-32 sm:w-48 h-8 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-8 h-8 shrink-0"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
          onClick={() => setIsOpen(true)}
        >
          <SearchIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
