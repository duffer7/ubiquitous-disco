import type { MetadataRoute } from "next";

import { siteConfig } from "@/shared/config/metadata";

/**
 * Public sitemap for Orbit. Only indexable (unauthenticated) routes are listed;
 * `/dashboard/*` and `/admin/*` are auth-guarded and excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${base}/forgot-password`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
