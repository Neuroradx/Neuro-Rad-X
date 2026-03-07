"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { LoginPageFallback } from "@/components/auth/login-page-fallback";
import { hasFirebaseConfig } from "@/lib/env";

const RegistrationForm = hasFirebaseConfig
  ? (dynamic(
      () =>
        import("@/components/auth/registration-form").then((m) => m.RegistrationForm),
      {
        ssr: true,
        loading: () => <LoginPageFallback />,
      }
    ) as React.ComponentType)
  : null;

export default function RegisterPage() {
  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }
  const Form = RegistrationForm;
  return (
    <Suspense fallback={<LoginPageFallback />}>
      {Form != null ? <Form /> : null}
    </Suspense>
  );
}
