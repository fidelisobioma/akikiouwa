import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PostSchema } from "@/lib/schema";
import { revalidateTag } from "next/cache";

// GET — fetch post by id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    revalidateTag("posts", "max");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
// PATCH — update post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const parsed = PostSchema.safeParse({
      ...body,
      categoryId: body.categoryId || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { title, slug, content, published, categoryId } = parsed.data;

    // check category is provided when publishing
    if (published && !categoryId) {
      return NextResponse.json(
        { error: "Category is required before publishing" },
        { status: 400 },
      );
    }

    // check post exists
    const existing = await prisma.post.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // check slug is unique — ignore current post
    const slugExists = await prisma.post.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 },
      );
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        published,
        publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
        categoryId: categoryId ?? null,
      },
    });

    revalidateTag("posts", "pages");

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE — delete post
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // check post exists
    const existing = await prisma.post.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });
    revalidateTag("posts", "max");

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH — toggle published status only
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { published } = await req.json();

    const existing = await prisma.post.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // check category exists before publishing
    if (published && !existing.categoryId) {
      return NextResponse.json(
        { error: "Category is required before publishing" },
        { status: 400 },
      );
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
      },
    });
    revalidateTag("posts", "max");

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error toggling post status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
