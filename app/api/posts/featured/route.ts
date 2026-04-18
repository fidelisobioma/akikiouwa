import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // fetch 4 most recently published posts for hero section
    // first post = main hero, rest = sidebar stories
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        publishedAt: true,
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
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
