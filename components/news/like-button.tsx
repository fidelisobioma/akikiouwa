"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // fetch initial like status and count
  useEffect(() => {
    async function fetchLikes() {
      try {
        const res = await fetch(`/api/likes?postId=${postId}`);
        const data = await res.json();
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    }
    fetchLikes();
  }, [postId]);

  async function handleLike() {
    // redirect to sign in if not authenticated
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    // optimistic UI update
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    setIsLoading(true);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        // revert optimistic update on error
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        return;
      }

      const data = await res.json();
      setLikeCount(data.likeCount);
      setIsLiked(data.isLiked);
    } catch (error) {
      // revert optimistic update on error
      console.error("Error toggling like:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={handleLike}
      className={cn(
        "flex items-center gap-2 transition-colors",
        isLiked
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-red-500",
      )}
    >
      <Heart
        className={cn("w-5 h-5 transition-all", isLiked && "fill-red-500")}
      />
      <span className="font-medium text-sm">
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </span>
    </Button>
  );
}
