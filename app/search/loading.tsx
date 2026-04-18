import { ArticleCardSkeletonGrid } from "@/components/skeletons/article-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <main className="mx-auto px-4 py-10 pb-16 max-w-7xl">
      {/* Header skeleton */}
      <div className="mb-10">
        <Skeleton className="mb-1 w-64 h-7" />
        <Skeleton className="w-28 h-4" />
      </div>

      {/* Grid skeleton */}
      <ArticleCardSkeletonGrid count={9} />
    </main>
  );
}
