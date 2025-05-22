"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  onCommentAdded: () => void;
  editComment?: {
    id: string;
    content: string;
  };
  onEditComplete?: () => void;
}

export default function CommentForm({
  postId,
  onCommentAdded,
  editComment,
  onEditComplete,
}: CommentFormProps) {
  const { session } = useAuth();
  const [content, setContent] = useState(editComment?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Please sign in to leave a comment.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const url = "/api/comments";
      const method = editComment ? "PUT" : "POST";
      const body = editComment
        ? { id: editComment.id, content }
        : { content, postId };

      console.log('Sending request:', { url, method, body, postId });

      if (!postId && !editComment) {
        throw new Error("Post ID is missing");
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit comment");
      }

      setContent("");
      if (editComment && onEditComplete) {
        onEditComplete();
      } else {
        onCommentAdded();
      }

      toast.success(
        editComment ? "Comment updated successfully" : "Comment added successfully"
      );
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        className="min-h-[100px]"
        required
      />
      <div className="flex justify-end gap-2">
        {editComment && (
          <Button
            type="button"
            variant="outline"
            onClick={onEditComplete}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Submitting..."
            : editComment
            ? "Update Comment"
            : "Post Comment"}
        </Button>
      </div>
    </form>
  );
} 