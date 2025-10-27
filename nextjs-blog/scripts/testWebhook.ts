// Test script to verify webhook functionality
import { syncPostFromSanity, deletePostBySanityId } from "../src/lib/services/postSync";

async function testWebhook() {
  console.log("Testing webhook functionality...");
  
  try {
    // Test with a sample Sanity post ID
    // You can replace this with an actual post ID from your Sanity studio
    const testPostId = "sample-post-id";
    
    console.log(`Testing sync for post ID: ${testPostId}`);
    const result = await syncPostFromSanity(testPostId);
    
    if (result) {
      console.log("✅ Post sync successful:", {
        id: result.id,
        title: result.title,
        slug: result.slug,
        sanityId: result.sanityId
      });
    } else {
      console.log("⚠️ Post sync returned null (post might not exist or have no slug)");
    }
    
    console.log("Webhook test completed successfully!");
  } catch (error) {
    console.error("❌ Webhook test failed:", error);
  }
}

// Run the test
testWebhook().catch(console.error);
