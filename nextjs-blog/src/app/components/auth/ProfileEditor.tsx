"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validations/auth";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

export default function ProfileEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    username: string;
    name: string | null;
    bio: string | null;
    profileImage: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      name: "",
      bio: "",
    },
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/user/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        const profileData = {
          username: data.profile.username,
          name: data.profile.name || "",
          bio: data.profile.bio || "",
          profileImage: data.profile.profileImage,
        };

        setProfile(profileData);
        form.reset(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setProfile({
        ...profile!,
        username: data.profile.username,
        name: data.profile.name,
        bio: data.profile.bio,
      });

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
      toast.error("Update failed", {
        description: error.message || "Something went wrong",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setProfile((prev) =>
        prev ? { ...prev, profileImage: data.imageUrl } : null
      );

      toast.success("Image uploaded", {
        description: "Your profile image has been updated.",
      });
    } catch (error: any) {
      setError(error.message || "Failed to upload image");
      toast.error("Upload failed", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10">Loading profile...</div>;
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={profile?.profileImage || undefined} />
            <AvatarFallback className="text-2xl">
              {profile?.username ? profile.username[0].toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center">
            <label htmlFor="profile-image" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="relative"
              >
                {isUploading ? "Uploading..." : "Change Photo"}
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </Button>
            </label>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your display name"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself"
                      {...field}
                      value={field.value || ""}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
