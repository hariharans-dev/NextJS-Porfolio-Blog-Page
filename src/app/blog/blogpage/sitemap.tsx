import { getAllPosts } from "@/lib/posts";
import { config } from "@/config";
import type { MetadataRoute } from "next";
import urlJoin from "url-join";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();

  return [
    {
      url: urlJoin(config.baseUrl, "blog"),
      lastModified: new Date(),
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: urlJoin(config.baseUrl, "blog", post.slug),
      lastModified: new Date(post.updatedAt || post.publishedAt),
      priority: 0.8,
    })),
  ];
}
