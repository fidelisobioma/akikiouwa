import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";
import { getCachedAllPosts } from "@/lib/cache";
import { toISOString } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Latest News",
  description:
    "Browse all the latest news and updates from around the world on Akikouwa.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/news`,
  },
};

export default async function NewsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");

  const { posts, total, pages } = await getCachedAllPosts(page);

  return (
    <main className="mx-auto px-4 py-10 pb-16 max-w-7xl">
      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary rounded-full w-1 h-8" />
          <h1 className="font-semibold text-3xl">Latest news</h1>
        </div>
        <p className="ml-4 text-muted-foreground text-sm">
          {total} {total === 1 ? "article" : "articles"} published
        </p>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 py-24">
          <p className="text-muted-foreground text-base">
            No articles published yet
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Articles grid */}
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {posts.map((post) => (
              <ArticleCard
                key={post.id}
                {...post}
                publishedAt={toISOString(post.publishedAt)}
                variant="default"
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              {/* Previous */}
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/news?page=${page - 1}`}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
              )}

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "ghost"}
                    size="sm"
                    className="w-8 h-8"
                    asChild={page !== p}
                  >
                    {page !== p ? (
                      <Link href={`/news?page=${p}`}>{p}</Link>
                    ) : (
                      <span>{p}</span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Next */}
              {page < pages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/news?page=${page + 1}`}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
