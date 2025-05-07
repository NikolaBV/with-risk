// src/app/api/webhooks/sanity/route.ts
import { NextResponse } from "next/server";
import { syncPostFromSanity } from "@/lib/services/postSync";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const results = [];

    // Process each changed document
    for (const id of body.ids) {
      if (body.operation === "delete") {
        // For simplicity, we're not handling deletions
        results.push({ id, operation: "delete", status: "ignored" });
      } else {
        // Handle create/update
        const result = await syncPostFromSanity(id);
        results.push({
          id,
          operation: body.operation,
          status: result ? "processed" : "failed",
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
