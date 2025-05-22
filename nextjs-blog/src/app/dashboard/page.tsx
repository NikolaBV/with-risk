"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }
        setUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully!");
      router.push("/auth");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign out";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getInitials = (email?: string) => {
    if (!email) return "US";
    return email.split("@")[0].split("").slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <Icons.logout className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.user className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  User ID
                </p>
                <p className="text-sm font-mono">{user?.id}</p>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Last Sign In
                </p>
                <p className="text-sm">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Two-Factor Authentication
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Icons.lock className="h-4 w-4" />
                  Enable 2FA
                </Button>
              </div>
              <div className="h-[1px] w-full bg-border" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Password
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Icons.key className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icons.logIn className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Sign In</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}
                    </p>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-border" />
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icons.mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email_confirmed_at ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
