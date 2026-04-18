import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { extractFirstImage, readingTime, toISOString } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import { formatDistanceToNow, format } from "date-fns";
import { ArticleCard } from "@/components/news/article-card";
import { LikeButton } from "@/components/news/like-button";
import { CommentsSection } from "@/components/news/comments-section";
import { MessageSquare } from "lucide-react";
import { Metadata } from "next";
import { ReadingProgress } from "@/components/news/reading-progress";
import { ShareButtons } from "@/components/news/share-button";
import { getCachedPost, getCachedRelatedPosts } from "@/lib/cache";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// ✅ add generateMetadata function
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedPost(slug);

  if (!post) return {};

  const publishDate = new Date(post.publishedAt ?? post.createdAt);

  const firstImage = extractFirstImage(post.content);

  // strip html for description
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
  const post = await getCachedPost(slug);

  if (!post) notFound();

  const relatedPosts = post.category
    ? await getCachedRelatedPosts(post.category.id, slug)
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
        {/* Category badge — clickable */}
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

        {/* Meta — author, date, reading time */}
        <div className="flex items-center gap-2 mb-8 text-muted-foreground text-sm">
          {post.author.name && (
            <span className="font-medium text-foreground">
              {post.author.name}
            </span>
          )}
          {post.author.name && <span>·</span>}
          <time dateTime={publishDate.toISOString()}>
            {format(new Date(publishDate), "MMM d, yyyy")}
          </time>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(publishDate), {
              addSuffix: true,
            })}
          </span>
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

        <div className="flex flex-wrap justify-between items-center gap-4 mt-10 pt-6 border-t">
          <div className="flex items-center gap-4 mt-10 pt-6 border-t">
            <LikeButton postId={post.id} />
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
            {relatedPosts.map((post) => (
              <ArticleCard
                key={post.id}
                {...post}
                publishedAt={toISOString(post.publishedAt)} // ✅ convert Date to string
                variant="default"
              />
            ))}
          </div>
        </section>
      )}
      <div id="comments">
        <CommentsSection postId={post.id} />
      </div>

      {/* JSON-LD structured data */}
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
    </main>
  );
}
