import prisma from "@/lib/prisma";
import { NavbarClient } from "./navbar-client";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function Navbar() {
  const categories = await getCategories();
  return <NavbarClient categories={categories} />;
}
