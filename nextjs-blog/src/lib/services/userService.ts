import { prisma } from "../prisma";
import { supabase } from "../supabase";

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  bio?: string | null;
  profileImage?: string | null;
  name?: string | null;
  role?: "USER" | "ADMIN";
  createdAt?: Date;
  updatedAt?: Date | null;
};

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    // Don't allow updating id or email through this function
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.email;

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
}

export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-content")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from("user-content")
      .getPublicUrl(filePath);

    if (!data.publicUrl) throw new Error("Failed to get public URL");

    // Update user profile with new image URL
    await updateUserProfile(userId, { profileImage: data.publicUrl });

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // Prisma will handle cascading deletes based on your schema
    await prisma.user.delete({ where: { id: userId } });

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
