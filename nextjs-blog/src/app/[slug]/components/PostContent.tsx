"use client";

import { useState, useEffect } from "react";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";
import { Post, SanityImageValue } from "@/types/sanity";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import LikeButton from "./LikeButton";
import { PortableTextBlock } from "@portabletext/types";
import SanityImage from "@/app/components/blog/SanityImage";

interface PostContentProps {
  post: Post & { id: string };
  imageUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    username: string;
    profileImage: string | null;
    name: string | null;
  };
}

const components = {
  types: {
    image: ({ value }: { value: SanityImageValue }) => {
      return <SanityImage value={value} />;
    },
  },
};

export default function PostContent({ post, imageUrl }: PostContentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${post.id}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="prose prose-lg mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
      >
        ← Back to posts
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {post.author?.image && (
            <div className="relative w-10 h-10">
              <Image
                src={post.author.image}
                alt={post.author.name || "Author"}
                fill
                className="rounded-full object-cover"
                sizes="40px"
              />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">
              {post.author?.name || "Anonymous"}
            </p>
            <p className="text-sm text-gray-500">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString()
                : "Draft"}
            </p>
          </div>
        </div>
        <LikeButton postId={post.id} />
      </div>

      {imageUrl && (
        <div className="relative w-full h-[400px] mb-8">
          <Image
            src={imageUrl}
            alt={post.title || "Post image"}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <h1>{post.title}</h1>
      {post.body && (
        <div className="prose">
          <PortableText value={post.body as PortableTextBlock[]} components={components} />
        </div>
      )}

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Comments</h2>
        <CommentForm postId={post.id} onCommentAdded={fetchComments} />
        {isLoading ? (
          <p>Loading comments...</p>
        ) : (
          <CommentList
            comments={comments}
            postId={post.id}
            onCommentUpdated={fetchComments}
          />
        )}
      </div>
    </article>
  );
}
