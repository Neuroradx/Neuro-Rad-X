import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatStatus = "ok" | "warning" | "critical";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  labelContext?: string;
  status?: StatStatus;
  href?: string;
  className?: string;
  isLoading?: boolean;
  "aria-label"?: string;
}

const statusStyles: Record<StatStatus, string> = {
  ok: "bg-emerald-500 dark:bg-emerald-600",
  warning: "bg-amber-500 dark:bg-amber-600",
  critical: "bg-red-500 dark:bg-red-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  labelContext,
  status,
  href,
  className,
  isLoading,
  "aria-label": ariaLabel,
}: StatCardProps) {
  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {status && (
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", statusStyles[status])}
              aria-hidden
            />
          )}
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-16 mb-2" />
            {(description || labelContext) && <Skeleton className="h-3 w-24" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground pt-1">{description}</p>
            )}
            {labelContext && !description && (
              <p className="text-xs text-muted-foreground pt-1">{labelContext}</p>
            )}
          </>
        )}
      </CardContent>
    </>
  );

  const card = (
    <Card
      className={cn(
        href && "transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        className
      )}
    >
      {cardContent}
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block outline-none"
        aria-label={ariaLabel}
      >
        {card}
      </Link>
    );
  }

  return card;
}
