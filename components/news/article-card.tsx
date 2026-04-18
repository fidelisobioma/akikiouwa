import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { extractFirstImage } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
}

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: string | null;
  category: Category | null;
  author: { name: string | null };
  variant?: "default" | "horizontal" | "minimal";
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
}: {
  content: string;
  category: Category | null;
  className?: string;
  sizes?: string;
}) {
  const imageUrl = extractFirstImage(content);
  const slug = category?.slug ?? "world";
  const bgColor = categoryColors[slug] ?? "bg-muted";
  const textColor = categoryTextColors[slug] ?? "text-muted-foreground";

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        <Image
          src={imageUrl}
          alt={category?.name ?? "Article image"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes={sizes ?? "100vw"}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${bgColor} rounded-lg ${className}`}
    >
      <span className={`text-sm font-medium ${textColor}`}>
        {category?.name ?? "News"}
      </span>
    </div>
  );
}

function DefaultCard({
  title,
  slug,
  content,
  publishedAt,
  category,
  author,
}: ArticleCardProps) {
  return (
    <Link href={`/news/${slug}`} className="group flex flex-col gap-3">
      <ArticleImage
        content={content}
        category={category}
        className="w-full h-48"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="flex flex-col gap-2">
        {category && (
          <Badge variant="outline" className="w-fit text-xs">
            {category.name}
          </Badge>
        )}
        <h3 className="font-medium group-hover:text-primary text-base line-clamp-2 leading-snug transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {author.name && <span>{author.name}</span>}
          {author.name && publishedAt && <span>·</span>}
          {publishedAt && (
            <span>
              {formatDistanceToNow(new Date(publishedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function HorizontalCard({
  title,
  slug,
  content,
  publishedAt,
  category,
  author,
}: ArticleCardProps) {
  return (
    <Link href={`/news/${slug}`} className="group flex items-start gap-3">
      <ArticleImage
        content={content}
        category={category}
        className="w-24 h-20 shrink-0"
        sizes="96px"
      />
      <div className="flex flex-col flex-1 gap-1.5 min-w-0">
        {category && (
          <Badge variant="outline" className="w-fit text-xs">
            {category.name}
          </Badge>
        )}
        <h3 className="font-medium group-hover:text-primary text-sm line-clamp-2 leading-snug transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {author.name && <span>{author.name}</span>}
          {author.name && publishedAt && <span>·</span>}
          {publishedAt && (
            <span>
              {formatDistanceToNow(new Date(publishedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function MinimalCard({ title, slug, publishedAt, category }: ArticleCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className="group flex flex-col gap-1.5 py-3 last:border-0 border-b"
    >
      {category && (
        <Badge variant="outline" className="w-fit text-xs">
          {category.name}
        </Badge>
      )}
      <h3 className="font-medium group-hover:text-primary text-sm line-clamp-2 leading-snug transition-colors">
        {title}
      </h3>
      {publishedAt && (
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
        </span>
      )}
    </Link>
  );
}

export function ArticleCard(props: ArticleCardProps) {
  const { variant = "default" } = props;
  if (variant === "horizontal") return <HorizontalCard {...props} />;
  if (variant === "minimal") return <MinimalCard {...props} />;
  return <DefaultCard {...props} />;
}
