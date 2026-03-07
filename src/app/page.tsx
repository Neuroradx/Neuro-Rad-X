"use client";

import React from "react";
import dynamic from "next/dynamic";
import { EnvSetupMessage } from "@/components/layout/env-setup-message";
import { hasFirebaseConfig } from "@/lib/env";

const HomePageContent = hasFirebaseConfig
  ? (dynamic(
      () =>
        import("./home-page-content").then((m) => m.HomePageContent),
      { ssr: true }
    ) as React.ComponentType)
  : null;

export default function HomePage() {
  if (!hasFirebaseConfig) {
    return <EnvSetupMessage />;
  }
  const Content = HomePageContent;
  return Content != null ? <Content /> : null;
}
