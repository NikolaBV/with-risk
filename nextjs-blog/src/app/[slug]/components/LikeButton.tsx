"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
}

interface LikeData {
  likes: Array<{
    id: string;
    userId: string;
    user: {
      username: string;
      profileImage: string | null;
      name: string | null;
    };
  }>;
  userLike: boolean;
  likeCount: number;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [likeData, setLikeData] = useState<LikeData | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLikes();
    }
  }, [session?.user?.id, postId]);

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`);
      if (!response.ok) throw new Error("Failed to fetch likes");
      const data = await response.json();
      setLikeData(data);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLike = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to like posts");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setLikeData(data);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => toast.error("Please sign in to like posts")}
      >
        <Heart className="h-4 w-4" />
        <span>{likeData?.likeCount || 0}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 ${likeData?.userLike ? "text-red-500" : ""}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart
        className={`h-4 w-4 ${likeData?.userLike ? "fill-current" : ""}`}
      />
      <span>{likeData?.likeCount || 0}</span>
    </Button>
  );
} 