import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { extractFirstImage } from "@/lib/utils";

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

interface HeroSectionProps {
  posts: Post[];
}

const categoryColors: Record<string, string> = {
  world: "bg-blue-100 dark:bg-blue-950",
  politics: "bg-red-100 dark:bg-red-950",
  business: "bg-amber-100 dark:bg-amber-950",
  sports: "bg-green-100 dark:bg-green-950",
  technology: "bg-purple-100 dark:bg-purple-950",
  entertainment: "bg-pink-100 dark:bg-pink-950",
  health: "bg-teal-100 dark:bg-teal-950",
  science: "bg-orange-100 dark:bg-orange-950",
};

const categoryTextColors: Record<string, string> = {
  world: "text-blue-600 dark:text-blue-400",
  politics: "text-red-600 dark:text-red-400",
  business: "text-amber-600 dark:text-amber-400",
  sports: "text-green-600 dark:text-green-400",
  technology: "text-purple-600 dark:text-purple-400",
  entertainment: "text-pink-600 dark:text-pink-400",
  health: "text-teal-600 dark:text-teal-400",
  science: "text-orange-600 dark:text-orange-400",
};

function ArticleImage({
  content,
  category,
  className,
  sizes,
  priority = false,
}: {
  content: string;
  category: Category | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const imageUrl = extractFirstImage(content);
  const slug = category?.slug ?? "world";
  const bgColor = categoryColors[slug] ?? "bg-muted";
  const textColor = categoryTextColors[slug] ?? "text-muted-foreground";

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        <Image
          src={imageUrl}
          alt={category?.name ?? "Article image"}
          fill
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes={sizes ?? "100vw"}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${bgColor} rounded-xl ${className}`}
    >
      <span className={`text-sm font-medium ${textColor}`}>
        {category?.name ?? "News"}
      </span>
    </div>
  );
}

export function HeroSection({ posts }: HeroSectionProps) {
  if (posts.length === 0) return null;

  const [mainStory, ...sidebarStories] = posts;

  return (
    <section className="mx-auto px-4 py-8 max-w-7xl">
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        {/* Main story — takes up 2/3 width */}
        <Link
          href={`/news/${mainStory.slug}`}
          className="group flex flex-col gap-4 md:col-span-2"
        >
          <ArticleImage
            content={mainStory.content}
            category={mainStory.category}
            className="w-full h-72 lg:h-96"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority={true}
          />
          <div className="flex flex-col gap-3">
            {mainStory.category && (
              <Badge variant="outline" className="w-fit">
                {mainStory.category.name}
              </Badge>
            )}
            <h1 className="font-semibold group-hover:text-primary text-2xl lg:text-3xl leading-tight transition-colors">
              {mainStory.title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              {mainStory.author.name && <span>{mainStory.author.name}</span>}
              {mainStory.author.name && mainStory.publishedAt && <span>·</span>}
              {mainStory.publishedAt && (
                <span>
                  {formatDistanceToNow(new Date(mainStory.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Sidebar stories — takes up 1/3 width */}
        <div className="flex flex-col gap-4">
          {sidebarStories.map((post, index) => (
            <div key={post.id}>
              <Link
                href={`/news/${post.slug}`}
                className="group flex flex-col gap-3"
              >
                <ArticleImage
                  content={post.content}
                  category={post.category}
                  className="w-full h-32"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="flex flex-col gap-1.5">
                  {post.category && (
                    <Badge variant="outline" className="w-fit text-xs">
                      {post.category.name}
                    </Badge>
                  )}
                  <h2 className="font-medium group-hover:text-primary text-base line-clamp-2 leading-snug transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    {post.author.name && <span>{post.author.name}</span>}
                    {post.author.name && post.publishedAt && <span>·</span>}
                    {post.publishedAt && (
                      <span>
                        {formatDistanceToNow(new Date(post.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {index < sidebarStories.length - 1 && (
                <div className="mt-4 border-b" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
