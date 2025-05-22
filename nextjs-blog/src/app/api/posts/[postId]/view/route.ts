import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET /api/posts/[postId]/view
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  if (!params.postId) {
    console.error("Missing postId parameter");
    return NextResponse.json(
      { error: "Post ID is required" },
      { status: 400 }
    );
  }

  try {
    // First check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      console.error(`Post not found: ${params.postId}`);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    console.log("Post found:", post.id); // Debug log

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("Database connection successful"); // Debug log
    } catch (error) {
      console.error("Database connection test failed:", error);
      throw new Error("Database connection failed");
    }

    const views = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM "View"
      WHERE "postId" = ${params.postId}
    `;

    console.log("View count query result:", views); // Debug log

    return NextResponse.json({ viewCount: Number(views[0].count) });
  } catch (error) {
    console.error("Error in GET /api/posts/[postId]/view:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch views" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/view
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  if (!params.postId) {
    console.error("Missing postId parameter");
    return NextResponse.json(
      { error: "Post ID is required" },
      { status: 400 }
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      console.error("Unauthorized: No user session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      console.error(`Post not found: ${params.postId}`);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user has viewed the post recently (within last 30 minutes)
    const existingView = await prisma.$queryRaw<{ lastViewAt: Date }[]>`
      SELECT "lastViewAt"
      FROM "View"
      WHERE "postId" = ${params.postId}
      AND "userId" = ${session.user.id}
    `;

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    if (existingView.length > 0) {
      const lastViewAt = new Date(existingView[0].lastViewAt);
      
      // If the last view was less than 30 minutes ago, don't count it
      if (lastViewAt > thirtyMinutesAgo) {
        const views = await prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*) as count
          FROM "View"
          WHERE "postId" = ${params.postId}
        `;
        
        return NextResponse.json({ 
          viewCount: Number(views[0].count),
          message: "View not counted (too soon)" 
        });
      }

      // Update the lastViewAt timestamp
      await prisma.$executeRaw`
        UPDATE "View"
        SET "lastViewAt" = NOW()
        WHERE "postId" = ${params.postId}
        AND "userId" = ${session.user.id}
      `;
    } else {
      // Create a new view record
      await prisma.$executeRaw`
        INSERT INTO "View" ("id", "postId", "userId", "createdAt", "lastViewAt")
        VALUES (gen_random_uuid(), ${params.postId}, ${session.user.id}, NOW(), NOW())
      `;
    }

    // Get updated view count
    const views = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM "View"
      WHERE "postId" = ${params.postId}
    `;

    return NextResponse.json({ 
      viewCount: Number(views[0].count),
      message: "View counted" 
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
} 