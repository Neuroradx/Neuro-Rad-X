"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("toast.errorTitle", { defaultValue: "Something went wrong" })}</AlertTitle>
        <AlertDescription>
          {error.message || t("toast.errorDescription", { defaultValue: "An unexpected error occurred." })}
        </AlertDescription>
      </Alert>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => reset()}
      >
        {t("error.tryAgain", { defaultValue: "Try again" })}
      </Button>
    </div>
  );
}
