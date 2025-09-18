// components/BlogPostPreview.tsx
"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";
import { Post } from "@/lib/posts";

export const BlogPostPreview: FunctionComponent<{ post: Post }> = ({
  post,
}) => {
  return (
    <div className="break-words">
      <Link href={`/blog/blogpage/${post.slug}`}>
        <div className="aspect-[16/9] relative">
          <Image
            alt={post.title}
            src={post.image || "/images/posts/placeholderpng"}
            className="object-cover"
            fill
          />
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-3 md:col-span-2 mt-4">
        <h2 className="font-sans font-semibold tracking-tighter text-primary text-2xl md:text-3xl">
          <Link href={`/blog/blogpage/${post.slug}`}>{post.title}</Link>
        </h2>

        <div className="prose lg:prose-lg italic tracking-tighter text-muted-foreground">
          {post.publishedAt
            ? format(new Date(post.publishedAt), "dd MMMM yyyy")
            : "Unknown date"}
        </div>

        {post.description && (
          <div className="prose lg:prose-lg leading-relaxed md:text-lg line-clamp-4 text-muted-foreground">
            {post.description}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="mr-2 inline-block">
                <Link href={`/blog/tag/${encodeURIComponent(tag)}`}>#{tag}</Link>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const BlogPostsPreview: FunctionComponent<{
  posts: Post[];
  className?: string;
}> = ({ posts, className }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No posts found.</div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-16 lg:gap-28 md:grid-cols-2 md:my-16 my-8",
        className
      )}
    >
      {posts.map((post) => (
        <BlogPostPreview key={post.slug} post={post} />
      ))}
    </div>
  );
};
