import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageCategoriesLoading() {
  return (
    <div className="mx-auto px-4 py-10 max-w-4xl">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="mb-2 w-44 h-7" />
          <Skeleton className="w-28 h-4" />
        </div>
        <Skeleton className="rounded-md w-36 h-9" />
      </div>

      {/* Table skeleton */}
      <TableSkeleton columns={4} rows={8} />
    </div>
  );
}
