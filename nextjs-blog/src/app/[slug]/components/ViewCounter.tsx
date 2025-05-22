import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ViewCounterProps {
  postId: string;
}

export function ViewCounter({ postId }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchViews = async () => {
      console.log("Fetching views for post:", postId);

      if (!postId) {
        console.error("No postId provided to ViewCounter");
        setError("Post ID is required");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Making API request to:", `/api/posts/${postId}/view`);
        const response = await fetch(`/api/posts/${postId}/view`);
        console.log("API Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch views");
        }

        const data = await response.json();
        console.log("API Success response:", data);
        setViewCount(data.viewCount ?? 0);
        setError(null);
      } catch (error) {
        console.error("Error fetching views:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch views");
        setViewCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViews();
  }, [postId]);

  useEffect(() => {
    const trackView = async () => {
      if (!session?.user?.id || !postId) return;

      try {
        const response = await fetch(`/api/posts/${postId}/view`, {
          method: "POST",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to track view");
        }
        const data = await response.json();
        if (data.viewCount !== undefined) {
          setViewCount(data.viewCount);
          setError(null);
        }
      } catch (error) {
        console.error("Error tracking view:", error);
        setError(error instanceof Error ? error.message : "Failed to track view");
      }
    };

    trackView();
  }, [postId, session?.user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Eye className="h-4 w-4" />
        <span>...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-1 text-red-500" title={error}>
        <Eye className="h-4 w-4" />
        <span>{viewCount?.toLocaleString() ?? "0"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-gray-500">
      <Eye className="h-4 w-4" />
      <span>{viewCount?.toLocaleString() ?? "0"}</span>
    </div>
  );
} 