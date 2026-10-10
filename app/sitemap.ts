import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/seo/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap();
}
