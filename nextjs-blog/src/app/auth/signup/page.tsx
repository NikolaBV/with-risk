import SignUpForm from "@/app/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Un - My Blog",
  description: "Sign up to your blog account",
};

export default function SignUpPage() {
  return (
    <div className="container mx-auto">
      <SignUpForm />
    </div>
  );
}
