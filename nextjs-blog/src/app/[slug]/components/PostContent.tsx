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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ViewCounter } from "./ViewCounter";

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
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose lg:prose-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {post.author?.image ? (
                <AvatarImage
                  src={post.author.image}
                  alt={post.author.name || "Author"}
                />
              ) : (
                <AvatarFallback>
                  {post.author?.name?.[0] || "A"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
              <p className="text-gray-600">
                By {post.author?.name || "Unknown"} •{" "}
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : "Draft"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ViewCounter postId={post.id} />
            <LikeButton postId={post.id} />
          </div>
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
    </main>
  );
}
