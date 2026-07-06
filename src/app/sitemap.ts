import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/designa", priority: 0.9, changeFrequency: "monthly" },
    { path: "/lag", priority: 0.8, changeFrequency: "monthly" },
    { path: "/ark", priority: 0.7, changeFrequency: "monthly" },
    { path: "/bulkpris", priority: 0.6, changeFrequency: "monthly" },
    { path: "/butik", priority: 0.5, changeFrequency: "monthly" },
  ];
  return routes.map((r) => ({
    url: new URL(r.path, SITE.url).toString(),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
