'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, Loader2, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs, orderBy, query, type Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Infographic } from "@/types";
import { useTranslation } from '@/hooks/use-translation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { autoCreateOrUpdateInfographics } from '@/actions/infographic-actions';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const admin = userDoc.exists() && userDoc.data()?.role === 'admin';
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
            ) : filteredInfographics.length === 0 ? (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('infographics.noInfographicsTitle', { defaultValue: 'No Infographics Found' })}</AlertTitle>
                    <AlertDescription>
                        {searchTerm ? "No infographics match your search. Try a different term." : t('infographics.noInfographicsDescription', { defaultValue: 'Check back later for new content.' })}
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="w-full max-w-3xl mx-auto">
                    {CATEGORY_ORDER.map(cat => {
                        const items = groupedInfographics[cat] || [];
                        if (items.length === 0) return null;

                        return (
                            <div key={cat} className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-primary border-b pb-2">
                                    {t(`infographicCategories.${cat}`, { defaultValue: cat })}
                                </h2>
                                <div className="flex flex-col">
                                    {items.map((infographic) => (
                                        <div key={infographic.id} className="border-b last:border-0 py-4 flex justify-between items-center transition-colors">
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
                            </div>
                        );
                    })}
                    {Object.keys(groupedInfographics).filter(cat => !CATEGORY_ORDER.includes(cat)).map(cat => (
                        <div key={cat} className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-primary border-b pb-2">
                                {t(`infographicCategories.${cat}`, { defaultValue: cat })}
                            </h2>
                            <div className="flex flex-col">
                                {groupedInfographics[cat].map((infographic) => (
                                    <div key={infographic.id} className="border-b last:border-0 py-4 flex justify-between items-center transition-colors">
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
