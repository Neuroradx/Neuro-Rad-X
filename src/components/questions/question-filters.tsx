
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import type { QuestionLocalization } from "@/types";
import { useTranslation } from "@/hooks/use-translation";

// Main categories for filtering. These keys should match those in `topics.*` translation keys.
const mainCategoriesForFilter = ["Head", "Spine", "Neck", "General", "Chest", "Abdomen", "Limbs"];


interface QuestionFiltersProps {
  onFilterChange: (filters: { topic: string; difficulty: string; localization: string; }) => void;
}

const difficultyOptionsList: Array<'all' | 'Easy' | 'Advanced'> = ["all", "Easy", "Advanced"];
// "Other" in UI maps to "General" in Firestore data typically.
const localizationsListForDropdown: Array<'all' | QuestionLocalization> = ["all", ...mainCategoriesForFilter, "Other"];


export function QuestionFilters({ onFilterChange }: QuestionFiltersProps) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState("all"); // Maps to main_localization, will use mainCategoriesForFilter
  const [difficulty, setDifficulty] = useState("all");
  const [localization, setLocalization] = useState("all"); // Also maps to main_localization, using mainCategoriesForFilter + "Other"
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const topicsForDropdown = useMemo(() => {
    if (!isClient) return [{ value: "all", label: t('questionFilters.allTopics') }];
    return [
        { value: "all", label: t('questionFilters.allTopics') },
        ...mainCategoriesForFilter.map(catKey => ({ 
            value: catKey, 
            label: catKey === "General" ? t('studyMode.categoryOther') : t(`topics.${catKey.toLowerCase()}` as any) 
        }))
    ];
  }, [isClient, t]);

  const localizationsForDropdown = useMemo(() => {
    if (!isClient) return [{ value: "all", label: t('questionFilters.allLocalizations') }];
    return localizationsListForDropdown.map(locItem => ({
        value: locItem,
        label: locItem === "all" 
               ? t('questionFilters.allLocalizations') 
               : (locItem === "General" || locItem === "Other" 
                  ? t('studyMode.categoryOther') 
                  : t(`topics.${locItem.toLowerCase()}` as any))
    }));
  }, [isClient, t]);


  const handleApplyFilters = () => {
    // If "Other" is selected for localization, map it to "General" for the query
    const localizationToQuery = localization === "Other" ? "General" : localization;
    onFilterChange({ topic, difficulty, localization: localizationToQuery });
  };

  const handleResetFilters = () => {
    setTopic("all");
    setDifficulty("all");
    setLocalization("all");
    onFilterChange({ topic: "all", difficulty: "all", localization: "all" });
  };
  
  if (!isClient) {
    return ( 
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg shadow-sm animate-pulse">
        <div className="flex-grow h-10 bg-muted rounded-md"></div>
        <div className="flex-grow h-10 bg-muted rounded-md"></div>
        <div className="flex-grow h-10 bg-muted rounded-md"></div>
        <div className="h-10 w-24 bg-muted rounded-md"></div>
        <div className="h-10 w-24 bg-muted rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-4 border rounded-lg shadow-sm bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="topic-filter">{t('questionFilters.topicLabel')}</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic-filter">
              <SelectValue placeholder={t('questionFilters.allTopics')} />
            </SelectTrigger>
            <SelectContent>
              {topicsForDropdown.map(tItem => 
                <SelectItem key={tItem.value} value={tItem.value} className="capitalize">
                  {tItem.label}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="difficulty-filter">{t('common.difficulty')}</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty-filter">
              <SelectValue placeholder={t('difficulty.all')} />
            </SelectTrigger>
            <SelectContent>
              {difficultyOptionsList.map(dItem => 
                <SelectItem key={dItem} value={dItem} className="capitalize">
                  {dItem === "all" ? t('difficulty.all') : t(`difficulty.${dItem.toLowerCase()}` as any)}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="localization-filter">{t('questionFilters.localizationLabel')}</Label>
          <Select value={localization} onValueChange={setLocalization}>
            <SelectTrigger id="localization-filter">
              <SelectValue placeholder={t('questionFilters.allLocalizations')} />
            </SelectTrigger>
            <SelectContent>
              {localizationsForDropdown.map(locItem => 
                <SelectItem key={locItem.value} value={locItem.value} className="capitalize">
                 {locItem.label}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <Button onClick={handleApplyFilters}><Filter className="mr-2 h-4 w-4"/> {t('questionFilters.applyButton')}</Button>
        <Button variant="outline" onClick={handleResetFilters}><X className="mr-2 h-4 w-4"/> {t('questionFilters.resetButton')}</Button>
      </div>
    </div>
  );
}
