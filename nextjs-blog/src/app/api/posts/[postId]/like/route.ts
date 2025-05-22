import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user: {
    username: string;
    profileImage: string | null;
    name: string | null;
  };
}

// GET /api/posts/[postId]/like
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const likes = await prisma.$queryRaw<Like[]>`
      SELECT l.*, 
        u.username, u."profileImage", u.name
      FROM "Like" l
      JOIN "User" u ON l."userId" = u.id
      WHERE l."postId" = ${params.postId}
    `;

    const userLike = likes.find((like: Like) => like.userId === session.user.id);

    return NextResponse.json({
      likes,
      userLike: userLike ? true : false,
      likeCount: likes.length,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/like
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already liked the post
    const existingLike = await prisma.$queryRaw<Like[]>`
      SELECT * FROM "Like"
      WHERE "postId" = ${params.postId}
      AND "userId" = ${session.user.id}
    `;

    if (existingLike.length > 0) {
      // Unlike the post
      await prisma.$executeRaw`
        DELETE FROM "Like"
        WHERE id = ${existingLike[0].id}
      `;

      const updatedLikes = await prisma.$queryRaw<Like[]>`
        SELECT l.*, 
          u.username, u."profileImage", u.name
        FROM "Like" l
        JOIN "User" u ON l."userId" = u.id
        WHERE l."postId" = ${params.postId}
      `;

      return NextResponse.json({
        likes: updatedLikes,
        userLike: false,
        likeCount: updatedLikes.length,
      });
    }

    // Like the post
    await prisma.$executeRaw`
      INSERT INTO "Like" ("id", "postId", "userId", "createdAt")
      VALUES (gen_random_uuid(), ${params.postId}, ${session.user.id}, NOW())
    `;

    const updatedLikes = await prisma.$queryRaw<Like[]>`
      SELECT l.*, 
        u.username, u."profileImage", u.name
      FROM "Like" l
      JOIN "User" u ON l."userId" = u.id
      WHERE l."postId" = ${params.postId}
    `;

    return NextResponse.json({
      likes: updatedLikes,
      userLike: true,
      likeCount: updatedLikes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
} 