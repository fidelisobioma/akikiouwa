"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // fetch initial comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?postId=${postId}`);
        const data = await res.json();
        setComments(data.comments);
        setNextCursor(data.nextCursor);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsFetching(false);
      }
    }
    fetchComments();
  }, [postId]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/comments?postId=${postId}&cursor=${nextCursor}`,
      );
      const data = await res.json();
      setComments((prev) => [...prev, ...data.comments]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (content.length > 500) {
      setError("Comment must be under 500 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const newComment = await res.json();

      // add new comment to top of list
      setComments((prev) => [newComment, ...prev]);
      setContent("");
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/comments/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      // remove comment from list
      setComments((prev) => prev.filter((comment) => comment.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  function canDelete(comment: Comment) {
    if (!session?.user) return false;
    return (
      comment.author.id === session.user.id || session.user.role === "admin"
    );
  }

  function getInitials(name: string | null) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <section className="mx-auto mt-12 px-4 max-w-2xl">
      <Separator className="mb-8" />

      {/* Section header */}
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5" />
        <h2 className="font-medium text-xl">
          Comments{" "}
          {comments.length > 0 && (
            <span className="font-normal text-muted-foreground text-base">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Comment form */}
      {status === "loading" ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : session?.user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <Avatar className="mt-1 w-8 h-8 shrink-0">
              {/* <AvatarImage src={session.user.image ?? ""} /> */}
              <AvatarImage src={session.user.name ?? ""} />
              <AvatarFallback className="text-xs">
                {getInitials(session.user.name ?? null)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 gap-3">
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError("");
                }}
                placeholder="Write a comment..."
                rows={3}
                className="resize-none"
                maxLength={500}
              />
              {error && <p className="text-destructive text-xs">{error}</p>}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">
                  {content.length} / 500
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !content.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post comment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-center bg-muted/40 mb-10 p-4 border rounded-lg">
          <p className="text-muted-foreground text-sm">
            Sign in to join the conversation
          </p>
          <Button size="sm" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        </div>
      )}

      {/* Comments list */}
      {isFetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground text-sm">
            No comments yet — be the first to comment
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <Avatar className="mt-0.5 w-8 h-8 shrink-0">
                <AvatarImage src={comment.author.image ?? ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.author.name)}
                </AvatarFallback>
              </Avatar>

              {/* Comment content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.author.name ?? "Anonymous"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Delete button */}
                  {canDelete(comment) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => setDeleteId(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more comments"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The comment will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
