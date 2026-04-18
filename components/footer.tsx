import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "./news/newsletter-form";
import { getCachedFooterCategories } from "@/lib/cache";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Latest News", href: "/news" },
  { label: "Search", href: "/search" },
];

export async function Footer() {
  const categories = await getCachedFooterCategories();

  return (
    <footer className="z-10 relative bg-muted mt-16 border-t">
      <div className="mx-auto px-4 py-12 max-w-7xl">
        {/* Top section */}
        <div className="gap-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-semibold text-primary text-xl tracking-tight"
            >
              Akikouwa
            </Link>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Your World, Your News. Stay informed with the latest breaking news
              and updates from around the world.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-medium text-sm">Categories</h3>
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 font-medium text-sm">Quick links</h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="mb-4 font-medium text-sm">Stay informed</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Get the latest news delivered to your inbox every morning.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom section */}
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Akikouwa. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary text-xs transition-colors"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary text-xs transition-colors"
            >
              Terms of use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
