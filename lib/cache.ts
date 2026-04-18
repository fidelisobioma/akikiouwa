import { unstable_cache } from "next/cache";
import prisma from "./prisma";

const HOMEPAGE_CATEGORIES = ["world", "politics", "business", "sports"];

// ── Featured posts (hero section) ──────────────────────────────
export const getCachedFeaturedPosts = unstable_cache(
  async () => {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        publishedAt: true,
        category: {
          select: { name: true, slug: true },
        },
        author: {
          select: { name: true },
        },
      },
    });
  },
  ["featured-posts"],
  { revalidate: 300, tags: ["posts"] },
);

// ── Latest posts ────────────────────────────────────────────────
export const getCachedLatestPosts = unstable_cache(
  async () => {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip: 4,
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        publishedAt: true,
        category: {
          select: { name: true, slug: true },
        },
        author: {
          select: { name: true },
        },
      },
    });
  },
  ["latest-posts"],
  { revalidate: 300, tags: ["posts"] },
);

// ── Posts by category (homepage sections) ───────────────────────
export const getCachedPostsByCategory = unstable_cache(
  async () => {
    const categoriesWithPosts = await Promise.all(
      HOMEPAGE_CATEGORIES.map(async (slug) => {
        return await prisma.category.findUnique({
          where: { slug },
          select: {
            id: true,
            name: true,
            slug: true,
            posts: {
              where: { published: true },
              orderBy: { publishedAt: "desc" },
              take: 3,
              select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                publishedAt: true,
                author: {
                  select: { name: true },
                },
              },
            },
          },
        });
      }),
    );
    return categoriesWithPosts.filter(
      (category) => category && category.posts.length > 0,
    );
  },
  ["posts-by-category"],
  { revalidate: 300, tags: ["posts", "categories"] },
);

// ── Single article ──────────────────────────────────────────────
export const getCachedPost = unstable_cache(
  async (slug: string) => {
    return await prisma.post.findUnique({
      where: { slug, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { name: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  },
  ["post"],
  { revalidate: 600, tags: ["posts"] },
);

// ── Related posts ───────────────────────────────────────────────
export const getCachedRelatedPosts = unstable_cache(
  async (categoryId: string, excludeSlug: string) => {
    return await prisma.post.findMany({
      where: {
        published: true,
        categoryId,
        NOT: { slug: excludeSlug },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        publishedAt: true,
        category: {
          select: { name: true, slug: true },
        },
        author: {
          select: { name: true },
        },
      },
    });
  },
  ["related-posts"],
  { revalidate: 600, tags: ["posts"] },
);

// ── Category page posts ─────────────────────────────────────────
export const getCachedCategoryPosts = unstable_cache(
  async (categoryId: string, page: number) => {
    const ARTICLES_PER_PAGE = 9;
    const skip = (page - 1) * ARTICLES_PER_PAGE;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { published: true, categoryId },
        orderBy: { publishedAt: "desc" },
        skip,
        take: ARTICLES_PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          publishedAt: true,
          category: {
            select: { name: true, slug: true },
          },
          author: {
            select: { name: true },
          },
        },
      }),
      prisma.post.count({
        where: { published: true, categoryId },
      }),
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / ARTICLES_PER_PAGE),
    };
  },
  ["category-posts"],
  { revalidate: 300, tags: ["posts"] },
);

// ── All news page posts ─────────────────────────────────────────
export const getCachedAllPosts = unstable_cache(
  async (page: number) => {
    const ARTICLES_PER_PAGE = 9;
    const skip = (page - 1) * ARTICLES_PER_PAGE;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: ARTICLES_PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          publishedAt: true,
          category: {
            select: { name: true, slug: true },
          },
          author: {
            select: { name: true },
          },
        },
      }),
      prisma.post.count({
        where: { published: true },
      }),
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / ARTICLES_PER_PAGE),
    };
  },
  ["all-posts"],
  { revalidate: 300, tags: ["posts"] },
);

// ── Navbar categories ───────────────────────────────────────────
export const getCachedNavbarCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },
  ["navbar-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

// ── Footer categories ───────────────────────────────────────────
export const getCachedFooterCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
      },
    });
  },
  ["footer-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

// ── Search posts ────────────────────────────────────────────────
export const getCachedSearchPosts = unstable_cache(
  async (query: string, page: number) => {
    const RESULTS_PER_PAGE = 9;
    const skip = (page - 1) * RESULTS_PER_PAGE;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: RESULTS_PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          publishedAt: true,
          category: {
            select: { name: true, slug: true },
          },
          author: {
            select: { name: true },
          },
        },
      }),
      prisma.post.count({
        where: {
          published: true,
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
      }),
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / RESULTS_PER_PAGE),
    };
  },
  ["search-posts"],
  { revalidate: 60, tags: ["posts"] },
);
