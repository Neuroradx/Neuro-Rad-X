"use client";

import React from "react";
import dynamic from "next/dynamic";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { hasFirebaseConfig } from "@/lib/env";

const PendingApprovalContent = hasFirebaseConfig
  ? (dynamic(
      () =>
        import("./pending-approval-content").then(
          (m) => m.PendingApprovalContent
        ),
      { ssr: true }
    ) as React.ComponentType)
  : null;

export default function PendingApprovalPage() {
  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }
  const Content = PendingApprovalContent;
  return Content != null ? <Content /> : null;
}
