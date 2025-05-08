import Link from "next/link";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

export const metadata: Metadata = {
  title: "Verify Email - My Blog",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
        <CardDescription className="text-center">
          We've sent you a verification link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p>
          Please check your email and click on the verification link to complete
          your registration.
        </p>
        <p className="text-sm text-gray-500">
          If you don't see the email, check your spam folder.
        </p>
        <div className="pt-4">
          <Link href="/auth/signin">
            <Button variant="outline" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
