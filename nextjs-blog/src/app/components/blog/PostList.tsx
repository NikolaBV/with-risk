import type { Post } from "../../../types/sanity";
import PostListItem from "./PostListItem";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p>No posts found.</p>;
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostListItem key={post._id} post={post} />
      ))}
    </ul>
  );
}
