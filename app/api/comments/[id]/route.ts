import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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

    // check comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // only comment author or admin can delete
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "You are not allowed to delete this comment" },
        { status: 403 },
      );
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
