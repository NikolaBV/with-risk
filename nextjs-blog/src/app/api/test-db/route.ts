// Test database connection
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test basic database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test if we can query posts
    const postCount = await prisma.post.count();
    
    return Response.json({
      success: true,
      message: "Database connection successful",
      postCount: postCount
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return Response.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
