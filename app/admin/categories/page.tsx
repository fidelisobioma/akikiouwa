"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { CategoryDialog } from "@/components/admin/category-dialog";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function handleEdit(category: Category) {
    setEditCategory(category);
    setDialogOpen(true);
  }

  function handleNewCategory() {
    setEditCategory(null);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteCategory) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setDeleteCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto px-4 py-10 max-w-4xl">
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-medium text-2xl">Manage categories</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"} total
          </p>
        </div>
        <Button onClick={handleNewCategory}>
          <Plus className="mr-2 w-4 h-4" />
          New category
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <Loader2 className="mx-auto w-5 h-5 text-muted-foreground animate-spin" />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-muted-foreground text-sm text-center"
                >
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  {/* Name */}
                  <TableCell className="font-medium">{category.name}</TableCell>

                  {/* Slug */}
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {category.slug}
                  </TableCell>

                  {/* Post count */}
                  <TableCell>
                    <span className="text-sm">
                      {category._count.posts}{" "}
                      {category._count.posts === 1 ? "post" : "posts"}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteCategory(category)}
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

      {/* Category dialog — create and edit */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditCategory(null);
        }}
        category={editCategory}
        onSuccess={fetchCategories}
      />

      {/* Delete confirmation modal */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2">
                <span>
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">
                    {deleteCategory?.name}
                  </span>
                  ?
                </span>
                {deleteCategory && deleteCategory._count.posts > 0 && (
                  <span className="font-medium text-amber-600 dark:text-amber-400 text-sm">
                    Warning: {deleteCategory._count.posts}{" "}
                    {deleteCategory._count.posts === 1
                      ? "published post"
                      : "published posts"}{" "}
                    in this category will be moved to drafts and hidden from the
                    public.
                  </span>
                )}
              </div>
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
