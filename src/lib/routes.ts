// Delad lista över alla publika, indexerbara rutter.
// Används av sitemap.ts och IndexNow så att de aldrig glider isär.

import { LANDINGS } from "./landings";
import { GUIDES } from "./guides";

export interface PublicRoute {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

export function publicRoutes(): PublicRoute[] {
  return [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/designa", priority: 0.9, changeFrequency: "monthly" },
    { path: "/mallar", priority: 0.8, changeFrequency: "weekly" },
    { path: "/lag", priority: 0.8, changeFrequency: "monthly" },
    { path: "/sa-funkar-det", priority: 0.7, changeFrequency: "monthly" },
    { path: "/guider", priority: 0.7, changeFrequency: "weekly" },
    { path: "/ark", priority: 0.7, changeFrequency: "monthly" },
    { path: "/bulkpris", priority: 0.6, changeFrequency: "monthly" },
    { path: "/butik", priority: 0.5, changeFrequency: "monthly" },
    { path: "/omdomen", priority: 0.5, changeFrequency: "weekly" },
    { path: "/kontakt", priority: 0.4, changeFrequency: "yearly" },
    { path: "/kopvillkor", priority: 0.3, changeFrequency: "yearly" },
    { path: "/integritetspolicy", priority: 0.3, changeFrequency: "yearly" },
    ...LANDINGS.map((l) => ({
      path: `/for/${l.slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...GUIDES.map((g) => ({
      path: `/guider/${g.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
  ];
}
