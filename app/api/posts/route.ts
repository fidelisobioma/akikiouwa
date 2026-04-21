import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PostSchema } from "@/lib/schema";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    // check user is authenticated
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // validate with zod
    // const parsed = PostSchema.safeParse(body);
    const parsed = PostSchema.safeParse({
      ...body,
      categoryId: body.categoryId || undefined, // convert "" to undefined
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

    // check slug is unique
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 },
      );
    }

    // create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        categoryId: categoryId ?? null,
      },
    });

    revalidateTag("posts", "max");

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") ?? "all";
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // build where clause based on filter
    const where = {
      ...(filter === "published" && { published: true }),
      ...(filter === "drafts" && { published: false }),
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    // fetch posts and total count in parallel
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          publishedAt: true,
          createdAt: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json(
      {
        posts,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
