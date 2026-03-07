import { Loader2 } from "lucide-react";

export default function StudyLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
    </div>
  );
}
