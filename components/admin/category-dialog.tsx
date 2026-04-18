"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be under 50 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(50, { message: "Slug must be under 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers and hyphens",
    }),
});

const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be under 50 characters" }),
});

type CreateCategoryValues = z.infer<typeof CreateCategorySchema>;
type UpdateCategoryValues = z.infer<typeof UpdateCategorySchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const isEditing = !!category;
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const createForm = useForm<CreateCategoryValues>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: { name: "", slug: "" },
  });

  const editForm = useForm<UpdateCategoryValues>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: { name: "" },
  });

  // pre-fill edit form when category changes
  useEffect(() => {
    if (category) {
      editForm.reset({ name: category.name });
    } else {
      createForm.reset({ name: "", slug: "" });
    }
    setServerError("");
  }, [category, open]);

  async function handleCreate(values: CreateCategoryValues) {
    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      createForm.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(values: UpdateCategoryValues) {
    if (!category) return;
    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      editForm.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit category" : "New category"}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          // Edit form — name only, slug is locked
          <form
            onSubmit={editForm.handleSubmit(handleUpdate)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Controller
                name="name"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="edit-name"
                      placeholder="Category name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Slug — locked, read only */}
              <Field>
                <FieldLabel>Slug</FieldLabel>
                <Input
                  value={category?.slug}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="mt-1 text-muted-foreground text-xs">
                  Slug cannot be changed after creation to prevent broken URLs.
                </p>
              </Field>
            </FieldGroup>

            {serverError && (
              <p className="text-destructive text-sm">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          // Create form — name and slug
          <form
            onSubmit={createForm.handleSubmit(handleCreate)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Controller
                name="name"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="create-name"
                      placeholder="e.g. Technology"
                      autoComplete="off"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        // auto generate slug from name
                        const slug = value
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .replace(/\s+/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        createForm.setValue("slug", slug);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="slug"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-slug">Slug</FieldLabel>
                    <Input
                      {...field}
                      id="create-slug"
                      placeholder="e.g. technology"
                      autoComplete="off"
                    />
                    <p className="mt-1 text-muted-foreground text-xs">
                      This will be used in the URL: /category/
                      {createForm.watch("slug") || "slug"}
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {serverError && (
              <p className="text-destructive text-sm">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create category"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
