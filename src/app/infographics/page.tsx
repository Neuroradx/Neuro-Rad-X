'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, Loader2, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Infographic } from "@/types";
import { useTranslation } from '@/hooks/use-translation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { autoCreateOrUpdateInfographics } from '@/actions/infographic-actions';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const ITEMS_PER_PAGE = 10;

const formatTimestamp = (timestamp: any): string => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return 'Date not available';
  }
  try {
    const date = (timestamp as Timestamp).toDate();
    return format(date, "MMMM d, yyyy");
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return 'Invalid Date';
  }
};

export default function InfographicsPage() {
    const { t } = useTranslation();
    const [infographics, setInfographics] = useState<Infographic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchInfographics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        await autoCreateOrUpdateInfographics();

        try {
            const infographicsCollection = collection(db, 'infographics');
            const q = query(infographicsCollection, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedInfographics = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Infographic[];
            
            setInfographics(fetchedInfographics);
        } catch (err: any) {
            console.error("Failed to fetch infographics:", err);
            setError("Failed to load infographics. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInfographics();
    }, [fetchInfographics]);

    const filteredInfographics = useMemo(() => {
        return infographics.filter(infographic =>
            infographic.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [infographics, searchTerm]);

    const totalPages = Math.ceil(filteredInfographics.length / ITEMS_PER_PAGE);

    const paginatedInfographics = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredInfographics.slice(startIndex, endIndex);
    }, [filteredInfographics, currentPage]);
    
    // Reset to page 1 if current page becomes invalid after filtering
    useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
    }, [currentPage, totalPages]);


    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">{t('nav.infographics')}</h1>
            </div>
            <p className="text-muted-foreground mb-8">
                {t('infographics.pageDescription', { 
                    defaultValue: 'Explore our collection of detailed infographics covering key neuroradiology topics.' 
                })}
            </p>

            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={t('infographics.searchPlaceholder', { defaultValue: 'Search infographics...' })}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="pl-10 w-full max-w-sm"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('error.title', { defaultValue: 'Error' })}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : paginatedInfographics.length === 0 ? (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('infographics.noInfographicsTitle', { defaultValue: 'No Infographics Found' })}</AlertTitle>
                    <AlertDescription>
                        {searchTerm ? "No infographics match your search. Try a different term." : t('infographics.noInfographicsDescription', { defaultValue: 'Check back later for new content.' })}
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                <div className="w-full max-w-3xl mx-auto border-t">
                    {paginatedInfographics.map((infographic) => (
                       <div key={infographic.id} className="border-b p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                            <div>
                                <Link href={`/infographics/${infographic.id}`} className="group">
                                    <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                        {infographic.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Created: {formatTimestamp(infographic.createdAt)}
                                    </p>
                                </Link>
                            </div>
                            <div className="flex items-center gap-1">
                                <a href={`/view-infographics/${infographic.id}`} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                                    <Button variant="ghost" size="icon" aria-label={`Open ${infographic.title} in new tab`}>
                                        <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                    </Button>
                                </a>
                                <Link href={`/infographics/${infographic.id}`} passHref title="View infographic">
                                    <Button variant="outline" size="icon" aria-label={`View ${infographic.title}`}>
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous', { defaultValue: 'Previous' })}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {t('pagination.page', { defaultValue: 'Page' })} {currentPage} {t('pagination.of', { defaultValue: 'of' })} {totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                        >
                            {t('pagination.next', { defaultValue: 'Next' })} <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
                </>
            )}
        </div>
    );
}
