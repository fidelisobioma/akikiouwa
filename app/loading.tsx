import { HeroSkeleton } from "@/components/skeletons/hero-skeleton";
import { ArticleCardSkeletonGrid } from "@/components/skeletons/article-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main>
      {/* Hero skeleton */}
      <HeroSkeleton />

      {/* Divider */}
      <div className="mx-auto px-4 max-w-7xl">
        <div className="border-t" />
      </div>

      {/* Latest articles skeleton */}
      <section className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="rounded-full w-1 h-6" />
            <Skeleton className="w-36 h-6" />
          </div>
          <Skeleton className="w-16 h-4" />
        </div>
        <ArticleCardSkeletonGrid count={6} />
      </section>

      {/* Category sections skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <section key={i} className="mx-auto px-4 py-8 border-t max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="rounded-full w-1 h-6" />
              <Skeleton className="w-24 h-6" />
            </div>
            <Skeleton className="w-16 h-4" />
          </div>
          <ArticleCardSkeletonGrid count={3} />
        </section>
      ))}
    </main>
  );
}
