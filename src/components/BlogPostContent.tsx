// components/BlogPostContent.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

export type Post = {
  title: string;
  description: string;
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
  image?: string;
  tags?: string[];
  author?: {
    name?: string;
    image?: string;
  };
  content: string;
};

type Breadcrumb = {
  label: string;
  href: string;
};

export const BlogPostContent = ({
  post,
  breadcrumbs = [{ label: "Home", href: "/" }],
}: {
  post: Post;
  breadcrumbs?: Breadcrumb[];
}) => {
  return (
    <div className="prose prose-lg sm:prose-md xs:prose-sm dark:prose-invert mx-auto my-10 px-4 sm:px-6 lg:px-0 max-w-4xl">
      {/* Elegant Back Button */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 mb-10 rounded-md overflow-hidden shadow-lg">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <h1 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold">
        {post.title}
      </h1>
      <p className="mt-2 text-base sm:text-lg md:text-xl">{post.description}</p>

      <div
        className="mt-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
};
