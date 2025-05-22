"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CommentForm from "./CommentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface CommentListProps {
  comments: Comment[];
  postId: string;
  onCommentUpdated: () => void;
}

export default function CommentList({
  comments,
  postId,
  onCommentUpdated,
}: CommentListProps) {
  const { session } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    setIsDeleting(commentToDelete);
    try {
      const response = await fetch(`/api/comments?id=${commentToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete comment");
      }

      onCommentUpdated();
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete comment. Please try again.");
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar className="h-10 w-10">
              {comment.user.profileImage ? (
                <AvatarImage src={comment.user.profileImage} />
              ) : (
                <AvatarFallback>
                  {getInitials(comment.user.name, comment.user.username)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {comment.user.name || comment.user.username}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {session?.user?.id === comment.userId && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCommentId(comment.id)}
                      disabled={isDeleting === comment.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isDeleting === comment.id}
                    >
                      {isDeleting === comment.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <CommentForm
                    postId={postId}
                    editComment={{ id: comment.id, content: comment.content }}
                    onCommentAdded={onCommentUpdated}
                    onEditComplete={() => setEditingCommentId(null)}
                  />
                </div>
              ) : (
                <p className="mt-1">{comment.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting !== null}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 