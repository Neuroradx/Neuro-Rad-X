"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Placeholder for obsolete documents route. Redirects to admin dashboard.
 */
export default function AdminDocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return null;
}
