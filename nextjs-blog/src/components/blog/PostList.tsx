import type { Post } from "../../types/sanity";
import PostListItem from "./PostListItem";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p>No posts found.</p>;
  }

  return (
    <ul className="flex flex-col gap-y-4">
      {posts.map((post) => (
        <PostListItem key={post._id} post={post} />
      ))}
    </ul>
  );
}
