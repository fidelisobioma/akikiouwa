import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const HOMEPAGE_CATEGORIES = ["world", "politics", "business", "sports"];

export async function GET() {
  try {
    // fetch 3 published posts for each homepage category in parallel
    const categoriesWithPosts = await Promise.all(
      HOMEPAGE_CATEGORIES.map(async (slug) => {
        const category = await prisma.category.findUnique({
          where: { slug },
          select: {
            id: true,
            name: true,
            slug: true,
            posts: {
              where: { published: true },
              orderBy: { publishedAt: "desc" },
              take: 3,
              select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                publishedAt: true,
                author: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        return category;
      }),
    );

    // filter out any categories that have no posts
    const filtered = categoriesWithPosts.filter(
      (category) => category && category.posts.length > 0,
    );

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
