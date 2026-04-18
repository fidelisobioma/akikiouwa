import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // fetch all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      publishedAt: true,
      updatedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  // fetch all categories
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  // static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  // article pages
  const articlePages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/news/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
