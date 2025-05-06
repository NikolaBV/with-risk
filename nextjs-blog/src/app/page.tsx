import { getAllPosts } from "@/lib/sanity/queries";
import PostList from "@/app/components/blog/PostList";

export default async function IndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <PostList posts={posts} />
    </main>
  );
}
