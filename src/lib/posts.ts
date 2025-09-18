// lib/posts.ts
import fs from "fs";
import path from "path";
import { format } from "date-fns";
import matter from "gray-matter";

export interface Post {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  tags?: string[];
  author?: {
    name?: string;
    image?: string;
  };
  content: string; // ← add this
}

export function getAllPosts(): Post[] {
  const postsDir = path.join(process.cwd(), "content/posts");
  const files = fs.readdirSync(postsDir);

  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(postsDir, file), "utf8");
      const { data } = matter(source);

      return {
        title: data.title,
        description: data.description || "",
        slug: data.slug,
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt,
        image: data.image || undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: {
          name: data.author?.name ?? undefined,
          image: data.author?.image ?? undefined,
        },
      } as Post;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(process.cwd(), "content", "posts", `${slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");
  return matter(source);
}

export function getLatestPost(): Post | null {
  const posts = getAllPosts();
  return posts.length > 0 ? posts[0] : null;
}

export function generateEmailPreview(host?: string): string {
  const post = getLatestPost();
  if (!post) {
    return "<p>No posts available.</p>";
  }

  const baseUrl =
    host && host.startsWith("http")
      ? host
      : `https://${host || process.env.SITE_URL || "example.com"}`;

  const postUrl = `${baseUrl}/blog/blogpage/${post.slug}`;
  const date = post.publishedAt
    ? format(new Date(post.publishedAt), "dd MMMM yyyy")
    : "Unknown date";

  // Ensure public URL for image
  const postImage = post.image
    ? `${baseUrl}${
        post.image.startsWith("/") ? post.image : `/images/posts/${post.image}`
      }`
    : `${baseUrl}/images/posts/placeholder.png`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width:600px; margin:auto; background:#ffffff; border-radius:8px;">
    <tr>
      <td style="padding:16px;">
        <!-- Image -->

        <!-- Title -->
        <h2 style="font-size:24px; font-weight:bold; margin:16px 0 8px;">
          <a href="${postUrl}" style="color:#000000; text-decoration:none;">${
    post.title
  }</a>
        </h2>

        <!-- Date -->
        <p style="font-size:14px; font-style:italic; color:#666; margin:0 0 12px;">${date}</p>

        <!-- Description -->
        ${
          post.description
            ? `<p style="font-size:16px; color:#333; line-height:1.5; margin-bottom:12px;">${post.description}</p>`
            : ""
        }

        <!-- Tags -->
        ${
          post.tags && post.tags.length > 0
            ? `<p style="font-size:14px; color:#555; margin:8px 0;">
                ${post.tags
                  .map(
                    (tag) =>
                      `<a href="${baseUrl}/blog/tag/${encodeURIComponent(
                        tag
                      )}" style="color:#0070f3; text-decoration:none; margin-right:8px;">#${tag}</a>`
                  )
                  .join("")}
              </p>`
            : ""
        }

        <!-- CTA Button -->
        <a href="${postUrl}" 
           style="display:inline-block; margin-top:16px; padding:12px 20px; background-color:#0070f3; color:#ffffff; font-weight:bold; text-decoration:none; border-radius:6px;">
          Read More
        </a>
      </td>
    </tr>
  </table>
  `;
}
