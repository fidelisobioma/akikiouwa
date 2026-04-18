import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { getCachedCategoryPosts } from "@/lib/cache";
import { toISOString } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return {};

  return {
    title: `${category.name} News`,
    description: `Latest ${category.name} news and updates from Akikouwa.`,
    openGraph: {
      type: "website",
      url: `${siteUrl}/category/${slug}`,
      title: `${category.name} News — Akikouwa`,
      description: `Latest ${category.name} news and updates from Akikouwa.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} News — Akikouwa`,
      description: `Latest ${category.name} news and updates from Akikouwa.`,
    },
    alternates: {
      canonical: `${siteUrl}/category/${slug}`,
    },
  };
}

const categoryBorderColors: Record<string, string> = {
  world: "bg-blue-500",
  politics: "bg-red-500",
  business: "bg-amber-500",
  sports: "bg-green-500",
  technology: "bg-purple-500",
  entertainment: "bg-pink-500",
  health: "bg-teal-500",
  science: "bg-orange-500",
};

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");

  const category = await getCategory(slug);
  if (!category) notFound();

  const { posts, total, pages } = await getCachedCategoryPosts(
    category.id,
    page,
  );

  const accentColor = categoryBorderColors[slug] ?? "bg-primary";

  return (
    <main className="mx-auto px-4 py-10 pb-16 max-w-7xl">
      {/* Category header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-1 h-8 rounded-full ${accentColor}`} />
          <h1 className="font-semibold text-3xl">{category.name}</h1>
        </div>
        <p className="ml-4 text-muted-foreground text-sm">
          {total} {total === 1 ? "article" : "articles"}
        </p>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 py-24">
          <p className="text-muted-foreground text-base">
            No articles published in {category.name} yet
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
                  <Link href={`/category/${slug}?page=${page - 1}`}>
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
                      <Link href={`/category/${slug}?page=${p}`}>{p}</Link>
                    ) : (
                      <span>{p}</span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Next */}
              {page < pages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/category/${slug}?page=${page + 1}`}>Next</Link>
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
