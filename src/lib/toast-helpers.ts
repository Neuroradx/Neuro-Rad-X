/**
 * Helpers to show common toast patterns without repeating variant/title.
 */

type ToastFn = (props: {
  variant?: "default" | "destructive" | "success";
  title?: string;
  description?: string;
  duration?: number;
  [key: string]: unknown;
}) => void;

type TFunction = (key: string, params?: Record<string, unknown> & { defaultValue?: string }) => string;

/**
 * Shows a destructive toast with optional custom title (defaults to translated "toast.errorTitle").
 */
export function showErrorToast(
  toast: ToastFn,
  t: TFunction,
  description: string,
  title?: string
): void {
  toast({
    variant: "destructive",
    title: title ?? t("toast.errorTitle"),
    description,
  });
}

/**
 * Shows a success toast.
 */
export function showSuccessToast(
  toast: ToastFn,
  t: TFunction,
  titleKey: string,
  descriptionKey?: string,
  params?: Record<string, string>
): void {
  toast({
    variant: "success",
    title: t(titleKey),
    description: descriptionKey ? t(descriptionKey, params as Record<string, unknown>) : undefined,
  });
}
