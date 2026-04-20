"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  category: Category | null;
  author: { name: string | null };
}

interface PostsResponse {
  posts: Post[];
  total: number;
  pages: number;
  currentPage: number;
}

type Filter = "all" | "published" | "drafts";

export default function ManagePostsPage() {
  const router = useRouter();
  const [data, setData] = useState<PostsResponse | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        search,
        page: page.toString(),
      });
      const res = await fetch(`/api/posts?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // reset to page 1 when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  async function handleToggleStatus(post: Post) {
    setIsTogglingId(post.id);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success(
        post.published ? "Article unpublished" : "Article published",
      );

      fetchPosts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success("Article deleted successfully");
      setDeleteId(null);
      fetchPosts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "drafts" },
  ];

  return (
    <div className="mx-auto px-4 py-10 max-w-7xl">
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-medium text-2xl">Manage articles</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {data?.total ?? 0} articles total
          </p>
        </div>
        <Button asChild>
          <Link href="/posts/new">
            <Plus className="mr-2 w-4 h-4" />
            New article
          </Link>
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {filters.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "ghost"}
              className="px-3 h-7 text-xs"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto w-5 h-5 text-muted-foreground animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-muted-foreground text-sm text-center"
                >
                  No articles found
                </TableCell>
              </TableRow>
            ) : (
              data?.posts.map((post) => (
                <TableRow key={post.id}>
                  {/* Title */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="line-clamp-1">{post.title}</span>
                      {post.published && (
                        <a
                          href={`/news/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {post.category ? (
                      <Badge variant="outline">{post.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Uncategorised
                      </span>
                    )}
                  </TableCell>

                  {/* Status — clickable toggle */}
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(post)}
                      disabled={isTogglingId === post.id}
                      className="focus:outline-none"
                    >
                      {isTogglingId === post.id ? (
                        <Badge variant="outline">
                          <Loader2 className="mr-1 w-3 h-3 animate-spin" />
                          Updating
                        </Badge>
                      ) : (
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      )}
                    </button>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-muted-foreground text-sm">
                    {post.published && post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => router.push(`/posts/${post.id}/edit`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                className="w-8 h-8"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page === data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The article will be permanently
              deleted from the database.
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
    </div>
  );
}
