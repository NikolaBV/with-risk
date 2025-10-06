{{ ... }}
import { prisma } from "@/lib/prisma";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET /api/posts/[postId]/view
export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  
  if (!postId) {
    console.error("Missing postId parameter");
    return NextResponse.json(
      { error: "Post ID is required" },
      { status: 400 }
    );
  }

  try {
    // First check if the post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      console.error(`Post not found: ${postId}`);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Use Prisma client to count views
    const count = await prisma.view.count({ where: { postId } });
    return NextResponse.json({ viewCount: count });
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
{{ ... }}
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
{{ ... }}
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user has viewed the post recently (within last 30 minutes)
    const compositeKey = { postId_userId: { postId, userId: session.user.id } } as const;
    const existing = await prisma.view.findUnique({
      where: compositeKey,
      select: { lastViewAt: true },
    });

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    if (existing?.lastViewAt) {
      const lastViewAt = new Date(existing.lastViewAt);
      if (lastViewAt > thirtyMinutesAgo) {
        const count = await prisma.view.count({ where: { postId } });
        return NextResponse.json({ viewCount: count, message: "View not counted (too soon)" });
      }

      await prisma.view.update({
        where: compositeKey,
        data: { lastViewAt: now },
      });
    } else {
      await prisma.view.create({
        data: {
          postId,
          userId: session.user.id,
          lastViewAt: now,
        },
      });
    }

    const count = await prisma.view.count({ where: { postId } });
    return NextResponse.json({ viewCount: count, message: "View counted" });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}