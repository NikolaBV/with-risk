import SignInForm from "@/app/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In - My Blog",
  description: "Sign in to your blog account",
};

export default function SignInPage() {
  return (
    <div className="container mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
