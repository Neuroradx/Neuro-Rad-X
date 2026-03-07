"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "@/hooks/use-translation";

interface ErrorAlertProps {
  /** Error message to display. */
  description: string;
  /** Optional title. Defaults to translated "toast.errorTitle". */
  title?: string;
  /** Optional class name for the Alert container. */
  className?: string;
  /** Optional icon. Defaults to AlertCircle. */
  icon?: React.ReactNode;
}

/**
 * Reusable destructive Alert for error states.
 * Use instead of repeating Alert + AlertTitle + AlertDescription with toast.errorTitle.
 */
export function ErrorAlert({
  description,
  title,
  className,
  icon,
}: ErrorAlertProps) {
  const { t } = useTranslation();
  return (
    <Alert variant="destructive" className={className}>
      {icon ?? <AlertCircle className="h-4 w-4" />}
      <AlertTitle>{title ?? t("toast.errorTitle")}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
