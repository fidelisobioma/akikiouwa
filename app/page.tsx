import { HeroSection } from "@/components/news/hero-section";
import { LatestSection } from "@/components/news/latest-section";
import { CategorySection } from "@/components/news/category-section";
import {
  getCachedFeaturedPosts,
  getCachedLatestPosts,
  getCachedPostsByCategory,
} from "@/lib/cache";
import { toISOString } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [featuredPosts, latestPosts, categoriesWithPosts] = await Promise.all([
    getCachedFeaturedPosts(),
    getCachedLatestPosts(),
    getCachedPostsByCategory(),
  ]);

  return (
    <main>
      {featuredPosts.length > 0 ? (
        <HeroSection
          posts={featuredPosts.map((post) => ({
            ...post,
            publishedAt: toISOString(post.publishedAt),
          }))}
        />
      ) : (
        <div className="mx-auto px-4 py-16 max-w-7xl text-center">
          <h1 className="font-medium text-muted-foreground text-2xl">
            No articles published yet
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Check back soon for the latest news
          </p>
        </div>
      )}

      {featuredPosts.length > 0 && latestPosts.length > 0 && (
        <div className="mx-auto px-4 max-w-7xl">
          <div className="border-t" />
        </div>
      )}

      {latestPosts.length > 0 && (
        <LatestSection
          posts={latestPosts.map((post) => ({
            ...post,
            publishedAt: toISOString(post.publishedAt),
          }))}
        />
      )}

      {categoriesWithPosts.length > 0 && (
        <div className="pb-16">
          {categoriesWithPosts.map((category) =>
            category ? (
              <CategorySection
                key={category.id}
                category={{
                  ...category,
                  posts: category.posts.map((post) => ({
                    ...post,
                    publishedAt: toISOString(post.publishedAt),
                  })),
                }}
              />
            ) : null,
          )}
        </div>
      )}
    </main>
  );
}
