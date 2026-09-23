import type { MetadataRoute } from "next";

import { siteConfig } from "@/shared/config/metadata";

/**
 * Robots directives for Orbit. Authenticated areas are disallowed so they
 * never appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
