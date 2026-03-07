"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Placeholder for obsolete admin infographics list route. Redirects to public infographics.
 */
export default function AdminInfographicsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/infographics");
  }, [router]);

  return null;
}
