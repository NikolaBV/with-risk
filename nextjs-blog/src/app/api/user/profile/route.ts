// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserProfile, updateUserProfile } from "@/lib/services/userService";
import { profileSchema } from "@/lib/validations/auth";

// GET /api/user/profile - Get current user profile
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate request body
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid profile data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Check if username is already taken (if changing username)
    const currentProfile = await getUserProfile(userId);
    if (currentProfile?.username !== body.username && prisma) {
      const existingUserWithUsername = await prisma.user.findUnique({
        where: { username: body.username },
      });

      if (existingUserWithUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Update profile
    const updatedProfile = await updateUserProfile(
      userId,
      validationResult.data
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
