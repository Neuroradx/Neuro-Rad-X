"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (oobCode) {
      handleVerifyEmail(oobCode);
    } else {
      setError(
        "No verification code provided. Please check your email link."
      );
      setStatus("error");
    }
  }, [searchParams]);

  const handleVerifyEmail = async (actionCode: string) => {
    try {
      await applyActionCode(auth, actionCode);
      setStatus("success");
    } catch (err: unknown) {
      console.error("Email verification error:", err);
      const authErr = err as { code?: string };
      let errorMessage =
        "Failed to verify email. The link may be invalid or expired.";
      if (authErr.code === "auth/invalid-action-code") {
        errorMessage =
          "Invalid verification code. The link may have expired or has already been used.";
      }
      setError(errorMessage);
      setStatus("error");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Email Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        )}
        {status === "success" && (
          <Alert
            variant="default"
            className="bg-green-100/50 border-green-500 dark:bg-green-950/30 dark:border-green-600"
          >
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="font-bold text-green-800 dark:text-green-200">
              Email Verified Successfully!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your email has been verified. You can now log in to your account.
              <Button asChild className="w-full mt-4">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              {error}
              <Button asChild variant="secondary" className="w-full mt-4">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
