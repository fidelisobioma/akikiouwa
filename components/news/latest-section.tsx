import Link from "next/link";
import { ArticleCard } from "./article-card";

interface Category {
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: string | null;
  category: Category | null;
  author: { name: string | null };
}

interface LatestSectionProps {
  posts: Post[];
}

export function LatestSection({ posts }: LatestSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto px-4 py-8 max-w-7xl">
      {/* Section header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-full w-1 h-6" />
          <h2 className="font-medium text-xl">Latest articles</h2>
        </div>
        <Link
          href="/news"
          className="text-muted-foreground hover:text-primary text-sm transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Articles grid */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <ArticleCard
            key={post.id}
            id={post.id}
            title={post.title}
            slug={post.slug}
            content={post.content}
            publishedAt={post.publishedAt}
            category={post.category}
            author={post.author}
            variant="default"
          />
        ))}
      </div>
    </section>
  );
}
