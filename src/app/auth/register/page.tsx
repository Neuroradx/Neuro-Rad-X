// src/app/auth/register/page.tsx
import { Suspense } from "react";
import { RegistrationForm } from "@/components/auth/registration-form";
import { LoginPageFallback } from "@/components/auth/login-page-fallback";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <RegistrationForm />
    </Suspense>
  );
}