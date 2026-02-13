"use client";

import { AboutContent } from "@/components/common/about-content";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>
      <AboutContent />
    </div>
  );
}
