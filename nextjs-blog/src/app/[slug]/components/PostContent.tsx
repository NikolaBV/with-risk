import { PortableText } from "next-sanity";
import Link from "next/link";
import type { Post } from "../../../types/sanity";
import SanityImage from "../../../components/blog/SanityImage";
import { getPostImageUrl } from "../../../lib/sanity/image";

interface PostContentProps {
  post: Post;
}

export default function PostContent({ post }: PostContentProps) {
  const postImageUrl = getPostImageUrl(post, { width: 550, height: 310 });

  const portableTextComponents = {
    types: {
      image: SanityImage,
    },
  };

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>

      <h1 className="text-4xl font-bold mb-8">
        {post.title || "Untitled Post"}
      </h1>

      <div className="prose max-w-none">
        {post.publishedAt && (
          <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        )}

        {Array.isArray(post.body) && post.body.length > 0 ? (
          <PortableText value={post.body} components={portableTextComponents} />
        ) : (
          <p>No content available for this post.</p>
        )}
      </div>
    </main>
  );
}
