import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

// export async function generateMetadata() {
//   return {
//     title: "Tags",
//     description: "Different blog post categories",
//   };
// }

export default async function Page() {
  const allPosts = getAllPosts();

  // collect all unique tags
  const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags ?? [])));

  return (
    <div className="container mx-auto px-5">
      <div className="mt-20 mb-12 text-center">
        <h1 className="mb-2 text-5xl font-bold">Tags</h1>
        <p className="text-lg opacity-50">List of all tags</p>
      </div>
      <div className="my-10 max-w-6xl text-balance text-center text-xl mb-48">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${encodeURIComponent(tag)}`}
            className="text-primary mr-2 inline-block"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
