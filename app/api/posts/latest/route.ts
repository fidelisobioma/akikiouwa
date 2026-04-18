import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // fetch latest 6 published posts
    // exclude the 4 already shown in hero section
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip: 4, // skip the 4 hero posts
      take: 6,
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
    console.error("Error fetching latest posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
