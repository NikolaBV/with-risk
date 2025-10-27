// Enhanced database connection test with detailed error reporting
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) || 'NOT_SET',
    },
    tests: [] as Array<{name: string, success: boolean, error?: string, details?: any}>
  };

  // Test 1: Basic Prisma connection
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    results.tests.push({ name: "Basic Prisma Query", success: true });
  } catch (error) {
    results.tests.push({ 
      name: "Basic Prisma Query", 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      details: error
    });
  }

  // Test 2: Check if we can connect to the database
  try {
    const postCount = await prisma.post.count();
    results.tests.push({ 
      name: "Post Count Query", 
      success: true, 
      details: { postCount } 
    });
  } catch (error) {
    results.tests.push({ 
      name: "Post Count Query", 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      details: error
    });
  }

  // Test 3: Try to create a test record
  try {
    const testPost = await prisma.post.create({
      data: {
        sanityId: `test-${Date.now()}`,
        title: "Test Post",
        slug: `test-slug-${Date.now()}`,
      }
    });
    results.tests.push({ 
      name: "Create Test Post", 
      success: true, 
      details: { id: testPost.id } 
    });
    
    // Clean up
    await prisma.post.delete({ where: { id: testPost.id } });
  } catch (error) {
    results.tests.push({ 
      name: "Create Test Post", 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      details: error
    });
  }

  const allTestsPassed = results.tests.every(test => test.success);
  
  return Response.json({
    success: allTestsPassed,
    results
  }, { 
    status: allTestsPassed ? 200 : 500 
  });
}
