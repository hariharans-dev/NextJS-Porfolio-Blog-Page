import { BlogPostsPreview } from "@/components/BlogPostPreview";
import { BlogPostsPagination } from "@/components/BlogPostsPagination";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { CircleX } from "lucide-react";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

interface Params {
  slug: string;
}

// export async function generateMetadata({ params }: { params: Params }) {
//   const { slug } = params;
//   return {
//     title: `#${slug}`,
//     description: `Posts tagged with #${slug}`,
//   };
// }

const POSTS_PER_PAGE = 6;

const Page = async ({ params, searchParams }: any) => {
  const { slug } = params;
  const pageNumber =
    typeof searchParams?.page === "string" ? parseInt(searchParams.page) : 1;

  const allPosts = getAllPosts();
  const postsByTag = allPosts.filter((post) => post.tags?.includes(slug));

  const totalPages = Math.ceil(postsByTag.length / POSTS_PER_PAGE);
  const paginatedPosts = postsByTag.slice(
    (pageNumber - 1) * POSTS_PER_PAGE,
    pageNumber * POSTS_PER_PAGE
  );

  const pagination = {
    page: pageNumber,
    limit: POSTS_PER_PAGE,
    totalPages,
    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
    prevPage: pageNumber > 1 ? pageNumber - 1 : null,
  };

  return (
    <div className="container mx-auto px-5 mb-10">
      <Link href="/blog">
        <Badge className="px-2 py-1">
          <CircleX className="inline-block w-4 h-4 mr-2" />
          Posts tagged with <strong className="mx-2">#{slug}</strong>
        </Badge>
      </Link>
      <BlogPostsPreview posts={paginatedPosts} />
      <BlogPostsPagination
        pagination={pagination}
        basePath={`/blog/tag/${slug}/?page=`}
      />
    </div>
  );
};

export default Page;
