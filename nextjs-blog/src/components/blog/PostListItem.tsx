import Link from "next/link";
import type { Post } from "../../types/sanity";

interface PostListItemProps {
  post: Post;
}

export default function PostListItem({ post }: PostListItemProps) {
  return (
    <li className="hover:underline" key={post._id}>
      <Link href={`/${post.slug?.current}`}>
        <h2 className="text-xl font-semibold">{post.title}</h2>
        {post.publishedAt && (
          <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
        )}
      </Link>
    </li>
  );
}
