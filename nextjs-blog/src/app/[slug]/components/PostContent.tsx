"use client";

import { PortableText } from "next-sanity";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post } from "../../../types/sanity";
import SanityImage from "../../components/blog/SanityImage";
import { getPostImageUrl } from "../../../lib/sanity/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

interface PostContentProps {
  post: Post;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    profileImage: string | null;
    name: string | null;
  };
}

export default function PostContent({ post }: PostContentProps) {
  const postImageUrl = getPostImageUrl(post, { width: 550, height: 310 });
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const portableTextComponents = {
    types: {
      image: SanityImage,
    },
  };

  return (
    <div>
      <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>

        {postImageUrl && (
          <img
            src={postImageUrl}
            alt={post.title || "Post image"}
            className="aspect-video rounded-xl"
            width="550"
            height="310"
          />
        )}

        <h1 className="text-4xl font-bold mb-8">
          {post.title || "Untitled Post"}
        </h1>

        <div className="prose max-w-none">
          {post.publishedAt && (
            <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
          )}

          {Array.isArray(post.body) && post.body.length > 0 ? (
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          ) : (
            <p>No content available for this post.</p>
          )}

          <div className="mt-10 border-t pt-6">
            <h2 className="font-bold text-xl mb-6">
              Comments ({comments.length})
            </h2>

            <CommentForm postId={post.id} onCommentAdded={fetchComments} />

            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="mt-6">
                <CommentList
                  comments={comments}
                  postId={post.id}
                  onCommentUpdated={fetchComments}
                />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
