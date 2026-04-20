"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostSchema, type PostSchemaType } from "@/lib/schema";
import { Editor } from "@/components/editor";
import { ActionBar } from "@/components/post/action-bar";
import { PostSidebar } from "@/components/post/post-sidebar";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import DOMPurify from "dompurify";
import { toast } from "sonner";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const form = useForm<PostSchemaType>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      published: false,
      categoryId: "",
    },
  });

  // fetch existing post and pre-fill form
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error("Post not found");

        const post = await res.json();

        form.reset({
          title: post.title,
          slug: post.slug,
          content: post.content,
          published: post.published,
          categoryId: post.categoryId ?? "",
        });

        setCategoryId(post.categoryId ?? "");
      } catch (error) {
        console.error("Failed to fetch post:", error);
        router.push("/posts/manage");
      } finally {
        setIsFetching(false);
      }
    }

    fetchPost();
  }, [id, form, router]);

  async function handleSubmit(published: boolean) {
    if (published && !categoryId) {
      toast.error("Please select a category before publishing");
      return;
    }

    const values = form.getValues();

    const isValid = await form.trigger();
    if (!isValid) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          published,
          categoryId: categoryId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const post = await res.json();

      if (published) {
        router.push(`/news/${post.slug}`);
      } else {
        router.push("/posts/manage");
      }
      toast.success(
        published
          ? "Article published successfully"
          : "Draft saved successfully",
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const watchedContent = form.watch("content");
  const watchedTitle = form.watch("title");

  // show loading state while fetching post
  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Action bar */}
      <ActionBar
        mode={mode}
        onModeChange={setMode}
        onSaveDraft={() => handleSubmit(false)}
        onPublish={() => handleSubmit(true)}
        isLoading={isLoading}
      />

      {/* Main content */}
      <div className="flex flex-1 pt-[120px]">
        {/* Scrollable writing area */}
        <div
          className={`flex-1 max-w-4xl px-4 py-8 w-full transition-all duration-300 ${
            isCollapsed ? "mr-10" : "mr-64"
          }`}
        >
          {mode === "write" ? (
            <form id="post-form">
              <FieldGroup>
                {/* Title */}
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="title">Title</FieldLabel>
                      <Input
                        {...field}
                        id="title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Article title"
                        autoComplete="off"
                        className="h-12 font-medium text-2xl"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          const slug = value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-+|-+$/g, "");
                          form.setValue("slug", slug);
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Content editor */}
                <Controller
                  name="content"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Content</FieldLabel>
                      <Editor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Start writing your article..."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          ) : (
            // Preview mode
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-6 font-semibold text-4xl tracking-tight">
                {watchedTitle || "Untitled article"}
              </h1>
              <div
                className="dark:prose-invert prose-img:mx-0 prose-img:my-4 prose-blockquote:border-primary prose-blockquote:border-l-4 prose-img:rounded-lg max-w-none prose-headings:font-medium prose-a:text-primary prose-headings:tracking-tight tiptap prose prose-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    watchedContent || "<p>Nothing to preview yet.</p>",
                    {
                      ADD_TAGS: ["iframe"],
                      ADD_ATTR: [
                        "src",
                        "width",
                        "height",
                        "frameborder",
                        "allowfullscreen",
                        "allow",
                      ],
                    },
                  ),
                }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <PostSidebar
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
        />
      </div>
    </div>
  );
}
