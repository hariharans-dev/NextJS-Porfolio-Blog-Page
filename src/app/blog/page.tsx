import { BlogPostsPreview } from "@/components/BlogPostPreview";
import { BlogPostsPagination } from "@/components/BlogPostsPagination";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAllPosts, Post } from "@/lib/posts";

const POSTS_PER_PAGE = 6;

const Page = async () => {
  const allPosts: Post[] = getAllPosts();

  // Pagination
  const page = 1; // default first page, no searchParams used
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = allPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  const pagination = {
    page,
    limit: POSTS_PER_PAGE,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };

  return (
    <div className="container mx-auto px-5 mb-10">
      <BlogPostsPreview posts={paginatedPosts} />
      <BlogPostsPagination pagination={pagination} />
    </div>
  );
};

export default Page;
