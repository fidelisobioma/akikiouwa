import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";

const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be under 50 characters" }),
});

// PATCH — update category name only (slug is locked)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const parsed = UpdateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name } = parsed.data;

    // check category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // check name is unique — ignore current category
    const nameExists = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (nameExists) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 },
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });

    revalidateTag("categories", "pages");
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE — delete category and unpublish its posts
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // check category exists
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // unpublish all published posts in this category
    // and remove their category
    await prisma.post.updateMany({
      where: {
        categoryId: id,
        published: true,
      },
      data: {
        published: false,
        publishedAt: null,
        categoryId: null,
      },
    });

    // set categoryId to null for draft posts too
    await prisma.post.updateMany({
      where: {
        categoryId: id,
        published: false,
      },
      data: {
        categoryId: null,
      },
    });

    // delete the category
    await prisma.category.delete({
      where: { id },
    });
    revalidateTag("categories", "pages");

    return NextResponse.json(
      {
        message: "Category deleted successfully",
        affectedPosts: existing._count.posts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
