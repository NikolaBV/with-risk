import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    // This is a callback from Supabase auth redirect
    // Process the auth callback
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log("data from auth: " + data);

      if (error) {
        throw error;
      }

      // Redirect to dashboard on successful login
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(new URL("/auth/error", req.url));
    }
  }

  // Default response for other GET requests
  return NextResponse.json({ message: "Auth API route" });
}
