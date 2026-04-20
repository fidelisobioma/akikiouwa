"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function ManageUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated" && session.user.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [fetchUsers, status]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleToggleRole(user: User) {
    setIsTogglingId(user.id);
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success(`User role updated to ${newRole}`);

      fetchUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success("User deleted successfully");
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsDeleting(false);
    }
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

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-10 max-w-7xl">
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-medium text-2xl">Manage users</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {data?.total ?? 0} users total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 w-full sm:w-64">
        <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <Loader2 className="mx-auto w-5 h-5 text-muted-foreground animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-muted-foreground text-sm text-center"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user) => (
                <TableRow key={user.id}>
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.image ?? ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">
                          {user.name ?? "No name"}
                        </span>
                        <span className="text-muted-foreground text-xs truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role — clickable toggle */}
                  <TableCell>
                    <button
                      onClick={() => handleToggleRole(user)}
                      disabled={
                        isTogglingId === user.id || user.id === session?.user.id
                      }
                      className="focus:outline-none"
                    >
                      {isTogglingId === user.id ? (
                        <Badge variant="outline">
                          <Loader2 className="mr-1 w-3 h-3 animate-spin" />
                          Updating
                        </Badge>
                      ) : (
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                          className={
                            user.id !== session?.user.id
                              ? "cursor-pointer hover:opacity-80 transition-opacity"
                              : "cursor-not-allowed opacity-60"
                          }
                        >
                          {user.role}
                        </Badge>
                      )}
                    </button>
                  </TableCell>

                  {/* Posts */}
                  <TableCell className="text-sm">{user._count.posts}</TableCell>

                  {/* Comments */}
                  <TableCell className="text-sm">
                    {user._count.comments}
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:text-destructive"
                      disabled={user.id === session?.user.id}
                      onClick={() => setDeleteUser(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteUser?.name ?? deleteUser?.email}
              </span>
              ? This action cannot be undone. All their comments and likes will
              also be deleted.
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
