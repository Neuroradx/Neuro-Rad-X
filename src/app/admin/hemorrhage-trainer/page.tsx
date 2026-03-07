"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Placeholder for obsolete hemorrhage-trainer route. Redirects to admin dashboard.
 */
export default function AdminHemorrhageTrainerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return null;
}
