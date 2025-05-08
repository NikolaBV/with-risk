// src/app/api/user/profile-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { uploadProfileImage } from "@/lib/services/userService";

// POST /api/user/profile-image - Upload profile image
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Upload the image
    const imageUrl = await uploadProfileImage(userId, file);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
