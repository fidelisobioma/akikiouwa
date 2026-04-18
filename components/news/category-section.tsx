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
  author: { name: string | null };
}

interface CategoryWithPosts {
  id: string;
  name: string;
  slug: string;
  posts: Post[];
}

interface CategorySectionProps {
  category: CategoryWithPosts;
}

const categoryBorderColors: Record<string, string> = {
  world: "bg-blue-500",
  politics: "bg-red-500",
  business: "bg-amber-500",
  sports: "bg-green-500",
  technology: "bg-purple-500",
  entertainment: "bg-pink-500",
  health: "bg-teal-500",
  science: "bg-orange-500",
};

export function CategorySection({ category }: CategorySectionProps) {
  if (category.posts.length === 0) return null;

  const accentColor = categoryBorderColors[category.slug] ?? "bg-primary";

  // add category to each post for the ArticleCard
  const postsWithCategory = category.posts.map((post) => ({
    ...post,
    content: post.content,
    category: {
      name: category.name,
      slug: category.slug,
    },
  }));

  return (
    <section className="mx-auto px-4 py-8 border-t max-w-7xl">
      {/* Section header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 rounded-full ${accentColor}`} />
          <h2 className="font-medium text-xl">{category.name}</h2>
        </div>
        <Link
          href={`/category/${category.slug}`}
          className="text-muted-foreground hover:text-primary text-sm transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Articles grid */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {postsWithCategory.map((post) => (
          <ArticleCard key={post.id} {...post} variant="default" />
        ))}
      </div>
    </section>
  );
}
