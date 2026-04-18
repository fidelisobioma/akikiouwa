import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET — fetch like status and count for a post
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    const [likeCount, userLike] = await Promise.all([
      // total likes for the post
      prisma.like.count({
        where: { postId },
      }),
      // check if current user has liked the post
      session?.user
        ? prisma.like.findUnique({
            where: {
              authorId_postId: {
                authorId: session.user.id,
                postId,
              },
            },
          })
        : null,
    ]);

    return NextResponse.json(
      {
        likeCount,
        isLiked: !!userLike,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST — toggle like for a post
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to like a post" },
        { status: 401 },
      );
    }

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    // check post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId, published: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // check if user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        authorId_postId: {
          authorId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // unlike — delete the existing like
      await prisma.like.delete({
        where: {
          authorId_postId: {
            authorId: session.user.id,
            postId,
          },
        },
      });

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({ likeCount, isLiked: false }, { status: 200 });
    } else {
      // like — create a new like
      await prisma.like.create({
        data: {
          authorId: session.user.id,
          postId,
        },
      });

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({ likeCount, isLiked: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
