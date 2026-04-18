import { Skeleton } from "@/components/ui/skeleton";

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="rounded-lg w-full h-48" />
      <div className="flex flex-col gap-2">
        <Skeleton className="rounded-full w-20 h-4" />
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-3/4 h-5" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
    </div>
  );
}

export function ArticleCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
