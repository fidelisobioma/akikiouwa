import { ArticleCardSkeletonGrid } from "@/components/skeletons/article-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <main className="mx-auto px-4 py-10 pb-16 max-w-7xl">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="rounded-full w-1 h-8" />
          <Skeleton className="w-32 h-8" />
        </div>
        <Skeleton className="ml-4 w-28 h-4" />
      </div>

      {/* Grid skeleton */}
      <ArticleCardSkeletonGrid count={9} />

      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-2 mt-10">
        <Skeleton className="rounded-md w-20 h-8" />
        <Skeleton className="rounded-md w-8 h-8" />
        <Skeleton className="rounded-md w-8 h-8" />
        <Skeleton className="rounded-md w-8 h-8" />
        <Skeleton className="rounded-md w-16 h-8" />
      </div>
    </main>
  );
}
