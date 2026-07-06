import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

const PRIVATE = [
  "/admin",
  "/api",
  "/auth",
  "/kassa",
  "/mina-skapelser",
  "/logga-in",
  "/aterstall-losenord",
  "/order",
  "/delad",
];

// AI-/svarsmotor-crawlers (GEO) — uttryckligen tillåtna så att Snabbtryck kan
// citeras av ChatGPT, Perplexity, Google AI, Claude m.fl.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
