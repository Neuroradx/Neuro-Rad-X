"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, GraduationCap, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export function AlgoliaSearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { language, t } = useTranslation();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]);

    useEffect(() => {
        const search = async () => {
            if (!query.trim() || !algoliaSearchClient) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsSearching(true);
            setIsOpen(true);

            try {
                const { results } = await algoliaSearchClient.search({
                    requests: [
                        {
                            indexName: QUESTIONS_INDEX_NAME,
                            query: query,
                            hitsPerPage: 5,
                        },
                    ],
                });

                // results is an array of SearchResponse
                const hits = (results[0] as any).hits as SearchResult[];
                setResults(hits);
            } catch (error) {
                console.error('[Algolia Search Error]:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (questionId: string) => {
        setIsOpen(false);
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

            {isOpen && (
                <Card className="absolute z-50 w-full mt-2 shadow-2xl border-primary/20 max-h-[400px] overflow-auto">
                    <CardContent className="p-2">
                        {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-1">
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
