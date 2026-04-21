import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/components/news/article-card";
import { LikeButton } from "@/components/news/like-button";
import { CommentsSection } from "@/components/news/comments-section";

import { ReadingProgress } from "@/components/news/reading-progress";
// import { Newsletter } from "@/components/news/newsletter";
import { readingTime, extractFirstImage, toISOString } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import * as DOMPurify from "isomorphic-dompurify";
import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/news/share-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getPost(slug: string) {
  return await prisma.post.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      publishedAt: true,
      createdAt: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
      author: {
        select: { name: true },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
}

async function getRelatedPosts(categoryId: string, excludeSlug: string) {
  return await prisma.post.findMany({
    where: {
      published: true,
      categoryId,
      NOT: { slug: excludeSlug },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      publishedAt: true,
      category: {
        select: { name: true, slug: true },
      },
      author: {
        select: { name: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const publishDate = new Date(post.publishedAt ?? post.createdAt);
  const firstImage = extractFirstImage(post.content);
  const plainText = post.content.replace(/<[^>]*>/g, "");
  const description = plainText.slice(0, 160).trim();

  return {
    title: post.title,
    description,
    authors: post.author.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      type: "article",
      url: `${siteUrl}/news/${slug}`,
      title: post.title,
      description,
      publishedTime: publishDate.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
      section: post.category?.name,
      ...(firstImage && { images: [{ url: firstImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(firstImage && { images: [firstImage] }),
    },
    alternates: {
      canonical: `${siteUrl}/news/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  console.log("🔥 ArticlePage rendering for slug:", slug);
  if (!post) notFound();

  const relatedPosts = post.category
    ? await getRelatedPosts(post.category.id, slug)
    : [];

  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "src",
      "width",
      "height",
      "frameborder",
      "allowfullscreen",
      "allow",
    ],
  });

  const publishDate = new Date(post.publishedAt ?? post.createdAt);
  const articleUrl = `${siteUrl}/news/${post.slug}`;

  return (
    <main className="pb-16">
      <ReadingProgress />

      {/* Article header + content */}
      <article className="mx-auto px-4 pt-10 max-w-2xl">
        {/* Category badge */}
        {post.category && (
          <Link href={`/category/${post.category.slug}`}>
            <Badge
              variant="outline"
              className="hover:bg-muted mb-4 transition-colors"
            >
              {post.category.name}
            </Badge>
          </Link>
        )}

        {/* Title */}
        <h1 className="mb-4 font-semibold text-3xl lg:text-4xl leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-2 mb-6 text-muted-foreground text-sm">
          {post.author.name && (
            <span className="font-medium text-foreground">
              {post.author.name}
            </span>
          )}
          {post.author.name && <span>·</span>}
          <time dateTime={publishDate.toISOString()}>
            {format(publishDate, "MMM d, yyyy")}
          </time>
          <span>·</span>
          <span>{formatDistanceToNow(publishDate, { addSuffix: true })}</span>
          <span>·</span>
          <span>{readingTime(post.content)}</span>
        </div>

        {/* Share buttons — top */}
        <div className="mb-8">
          <ShareButtons title={post.title} url={articleUrl} />
        </div>

        {/* Article content */}
        <div
          className="dark:prose-invert prose-img:mx-0 prose-img:my-4 prose-blockquote:border-primary prose-blockquote:border-l-4 prose-img:rounded-lg max-w-none prose-headings:font-medium prose-a:text-primary hover:prose-a:underline prose-a:no-underline prose-headings:tracking-tight tiptap prose prose-base"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Likes and comments bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-10 pt-6 border-t">
          <div className="flex items-center gap-4">
            <LikeButton postId={post.id} />
            <a
              href="#comments"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>
                {post._count.comments}{" "}
                {post._count.comments === 1 ? "comment" : "comments"}
              </span>
            </a>
          </div>
          <ShareButtons title={post.title} url={articleUrl} />
        </div>
      </article>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-16 px-4 pt-10 border-t max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary rounded-full w-1 h-6" />
            <h2 className="font-medium text-xl">Related articles</h2>
          </div>
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <ArticleCard
                key={relatedPost.id}
                {...relatedPost}
                publishedAt={toISOString(relatedPost.publishedAt)}
                variant="default"
              />
            ))}
          </div>
        </section>
      )}

      {/* Comments section */}
      <div id="comments">{post && <CommentsSection postId={post.id} />}</div>

      {/* JSON-LD */}
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: post.title,
              datePublished: publishDate.toISOString(),
              dateModified: publishDate.toISOString(),
              author: {
                "@type": "Person",
                name: post.author.name ?? "Akikouwa",
              },
              publisher: {
                "@type": "Organization",
                name: "Akikouwa",
                url: siteUrl,
              },
              url: `${siteUrl}/news/${post.slug}`,
              articleSection: post.category?.name,
              ...(extractFirstImage(post.content) && {
                image: extractFirstImage(post.content),
              }),
            }),
          }}
        />
      )}
    </main>
  );
}
