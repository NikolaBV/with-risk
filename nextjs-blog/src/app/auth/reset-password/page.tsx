"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Check if we have a valid reset token in the URL
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setIsValidLink(false);
        setError(
          "Invalid or expired password reset link. Please request a new one."
        );
      } else {
        setIsValidLink(true);
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!isValidLink) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password reset succesfully");

      // Redirect to signin after a brief delay
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
      toast.error("Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidLink) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Invalid Link</CardTitle>
          <CardDescription className="text-center">
            The password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Please request a new password reset link.</p>
          <div className="pt-4">
            <Link href="/auth/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Password Reset</CardTitle>
          <CardDescription className="text-center">
            Your password has been reset successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>You can now sign in with your new password.</p>
          <div className="pt-4">
            <Link href="/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Choose a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
