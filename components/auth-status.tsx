"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { LogIn, User, PenSquare } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthStatus() {
  const { status, data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/auth/signin"); // ✅ redirect to signin after logout
    router.refresh();
  }

  if (status === "loading") {
    return <Skeleton className="w-9 h-9" />;
  }

  if (status === "unauthenticated") {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/auth/signin">
          <LogIn className="w-5 h-5" />
        </Link>
      </Button>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="flex items-center gap-1">
      {isAdmin && (
        <Button variant="ghost" size="icon" asChild>
          <Link href="/posts/new">
            <PenSquare className="w-5 h-5" />
          </Link>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/posts/manage" className="cursor-pointer">
                  Manage articles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/categories" className="cursor-pointer">
                  Manage categories
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="cursor-pointer">
                  Manage users
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/profile/settings" className="cursor-pointer">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
