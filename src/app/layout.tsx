import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { I18nProvider } from "@/i18n/provider";
import { getLocale, getMessages } from "@/i18n/server";
import { metadata as siteMetadata, softwareAppJsonLd } from "@/shared/config/metadata";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const t = getMessages();

// Site-wide SEO metadata (Open Graph, Twitter, robots, keywords, icons).
export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} className={inter.variable}>
      <body className="min-h-screen font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white"
        >
          {t.errors.skipToContent}
        </a>
        {/* SoftwareApplication structured data for rich search results. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        />
        <I18nProvider locale={getLocale()}>{children}</I18nProvider>
      </body>
    </html>
  );
}
