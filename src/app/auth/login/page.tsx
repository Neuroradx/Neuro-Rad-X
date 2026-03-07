"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { LoginPageFallback } from "@/components/auth/login-page-fallback";
import { hasFirebaseConfig } from "@/lib/env";

const LoginForm = hasFirebaseConfig
  ? (dynamic(
      () => import("@/components/auth/login-form").then((m) => m.LoginForm),
      {
        ssr: true,
        loading: () => <LoginPageFallback />,
      }
    ) as React.ComponentType)
  : null;

export default function LoginPage() {
  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }
  const Form = LoginForm;
  return (
    <Suspense fallback={<LoginPageFallback />}>
      {Form != null ? <Form /> : null}
    </Suspense>
  );
}
