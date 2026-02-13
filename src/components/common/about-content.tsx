
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import { Logo } from "@/components/common/logo";
import {
  Layers3, Sparkles, TrendingUp, Bookmark, NotebookText,
  Database, GraduationCap, ClipboardCheck, Users, Brain, BookOpen
} from "lucide-react";
import Link from "next/link";

export function AboutContent() {
  const { t, language } = useTranslation();

  const keyFeatures = [
    {
      icon: Database,
      titleKey: "aboutPage.keyFeaturesSection.extensiveQuestionBank.title",
      items: [
        "aboutPage.keyFeaturesSection.extensiveQuestionBank.item1",
        "aboutPage.keyFeaturesSection.extensiveQuestionBank.item2",
      ],
    },
    {
      icon: Sparkles,
      titleKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.title",
      subFeatures: [
        {
          icon: GraduationCap,
          titleKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.tutorMode.titlePart",
          descriptionKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.tutorMode.descriptionPart",
        },
        {
          icon: ClipboardCheck,
          titleKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.examMode.titlePart",
          descriptionKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.examMode.descriptionPart",
        },
        {
          icon: Layers3,
          titleKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.flashcards.titlePart",
          descriptionKey: "aboutPage.keyFeaturesSection.personalizedStudyModes.flashcards.descriptionPart",
        },
      ],
    },
    {
      icon: TrendingUp,
      titleKey: "aboutPage.keyFeaturesSection.detailedProgressTracking.title",
      items: [
        "aboutPage.keyFeaturesSection.detailedProgressTracking.item1",
        "aboutPage.keyFeaturesSection.detailedProgressTracking.item2",
        "aboutPage.keyFeaturesSection.detailedProgressTracking.item3",
      ],
    },
    {
      icon: NotebookText,
      titleKey: "aboutPage.keyFeaturesSection.organizationalTools.title",
      subFeatures: [
        {
          icon: Bookmark,
          titleKey: "aboutPage.keyFeaturesSection.organizationalTools.bookmarks.titlePart",
          descriptionKey: "aboutPage.keyFeaturesSection.organizationalTools.bookmarks.descriptionPart",
        },
        {
          icon: NotebookText,
          titleKey: "aboutPage.keyFeaturesSection.organizationalTools.myNotes.titlePart",
          descriptionKey: "aboutPage.keyFeaturesSection.organizationalTools.myNotes.descriptionPart",
        },
      ],
    },
  ];

  const whoIsItForItems = [
    {
      icon: Users,
      titleKey: "aboutPage.whoIsItForSection.medicalStudents.titlePart",
      descriptionKey: "aboutPage.whoIsItForSection.medicalStudents.descriptionPart"
    },
    {
      icon: Brain,
      titleKey: "aboutPage.whoIsItForSection.residents.titlePart",
      descriptionKey: "aboutPage.whoIsItForSection.residents.descriptionPart"
    },
    {
      icon: BookOpen,
      titleKey: "aboutPage.whoIsItForSection.radiologistsAndProfessionals.titlePart",
      descriptionKey: "aboutPage.whoIsItForSection.radiologistsAndProfessionals.descriptionPart"
    }
  ];

  const nameToLink = language === 'de' ? "Andres Pinta" : "Dr. Andres Pinta";
  const linkedInUrl = "https://www.linkedin.com/in/dr-andres-pinta";

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      <Card className="shadow-lg w-[90%] mx-auto">
        <CardHeader className="text-center bg-muted/30 pb-4 pt-6">
          <div className="flex justify-center mb-3">
            <Logo size={48} showText={false} />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{t('aboutPage.title')}</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground italic mt-1">
            {t('aboutPage.introductionSection.slogan')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-foreground leading-relaxed">
            {t('aboutPage.introductionSection.content')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg w-[90%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">{t('aboutPage.whatIsNeuroRadXSection.title')}</CardTitle>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed">
            {t('aboutPage.whatIsNeuroRadXSection.content')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg w-[90%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">{t('aboutPage.keyFeaturesSection.title')}</CardTitle>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {keyFeatures.map((feature) => (
            <div key={feature.titleKey}>
              <div className="flex items-start gap-3 mb-2">
                <feature.icon className="h-7 w-7 text-primary mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xl font-medium text-foreground">{t(feature.titleKey)}</h3>
                  {feature.items && (
                    <ul className="list-disc list-outside pl-5 text-muted-foreground space-y-1 mt-1 leading-relaxed">
                      {feature.items.map((itemKey) => (
                        <li key={itemKey}>{t(itemKey)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {feature.subFeatures && (
                <div className="ml-10 space-y-3 mt-2">
                  {feature.subFeatures.map((subFeature) => (
                    <div key={subFeature.titleKey} className="flex items-start gap-2">
                      <subFeature.icon className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-md font-medium text-foreground">
                          <strong className="inline-block">{t(subFeature.titleKey)}:</strong>
                          <span className="text-muted-foreground font-normal leading-relaxed"> {t(subFeature.descriptionKey)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg w-[90%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">{t('aboutPage.whoIsItForSection.title')}</CardTitle>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="p-6">
           <p className="text-muted-foreground leading-relaxed mb-3">{t('aboutPage.whoIsItForSection.intro')}</p>
            {whoIsItForItems.map((item) => (
                 <div key={item.titleKey} className="flex items-start gap-3 mb-3">
                    <item.icon className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                        <strong className="text-md font-medium text-foreground inline-block">{t(item.titleKey)}:</strong>
                        <p className="text-muted-foreground leading-relaxed">{t(item.descriptionKey)}</p>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg w-[90%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">{t('aboutPage.ourVisionSection.title')}</CardTitle>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed">
            {t('aboutPage.ourVisionSection.content')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg w-[90%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">{t('aboutPage.developedByLabel')}</CardTitle>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed">
            {t('aboutPage.developedBySection.content').split(nameToLink)[0]}
            <Link href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
              {nameToLink}
            </Link>
            {t('aboutPage.developedBySection.content').split(nameToLink)[1]}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
