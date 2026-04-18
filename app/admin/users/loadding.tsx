import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageUsersLoading() {
  return (
    <div className="mx-auto px-4 py-10 max-w-7xl">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="mb-2 w-36 h-7" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>

      {/* Search skeleton */}
      <Skeleton className="mb-6 rounded-md w-64 h-9" />

      {/* Table skeleton */}
      <TableSkeleton columns={6} rows={10} />

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
