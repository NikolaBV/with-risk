// src/app/api/sync/posts/route.ts
import { NextResponse } from "next/server";
import { syncAllPosts, syncPostFromSanity } from "@/lib/services/postSync";

export async function POST(request: Request) {
  try {
    // Check if this is a request for a specific post
    const body = await request.json().catch(() => ({}));

    // If a specific sanity ID is provided, sync just that post
    if (body.sanityId) {
      const result = await syncPostFromSanity(body.sanityId);
      return NextResponse.json({
        success: true,
        message: "Post synced",
        post: result,
      });
    }

    // Otherwise, sync all posts
    const results = await syncAllPosts();
    return NextResponse.json({
      success: true,
      message: "All posts synced",
      count: results.length,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Sync failed",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
