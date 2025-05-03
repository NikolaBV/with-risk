import { getAllPosts } from "@/lib/sanity/queries";
import PostList from "@/components/blog/PostList";

export default async function IndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Posts</h1>
      <PostList posts={posts} />
    </main>
  );
}
