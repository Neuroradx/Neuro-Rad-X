
"use client";

import { useTranslation } from '@/hooks/use-translation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface NascetResultDetailsProps {
  stenosisResult: number;
}

export function NascetResultDetails({ stenosisResult }: NascetResultDetailsProps) {
  const { t } = useTranslation();

  const renderSection = (grade: 'lowGrade' | 'moderateGrade' | 'highGrade' | 'totalOcclusion') => {
    const titleKey = `nascetDetails.${grade}.title`;
    const sections = [
      { key: 'definition', titleKey: `nascetDetails.common.definitionTitle` },
      { key: 'imaging', titleKey: `nascetDetails.common.imagingTitle` },
      { key: 'implicationSymptomatic', titleKey: `nascetDetails.common.implicationSymptomaticTitle` },
      { key: 'implicationAsymptomatic', titleKey: `nascetDetails.common.implicationAsymptomaticTitle` },
    ];
    
    // Total occlusion has a different structure
    if (grade === 'totalOcclusion') {
        return (
            <div>
                <h4 className="font-semibold text-lg mt-4 mb-2">{t(`nascetDetails.common.definitionTitle`)}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t(`nascetDetails.${grade}.definition`)}</p>
                <h4 className="font-semibold text-lg mt-4 mb-2">{t(`nascetDetails.common.imagingTitle`)}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t(`nascetDetails.${grade}.imaging`)}</p>
                <h4 className="font-semibold text-lg mt-4 mb-2">{t(`nascetDetails.common.implicationTitle`)}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t(`nascetDetails.${grade}.implication`)}</p>
            </div>
        )
    }

    return (
      <div>
        {sections.map(section => (
          <React.Fragment key={section.key}>
            <h4 className="font-semibold text-lg mt-4 mb-2">{t(section.titleKey)}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t(`nascetDetails.${grade}.${section.key}`)}</p>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const getActiveGrade = (): 'lowGrade' | 'moderateGrade' | 'highGrade' | 'totalOcclusion' | null => {
    if (stenosisResult < 50) return 'lowGrade';
    if (stenosisResult >= 50 && stenosisResult <= 69.99) return 'moderateGrade';
    if (stenosisResult >= 70 && stenosisResult <= 99.99) return 'highGrade';
    if (stenosisResult >= 100) return 'totalOcclusion';
    return null;
  };
  
  const activeGrade = getActiveGrade();

  return (
    <div className="mt-8 space-y-4">
        <Accordion type="single" collapsible defaultValue={activeGrade || undefined}>
            <AccordionItem value="lowGrade">
                <AccordionTrigger className="text-xl font-bold">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        {t('nascetDetails.lowGrade.title')}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                    {renderSection('lowGrade')}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="moderateGrade">
                <AccordionTrigger className="text-xl font-bold">
                    <div className="flex items-center gap-2">
                         <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        {t('nascetDetails.moderateGrade.title')}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                    {renderSection('moderateGrade')}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="highGrade">
                <AccordionTrigger className="text-xl font-bold">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        {t('nascetDetails.highGrade.title')}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                    {renderSection('highGrade')}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="totalOcclusion">
                <AccordionTrigger className="text-xl font-bold">
                     <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {t('nascetDetails.totalOcclusion.title')}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                    {renderSection('totalOcclusion')}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{t('nascetDetails.advancements.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t('nascetDetails.advancements.bmt')}</p>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t('nascetDetails.advancements.timing')}</p>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t('nascetDetails.advancements.plaque')}</p>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t('nascetDetails.advancements.casVsCea')}</p>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t('nascetDetails.advancements.tcar')}</p>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t('nascetDetails.advancements.mdt')}</p>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground italic">{t('nascetDetails.summary')}</p>
            </CardFooter>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('nascetDetails.references.title')}</CardTitle>
            <CardDescription>{t('nascetDetails.references.intro')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p className="whitespace-pre-wrap">{t('nascetDetails.references.ref1')}</p>
              <Separator />
              <p className="whitespace-pre-wrap">{t('nascetDetails.references.ref2')}</p>
              <p className="text-xs italic mt-2">{t('nascetDetails.references.ref2note')}</p>
              <Separator />
              <p className="whitespace-pre-wrap">{t('nascetDetails.references.ref3')}</p>
          </CardContent>
        </Card>
    </div>
  );
}
