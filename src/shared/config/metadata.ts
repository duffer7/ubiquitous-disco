import type { Metadata } from "next";

/**
 * Orbit — central SEO configuration.
 *
 * A single source of truth for site-wide metadata, consumed by the root
 * layout (`src/app/layout.tsx`). Individual pages override only `title` and
 * `description`; everything else (Open Graph, Twitter, robots, icons) is
 * inherited from here.
 */
export const siteConfig = {
  name: "Orbit",
  shortName: "Orbit",
  title: "Orbit | Customer Operations Platform for SaaS Teams",
  description:
    "Orbit is a modern customer operations platform for SaaS teams. Manage users, monitor activity, control access, and gain operational insights from a single dashboard.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://orbit-app.com",
  ogImage: "/og/orbit-cover.png",
  creator: "@orbit",
  keywords: [
    "customer operations platform",
    "saas dashboard",
    "user management system",
    "customer management software",
    "customer operations center",
    "admin dashboard",
    "user analytics",
    "activity monitoring",
    "account management platform",
    "customer engagement software",
    "saas administration platform",
    "modern dashboard software",
    "customer insights platform",
    "user administration system",
    "operations management software",
  ],
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | Orbit",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: "Orbit" }],
  creator: siteConfig.creator,
  publisher: "Orbit",
  applicationName: "Orbit",
  category: "Business Software",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: "Orbit",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Orbit Customer Operations Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.creator,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: ["/favicon.ico"],
    apple: ["/apple-touch-icon.png"],
  },
  // Replace with your real verification codes before launch.
  verification: {
    google: "GOOGLE_VERIFICATION_CODE",
    yandex: "YANDEX_VERIFICATION_CODE",
  },
};

/**
 * SoftwareApplication JSON-LD structured data for rich results on the
 * landing page. Render with a `<script type="application/ld+json">` tag.
 */
export const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Orbit",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Customer Operations Platform for SaaS teams.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
} as const;
