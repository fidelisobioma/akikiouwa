import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="mx-auto px-4 py-8 max-w-7xl">
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Main story skeleton */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="rounded-xl w-full h-72 lg:h-96" />
          <div className="flex flex-col gap-3">
            <Skeleton className="rounded-full w-20 h-4" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-3/4 h-8" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-32 h-3" />
            </div>
          </div>
        </div>

        {/* Sidebar stories skeleton */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex flex-col gap-3">
                <Skeleton className="rounded-lg w-full h-32" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="rounded-full w-16 h-3" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-2/3 h-4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-3" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                </div>
              </div>
              {i < 2 && <div className="mt-4 border-b" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
