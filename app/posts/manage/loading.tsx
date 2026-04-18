import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagePostsLoading() {
  return (
    <div className="mx-auto px-4 py-10 max-w-7xl">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="mb-2 w-40 h-7" />
          <Skeleton className="w-28 h-4" />
        </div>
        <Skeleton className="rounded-md w-32 h-9" />
      </div>

      {/* Filters skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1">
          <Skeleton className="rounded-md w-12 h-9" />
          <Skeleton className="rounded-md w-24 h-9" />
          <Skeleton className="rounded-md w-16 h-9" />
        </div>
        <Skeleton className="rounded-md w-64 h-9" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton columns={5} rows={10} />

      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Skeleton className="rounded-md w-20 h-8" />
        <Skeleton className="rounded-md w-8 h-8" />
        <Skeleton className="rounded-md w-8 h-8" />
        <Skeleton className="rounded-md w-8 h-8" />
        <Skeleton className="rounded-md w-16 h-8" />
      </div>
    </div>
  );
}
