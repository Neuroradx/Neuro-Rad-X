"use client";

import React from "react";
import dynamic from "next/dynamic";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { hasFirebaseConfig } from "@/lib/env";

const ForgotPasswordContent = hasFirebaseConfig
  ? (dynamic(
      () =>
        import("./forgot-password-content").then((m) => m.ForgotPasswordContent),
      { ssr: true }
    ) as React.ComponentType)
  : null;

export default function ForgotPasswordPage() {
  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }
  const Content = ForgotPasswordContent;
  return Content != null ? <Content /> : null;
}
