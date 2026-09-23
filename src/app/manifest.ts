import type { MetadataRoute } from "next";

/**
 * Web app manifest for Orbit — enables install-to-home-screen and controls
 * the PWA chrome color (matches the dark surface palette).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orbit — Customer Operations Platform",
    short_name: "Orbit",
    description:
      "Manage users, monitor activity, and operate your SaaS product from a single command center.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#09090B",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
