import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";
import { Footer } from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Akikouwa — Your World, Your News",
    template: "%s — Akikouwa",
  },
  description:
    "Your World, Your News. Stay informed with the latest breaking news, analysis and updates from around the world.",
  keywords: [
    "news",
    "breaking news",
    "world news",
    "politics",
    "business",
    "sports",
    "technology",
    "entertainment",
  ],
  authors: [{ name: "Akikouwa" }],
  creator: "Akikouwa",
  publisher: "Akikouwa",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Akikouwa",
    title: "Akikouwa — Your World, Your News",
    description:
      "Stay informed with the latest breaking news, analysis and updates from around the world.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akikouwa — Your World, Your News",
    description:
      "Stay informed with the latest breaking news, analysis and updates from around the world.",
    creator: "@akikouwa",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthSessionProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
