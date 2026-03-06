import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { LoginPageFallback } from "@/components/auth/login-page-fallback";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginForm />
    </Suspense>
  );
}