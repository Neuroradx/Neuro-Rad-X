'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Input } from "@/components/ui/input";
import { ChevronRight, Image as ImageIcon, AlertCircle, Loader2, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, type Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { checkIsAdmin } from '@/lib/admin-check';
import type { Infographic } from "@/types";
import { useTranslation } from '@/hooks/use-translation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { autoCreateOrUpdateInfographics } from '@/actions/infographic-actions';
import { format } from 'date-fns';

const CATEGORY_ORDER = [
    'vascular',
    'microangiopathy',
    'oncology',
    'inflammatory_infectious_toxic',
    'general_technique',
    'other'
];

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
    const [adminUidForSync, setAdminUidForSync] = useState<string | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [infographics, setInfographics] = useState<Infographic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

  const fetchInfographics = useCallback(async (userUid: string | null) => {
    setIsLoading(true);
    setError(null);

    // Only admins can trigger the infographics sync (create/update/delete)
    if (userUid) {
      await autoCreateOrUpdateInfographics(userUid);
    }

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
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const admin = await checkIsAdmin({ uid: user.uid, email: user.email ?? null });
                setAdminUidForSync(admin ? user.uid : null);
            } else {
                setAdminUidForSync(null);
            }
            setAuthReady(true);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!authReady) return;
        fetchInfographics(adminUidForSync);
    }, [fetchInfographics, authReady, adminUidForSync]);

    const filteredInfographics = useMemo(() => {
        return infographics.filter(infographic =>
            infographic.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [infographics, searchTerm]);

    const groupedInfographics = useMemo(() => {
        const groups: Record<string, Infographic[]> = {};
        filteredInfographics.forEach(info => {
            const cat = info.categoryId || 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(info);
        });
        return groups;
    }, [filteredInfographics]);


    return (
        <div className="container mx-auto py-8 sm:py-10 max-w-4xl px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20">
                    <ImageIcon className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('nav.infographics')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('infographics.pageDescription', {
                            defaultValue: 'Explore our collection of detailed infographics covering key neuroradiology topics.'
                        })}
                    </p>
                </div>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={t('infographics.searchPlaceholder', { defaultValue: 'Search infographics...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-border/80 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 max-w-md"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center py-20 rounded-2xl border border-border/50 bg-muted/30">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground font-medium">
                        {t('infographics.loading', { defaultValue: 'Loading infographics...' })}
                    </p>
                </div>
            ) : error ? (
                <Alert variant="destructive" className="rounded-xl border-destructive/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('error.title', { defaultValue: 'Error' })}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : filteredInfographics.length === 0 ? (
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg">{t('infographics.noInfographicsTitle', { defaultValue: 'No Infographics Found' })}</h3>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        {searchTerm
                            ? t('infographics.noSearchResults', { defaultValue: 'No infographics match your search. Try a different term.' })
                            : t('infographics.noInfographicsDescription', { defaultValue: 'Check back later for new content.' })}
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-3xl mx-auto space-y-8">
                    {CATEGORY_ORDER.map(cat => {
                        const items = groupedInfographics[cat] || [];
                        if (items.length === 0) return null;

                        return (
                            <div key={cat} className="space-y-4">
                                <h2 className="flex items-center gap-3 text-xl font-semibold text-primary">
                                    <span className="h-8 w-1 rounded-full bg-primary/70 flex-shrink-0" aria-hidden />
                                    {t(`infographicCategories.${cat}`, { defaultValue: cat })}
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                    {items.map((infographic) => (
                                        <div
                                            key={infographic.id}
                                            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <Link href={`/infographics/${infographic.id}`} className="group/link">
                                                            <h3 className="text-base font-semibold text-foreground group-hover/link:text-primary transition-colors">
                                                                {infographic.title}
                                                            </h3>
                                                        </Link>
                                                        <div className="flex items-center gap-1">
                                                            <a href={`/view-infographics/${infographic.id}`} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Open ${infographic.title} in new tab`}>
                                                                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                                </Button>
                                                            </a>
                                                            <Link href={`/infographics/${infographic.id}`} passHref title="View infographic">
                                                                <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`View ${infographic.title}`}>
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {formatTimestamp(infographic.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(groupedInfographics).filter(cat => !CATEGORY_ORDER.includes(cat)).map(cat => (
                        <div key={cat} className="space-y-4">
                            <h2 className="flex items-center gap-3 text-xl font-semibold text-primary">
                                <span className="h-8 w-1 rounded-full bg-primary/70 flex-shrink-0" aria-hidden />
                                {t(`infographicCategories.${cat}`, { defaultValue: cat })}
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                {groupedInfographics[cat].map((infographic) => (
                                    <div
                                        key={infographic.id}
                                        className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <ImageIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <Link href={`/infographics/${infographic.id}`} className="group/link">
                                                        <h3 className="text-base font-semibold text-foreground group-hover/link:text-primary transition-colors">
                                                            {infographic.title}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex items-center gap-1">
                                                        <a href={`/view-infographics/${infographic.id}`} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Open ${infographic.title} in new tab`}>
                                                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                            </Button>
                                                        </a>
                                                        <Link href={`/infographics/${infographic.id}`} passHref title="View infographic">
                                                            <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`View ${infographic.title}`}>
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {formatTimestamp(infographic.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
