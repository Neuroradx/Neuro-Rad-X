"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, GraduationCap, ChevronRight, ClipboardCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { algoliaSearchClient, QUESTIONS_INDEX_NAME } from '@/lib/algolia';
import { useTranslation } from '@/hooks/use-translation';

interface SearchResult {
    objectID: string;
    questionText_en?: string;
    questionText_es?: string;
    questionText_de?: string;
    main_localization: string;
    sub_main_location?: string;
}

const HITS_PER_PAGE_INLINE = 10;

export function AlgoliaSearchBar({ variant = 'dropdown' }: { variant?: 'dropdown' | 'inline' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { language, t } = useTranslation();
    const searchRef = useRef<HTMLDivElement>(null);
    const isInline = variant === 'inline';
    const [selectedCount, setSelectedCount] = useState(1);

    useEffect(() => {
        if (isInline && results.length > 0) {
            setSelectedCount((prev) => Math.min(Math.max(1, prev), results.length));
        } else if (isInline && results.length === 0) {
            setSelectedCount(1);
        }
    }, [results, isInline]);

    // When results load, default selectedCount to all results (up to 10)
    useEffect(() => {
        if (isInline && results.length > 0) {
            setSelectedCount(results.length);
        }
    }, [results.length, isInline]);

    useEffect(() => {
        if (isInline) return;
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef, isInline]);

    useEffect(() => {
        const search = async () => {
            if (!query.trim() || !algoliaSearchClient) {
                setResults([]);
                setTotalCount(null);
                if (!isInline) setIsOpen(false);
                return;
            }

            setIsSearching(true);
            if (!isInline) setIsOpen(true);

            try {
                const { results: searchResults } = await algoliaSearchClient.search({
                    requests: [
                        {
                            indexName: QUESTIONS_INDEX_NAME,
                            query: query,
                            hitsPerPage: isInline ? HITS_PER_PAGE_INLINE : 5,
                        },
                    ],
                });

                const res = searchResults[0] as { hits: SearchResult[]; nbHits: number };
                setResults(res.hits);
                setTotalCount(res.nbHits ?? null);
            } catch (error) {
                console.error('[Algolia Search Error]:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [query, isInline]);

    const handleSelect = (questionId: string) => {
        if (!isInline) setIsOpen(false);
        setQuery('');
        router.push(`/admin/edit-question?id=${questionId}`);
    };

    const getQuestionText = (result: SearchResult) => {
        if (language === 'es') return result.questionText_es || result.questionText_en;
        if (language === 'de') return result.questionText_de || result.questionText_en;
        return result.questionText_en;
    };

    return (
        <div className="relative w-full max-w-xl mx-auto" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={t('common.searchPlaceholder' as any, { defaultValue: 'Search questions...' })}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10 h-10 w-full"
                    onFocus={() => query.trim() && setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isInline ? (
                <div className="mt-4 pt-4 border-t border-border/50">
                    {isSearching ? (
                        <div className="flex items-center justify-center p-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {totalCount != null && (
                                <p className="text-xs text-muted-foreground px-1 pb-2">
                                    {t('admin.searchQuestion.resultsCount', { count: totalCount.toString() })}
                                </p>
                            )}
                            {results.map((result) => (
                                <Card
                                    key={result.objectID}
                                    className="cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
                                    onClick={() => handleSelect(result.objectID)}
                                >
                                    <CardContent className="p-4 flex items-start gap-3 group">
                                        <GraduationCap className="h-4 w-4 text-primary opacity-70 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                                {getQuestionText(result)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-[10px] uppercase tracking-wider bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-semibold">
                                                    {result.main_localization}
                                                </span>
                                                {result.sub_main_location && (
                                                    <span className="text-[10px] text-muted-foreground truncate">
                                                        {result.sub_main_location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                                    </CardContent>
                                </Card>
                            ))}
                            <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="num-questions-session" className="text-sm font-medium">
                                        {t('admin.searchQuestion.numQuestionsLabel' as any, { defaultValue: 'Number of questions for the session' })}
                                    </Label>
                                    <Input
                                        id="num-questions-session"
                                        type="number"
                                        min={1}
                                        max={results.length}
                                        value={selectedCount}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value, 10);
                                            if (!isNaN(v)) setSelectedCount(Math.max(1, Math.min(results.length, v)));
                                        }}
                                        className="w-24"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.searchQuestion.numQuestionsHelper' as any, { max: results.length.toString(), defaultValue: `Choose 1 to ${results.length} questions.` })}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            const ids = results.slice(0, selectedCount).map((r) => r.objectID).join(',');
                                            router.push(`/study/tutor?ids=${encodeURIComponent(ids)}`);
                                        }}
                                        className="gap-2"
                                    >
                                        <GraduationCap className="h-4 w-4" />
                                        {t('admin.searchQuestion.useInTutor' as any, { defaultValue: 'Use in Tutor' })}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            const ids = results.slice(0, selectedCount).map((r) => r.objectID).join(',');
                                            router.push(`/study/exam?ids=${encodeURIComponent(ids)}`);
                                        }}
                                        className="gap-2"
                                    >
                                        <ClipboardCheck className="h-4 w-4" />
                                        {t('admin.searchQuestion.useInExam' as any, { defaultValue: 'Use in Exam' })}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : query.trim() ? (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                            {t('common.noResultsFound' as any, { defaultValue: 'No questions found.' })}
                        </div>
                    ) : null}
                </div>
            ) : isOpen && (
                <Card className="absolute z-50 w-full mt-2 shadow-2xl border-primary/20 max-h-[400px] overflow-auto">
                    <CardContent className="p-2">
                        {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-1">
                                {totalCount != null && (
                                    <p className="text-xs text-muted-foreground px-2 py-1.5 border-b">
                                        {t('admin.searchQuestion.resultsCount', { count: totalCount.toString() })}
                                    </p>
                                )}
                                {results.map((result) => (
                                    <button
                                        key={result.objectID}
                                        onClick={() => handleSelect(result.objectID)}
                                        className="w-full text-left p-3 hover:bg-accent rounded-md transition-colors flex items-start gap-3 group"
                                    >
                                        <div className="mt-1">
                                            <GraduationCap className="h-4 w-4 text-primary opacity-70" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                                {getQuestionText(result)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase tracking-wider bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-semibold">
                                                    {result.main_localization}
                                                </span>
                                                {result.sub_main_location && (
                                                    <span className="text-[10px] text-muted-foreground truncate">
                                                        {result.sub_main_location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        ) : query.trim() ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                                {t('common.noResultsFound' as any, { defaultValue: 'No questions found.' })}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
