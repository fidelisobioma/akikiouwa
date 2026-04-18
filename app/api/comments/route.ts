import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const CommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(500, { message: "Comment must be under 500 characters" }),
  postId: z.string(),
});

// GET — fetch comments for a post
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor");
    const limit = 10;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // fetch one extra to check if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // skip the cursor itself
      }),
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            // image: true,
          },
        },
      },
    });

    // check if there are more comments
    let nextCursor: string | null = null;
    if (comments.length > limit) {
      const nextItem = comments.pop(); // remove the extra item
      nextCursor = nextItem?.id ?? null;
    }

    return NextResponse.json({ comments, nextCursor }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST — create a comment
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to comment" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const parsed = CommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { content, postId } = parsed.data;

    // check post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId, published: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            // image: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
