import { redirect } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { getCachedSearchPosts } from "@/lib/cache";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Search results for "${q}"` : "Search",
    description: q
      ? `Browse search results for "${q}" on Akikouwa.`
      : "Search for news articles on Akikouwa.",
    robots: {
      index: false, // don't index search result pages
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");

  // redirect to homepage if no query
  if (!q || q.trim() === "") redirect("/");

  const query = q.trim();
  const { posts, total, pages } = await getCachedSearchPosts(query, page);

  return (
    <main className="mx-auto px-4 py-10 pb-16 max-w-7xl">
      {/* Search header */}
      <div className="mb-10">
        <h1 className="mb-1 font-medium text-2xl">
          Search results for{" "}
          <span className="text-primary">{`"${query}"`}</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          {total} {total === 1 ? "result" : "results"} found
        </p>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 py-24">
          <p className="text-muted-foreground text-base">
            No results found for {`"${query}"`}
          </p>
          <p className="text-muted-foreground text-sm">
            Try different keywords or browse by category
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button asChild variant="outline">
              <Link href="/">Back to homepage</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Results grid */}
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {posts.map((post) => (
              <ArticleCard
                key={post.id}
                {...post}
                publishedAt={post.publishedAt?.toISOString() ?? null}
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
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  >
                    Previous
                  </Link>
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
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                      >
                        {p}
                      </Link>
                    ) : (
                      <span>{p}</span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Next */}
              {page < pages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  >
                    Next
                  </Link>
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
