import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function readingTime(content: string): string {
  // strip html tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, "");
  const wordCount = plainText.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
}

export function extractFirstImage(content: string): string | null {
  const match = content
    .replace(/\n/g, "")
    .match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

export function toISOString(
  date: Date | string | null | undefined,
): string | null {
  if (!date) return null;
  if (typeof date === "string") return date;
  return date.toISOString();
}
