// src/app/api/webhooks/sanity/route.ts
import { NextResponse } from "next/server";
import { syncPostFromSanity, deletePostBySanityId } from "@/lib/services/postSync";

export async function POST(request: Request) {
  try {
    // Verify webhook secret from Sanity configuration
    const secretHeader = request.headers.get('x-sanity-secret');
    const configuredSecret = process.env.SANITY_WEBHOOK_SECRET || 'cebdc0f3772977e69f4536b3c9c6b3e54f6e8b60973bc5a32cd6b59a92676249';

    if (secretHeader !== configuredSecret) {
      console.log('Webhook secret mismatch:', { received: secretHeader, expected: configuredSecret });
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    console.log('Webhook payload received:', JSON.stringify(body, null, 2));

    // Handle Sanity webhook payload format
    // Based on the configuration, it sends { _id } for each operation
    const idsToSync = new Set<string>();
    const idsToDelete = new Set<string>();

    // Handle single document payload: { _id: "...", operation: "create|update|delete" }
    if (body._id && typeof body._id === 'string') {
      const operation = body.operation || 'create'; // Default to create if not specified
      if (operation === 'delete') {
        idsToDelete.add(body._id);
      } else {
        idsToSync.add(body._id);
      }
    }

    // Handle array of documents: [{ _id: "...", operation: "..." }]
    if (Array.isArray(body)) {
      for (const doc of body) {
        if (doc?._id && typeof doc._id === 'string') {
          const operation = doc.operation || 'create';
          if (operation === 'delete') {
            idsToDelete.add(doc._id);
          } else {
            idsToSync.add(doc._id);
          }
        }
      }
    }

    // Handle Sanity's transaction format
    if (body.transactionId && body.mutations) {
      for (const mutation of body.mutations) {
        if (mutation.create) {
          idsToSync.add(mutation.create._id);
        } else if (mutation.update) {
          idsToSync.add(mutation.update._id);
        } else if (mutation.delete) {
          idsToDelete.add(mutation.delete._id);
        }
      }
    }

    if (idsToSync.size === 0 && idsToDelete.size === 0) {
      console.log('No valid IDs to process in webhook payload');
      return NextResponse.json({ success: false, message: 'No valid IDs to process' }, { status: 400 });
    }

    console.log(`Processing webhook: ${idsToSync.size} to sync, ${idsToDelete.size} to delete`);

    const results: Array<{ id: string; operation: string; status: string }> = [];

    // Sync posts (create/update)
    for (const id of idsToSync) {
      try {
        const post = await syncPostFromSanity(id);
        results.push({ 
          id, 
          operation: 'upsert', 
          status: post ? 'processed' : 'failed' 
        });
        console.log(`Synced post ${id}:`, post ? 'success' : 'failed');
      } catch (error) {
        console.error(`Error syncing post ${id}:`, error);
        results.push({ 
          id, 
          operation: 'upsert', 
          status: 'error' 
        });
      }
    }

    // Delete posts
    for (const id of idsToDelete) {
      try {
        await deletePostBySanityId(id);
        results.push({ 
          id, 
          operation: 'delete', 
          status: 'processed' 
        });
        console.log(`Deleted post ${id}: success`);
      } catch (error) {
        console.error(`Error deleting post ${id}:`, error);
        results.push({ 
          id, 
          operation: 'delete', 
          status: 'error' 
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
