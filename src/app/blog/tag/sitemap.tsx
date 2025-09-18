// app/tag/sitemap.ts
import type { MetadataRoute } from "next";
import urlJoin from "url-join";
import { config } from "@/config";
import { getAllPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPosts = getAllPosts();

  // Collect all unique tags
  const tags = Array.from(
    new Set(allPosts.flatMap((post) => post.tags ?? []))
  );

  return [
    {
      url: urlJoin(config.baseUrl, "tag"),
      lastModified: new Date(),
      priority: 0.8,
    },
    ...tags.map((tag) => ({
      url: urlJoin(config.baseUrl, "tag", encodeURIComponent(tag)),
      lastModified: new Date(),
      priority: 0.8,
    })),
  ];
}
