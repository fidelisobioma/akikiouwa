import { Skeleton } from "@/components/ui/skeleton";

export function ArticleSkeleton() {
  return (
    <main className="pb-16">
      <article className="mx-auto px-4 pt-10 max-w-2xl">
        {/* Category badge */}
        <Skeleton className="mb-4 rounded-full w-20 h-5" />

        {/* Title */}
        <Skeleton className="mb-2 w-full h-10" />
        <Skeleton className="mb-4 w-3/4 h-10" />

        {/* Meta */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="rounded-full w-4 h-4" />
          <Skeleton className="w-28 h-4" />
          <Skeleton className="rounded-full w-4 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="rounded-md w-20 h-8" />
          <Skeleton className="rounded-md w-24 h-8" />
          <Skeleton className="rounded-md w-24 h-8" />
          <Skeleton className="rounded-md w-24 h-8" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <div className="my-4">
            <Skeleton className="rounded-lg w-full h-48" />
          </div>
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>

        {/* Likes and comments bar */}
        <div className="flex items-center gap-4 mt-10 pt-6 border-t">
          <Skeleton className="rounded-md w-24 h-8" />
          <Skeleton className="rounded-md w-28 h-8" />
        </div>
      </article>

      {/* Related articles */}
      <section className="mx-auto mt-16 px-4 pt-10 border-t max-w-7xl">
        <Skeleton className="mb-6 w-36 h-6" />
        <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="rounded-lg w-full h-48" />
              <Skeleton className="rounded-full w-20 h-4" />
              <Skeleton className="w-full h-5" />
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-24 h-3" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
