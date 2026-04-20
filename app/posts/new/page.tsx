"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import DOMPurify from "dompurify";
import { toast } from "sonner";

export default function NewPostPage() {
  const DRAFT_KEY = "akikouwa-post-draft";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);

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

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        // only restore if there is actual content
        if (draft.title || draft.content) {
          form.reset({
            title: draft.title ?? "",
            slug: draft.slug ?? "",
            content: draft.content ?? "",
            published: false,
            categoryId: draft.categoryId ?? "",
          });
          if (draft.categoryId) {
            setCategoryId(draft.categoryId);
          }
          setDraftRestored(true);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function handleSubmit(published: boolean) {
    // validate category if publishing
    if (published && !categoryId) {
      toast.error("Please select a category before publishing");
      return;
    }

    const values = form.getValues();
    // trigger zod validation
    const isValid = await form.trigger();

    if (!isValid) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          published,
          categoryId: categoryId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.log("API error:", error);
        throw new Error(error.error);
      }

      const post = await res.json();

      localStorage.removeItem(DRAFT_KEY);

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

  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const values = form.getValues();
      if (values.title || values.content) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Action bar — fixed below navbar */}
      <ActionBar
        mode={mode}
        onModeChange={setMode}
        onSaveDraft={() => handleSubmit(false)}
        onPublish={() => handleSubmit(true)}
        isLoading={isLoading}
      />

      {/* ✅ draft recovery banner */}
      {draftRestored && (
        <div
          className="right-0 left-0 z-30 fixed bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 border-b"
          style={{ top: "120px" }}
        >
          <div className="flex justify-between items-center mx-auto px-4 py-2 max-w-7xl">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              Your unsaved draft has been restored.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(DRAFT_KEY);
                form.reset({
                  title: "",
                  slug: "",
                  content: "",
                  published: false,
                  categoryId: "",
                });
                setCategoryId("");
                setDraftRestored(false);
              }}
              className="text-amber-700 dark:text-amber-300 text-xs hover:underline"
            >
              Discard draft
            </button>
          </div>
        </div>
      )}

      {/* Main content — offset for navbar (64px) + action bar (56px) */}
      <div
        className={`md:flex flex-1 mx-auto pt-15 container ${draftRestored ? "pt-38" : "pt-30"}`}
      >
        {/* Scrollable writing area */}
        <div
          className={` flex-1  px-4 py-8 w-full transition-all duration-300 ${
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
                        className="border-2 h-12 font-medium text-2xl"
                        onChange={(e) => {
                          const value = e.target.value; // ✅ capture value first
                          field.onChange(value); // ✅ pass string not event
                          const slug = value // ✅ generate from captured value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-+|-+$/g, "");
                          form.setValue("slug", slug); // ✅ set slug directly
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
            <div className="mx-auto w-full md:max-w-5xl">
              <h1 className="mb-6 font-semibold text-4xl tracking-tight">
                {watchedTitle || "Untitled article"}
              </h1>
              <div
                className="dark:prose-invert prose-blockquote:border-primary prose-blockquote:border-l-4 prose-img:rounded-lg max-w-none prose-headings:font-medium prose-a:text-primary prose-headings:tracking-tight tiptap prose prose-sm"
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
