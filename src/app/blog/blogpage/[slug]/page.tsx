import { getPostBySlug, Post } from "@/lib/posts";
import { BlogPostContent } from "@/components/BlogPostContent";
import { remark } from "remark";
import html from "remark-html";
import { Footer } from "@/components/Footer";

const Page = async ({ params }: any) => {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug[0]
    : resolvedParams.slug;

  // Fetch post by slug
  const { content, data } = getPostBySlug(slug);

  if (!data) return <div>Post not found</div>;

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  const post: Post = {
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
    content: contentHtml,
  };

  return (
    <div>
      <BlogPostContent post={post} />
    </div>
  );
};

export default Page;
