"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { Loader2 } from "lucide-react";
import { hasFirebaseConfig } from "@/lib/env";

const VerifyEmailContent = hasFirebaseConfig
  ? (dynamic(
      () =>
        import("./verify-email-content").then((m) => m.VerifyEmailContent),
      {
        ssr: true,
        loading: () => (
          <div className="flex justify-center items-center min-h-[280px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ),
      }
    ) as React.ComponentType)
  : null;

export default function VerifyEmailPage() {
  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }
  const Content = VerifyEmailContent;
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[280px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      {Content != null ? <Content /> : null}
    </Suspense>
  );
}
