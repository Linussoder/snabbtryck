import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { publicRoutes } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return publicRoutes().map((r) => ({
    url: new URL(r.path, SITE.url).toString(),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
