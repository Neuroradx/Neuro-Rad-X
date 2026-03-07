"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Placeholder for obsolete tutor-test route. Redirects to dashboard.
 */
export default function TutorTestPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
