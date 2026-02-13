'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationsBarChart } from '@/components/charts/LocationsBarChart';

// --- Helper Components ---

const GradientText = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
        {children}
    </span>
);

const SectionIcon = ({ path, className = "text-primary" }: { path: string, className?: string }) => (
    <svg className={`h-8 w-8 mr-3 flex-shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// --- Main Infographic Component ---

const CerebralMicrobleedsInfographic = () => {
    return (
        <div className="space-y-6">

            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Cerebral Microbleeds: <GradientText>What Are They Telling Us?</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A clinician's guide to the differential diagnosis of tiny brain bleeds based on MRI findings. 🧠</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* What are they? */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            What are Cerebral Microbleeds?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Tiny, dot-like deposits of old blood (hemosiderin). They appear as "black dots" on specific MRI sequences like SWI and T2*-GRE.
                        </p>
                    </CardContent>
                </Card>

                {/* The Golden Rule */}
                <Card className="md:col-span-2 text-center">
                    <CardHeader>
                        <CardTitle className="text-xl">The Golden Rule: Location is Everything</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            The anatomical distribution of microbleeds is the **most important clue** to their underlying cause. We separate them into two main patterns: **Lobar** vs. **Deep**.
                        </p>
                    </CardContent>
                </Card>

                {/* A Tale of Two Patterns */}
                <Card className="md:col-span-2">
                    <CardHeader>
                         <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a.75.75 0 01-1.06 0l-1-1a.75.75 0 011.06-1.06l.22.22a.75.75 0 001.06 0l.22-.22a.75.75 0 011.06 1.06l-1 1z" />
                            A Tale of Two Patterns: The Most Common Culprits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Hypertensive Arteriopathy */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-primary">Hypertensive Arteriopathy</CardTitle>
                                <CardDescription>The #1 overall cause of microbleeds.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p><strong>Prevalence:</strong> Found in <strong>50-80%</strong> of patients with a hypertensive brain hemorrhage.</p>
                                <p className="font-semibold text-destructive">LOCATION: DEEP & INFRATENTORIAL</p>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    <li>Basal Ganglia</li>
                                    <li>Thalamus</li>
                                    <li>Brainstem (Pons)</li>
                                    <li>Cerebellum</li>
                                </ul>
                                <p><strong>Mechanism:</strong> Damage to small, perforating arteries from chronic high blood pressure.</p>
                            </CardContent>
                        </Card>
                         {/* Cerebral Amyloid Angiopathy (CAA) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-secondary">Cerebral Amyloid Angiopathy (CAA)</CardTitle>
                                <CardDescription>The #1 cause of *strictly lobar* microbleeds in the elderly.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p><strong>Prevalence:</strong> Found in up to <strong>80%</strong> of patients with Alzheimer's Disease.</p>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">LOCATION: LOBAR (CORTICAL-SUBORTICAL)</p>
                                 <ul className="list-disc list-inside text-muted-foreground">
                                    <li>Parietal Lobes</li>
                                    <li>Occipital Lobes</li>
                                    <li className="italic">(Crucially, spares the deep structures)</li>
                                </ul>
                                <p><strong>Mechanism:</strong> Beta-amyloid protein buildup weakening the walls of cortical blood vessels.</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Less Common Causes */}
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                           Beyond the Basics: Other Potential Causes (&lt;10%)
                        </CardTitle>
                        <CardDescription>Consider these in specific clinical contexts. 🔬</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                             <SectionIcon path="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="mx-auto" />
                            <h3 className="font-semibold mt-2">CADASIL</h3>
                            <p className="text-xs text-muted-foreground mt-1">Hereditary small vessel disease. Look for CMBs in anterior temporal lobes & external capsule. Affects 30-70% of patients.</p>
                        </div>
                         <div className="bg-muted/50 p-4 rounded-lg text-center">
                            <SectionIcon path="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" className="mx-auto" />
                            <h3 className="font-semibold mt-2">Radiation Vasculopathy</h3>
                            <p className="text-xs text-muted-foreground mt-1">Late effect of radiation therapy. CMBs are strictly within the radiation field. Develops in {'>'}50% of patients.</p>
                        </div>
                         <div className="bg-muted/50 p-4 rounded-lg text-center">
                            <SectionIcon path="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" className="mx-auto" />
                            <h3 className="font-semibold mt-2">Embolic Showers</h3>
                            <p className="text-xs text-muted-foreground mt-1">Acute/subacute finding. Scattered CMBs in the context of septic emboli (endocarditis) or fat emboli (fracture).</p>
                        </div>
                    </CardContent>
                </Card>

                {/* At a Glance */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            At a Glance: Key Differentiators
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Cause</th>
                                        <th scope="col" className="px-6 py-3">Typical Location</th>
                                        <th scope="col" className="px-6 py-3">Key Clinical Context</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <th scope="row" className="px-6 py-4 font-medium text-foreground whitespace-nowrap">Hypertension</th>
                                        <td className="px-6 py-4">**Deep** (Basal Ganglia, Brainstem)</td>
                                        <td className="px-6 py-4">Chronic High Blood Pressure</td>
                                    </tr>
                                    <tr className="border-b">
                                        <th scope="row" className="px-6 py-4 font-medium text-foreground whitespace-nowrap">CAA</th>
                                        <td className="px-6 py-4">**Lobar** (Cortical-Subcortical)</td>
                                        <td className="px-6 py-4">Older Age, Cognitive Decline</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                 {/* Sources */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                           Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-xs text-muted-foreground columns-1">
                           <li className="break-inside-avoid">Greenberg, S. M., Vernooij, M. W., Cordonnier, C., Viswanathan, A., Al-Shahi Salman, R., Warach, S., & van Buchem, M. A. (2009). Cerebral microbleeds: a guide to detection and interpretation. *The Lancet Neurology*, *8*(2), 165–174. <a href="https://doi.org/10.1016/S1474-4422(09)70013-4" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(09)70013-4</a></li>
                           <li className="break-inside-avoid">Charidimou, A., Kakar, P., & Werring, D. J. (2012). Cerebral microbleeds and recurrent stroke risk: a meta-analysis. *Journal of neurology, neurosurgery, and psychiatry*, *83*(6), 595–601. <a href="https://doi.org/10.1136/jnnp-2011-301319" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1136/jnnp-2011-301319</a></li>
                           <li className="break-inside-avoid">Shoamanesh, A., Kwok, C. S., & Benavente, O. (2016). Cerebral microbleeds: a review of their prevalence and clinical significance. *Expert review of neurotherapeutics*, *16*(3), 293–306. <a href="https://doi.org/10.1586/14737175.2016.1147570" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1586/14737175.2016.1147570</a></li>
                           <li className="break-inside-avoid">Pasi, M., Charidimou, A., Boulouis, G., Auriel, E., van Etten, E. S., Haley, K., ... & Greenberg, S. M. (2018). Mixed-location cerebral microbleeds and risk of stroke. *Neurology*, *90*(11), e941-e949. <a href="https://doi.org/10.1212/WNL.0000000000005115" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1212/WNL.0000000000005115</a></li>
                            <li className="break-inside-avoid">Akoudad, S., Wolters, F. J., Viswanathan, A., de Bruijn, R. F., van der Lugt, A., Hofman, A., ... & Vernooij, M. W. (2016). Association of cerebral microbleeds with mortality, stroke, and dementia. *JAMA neurology*, *73*(8), 991-998. <a href="https://doi.org/10.1001/jamaneurol.2016.1017" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1001/jamaneurol.2016.1017</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key findings on Cerebral Microbleeds based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 3, 2025. Generated with Gemini.
                </p>
            </footer>
        </div>
    );
};

export default CerebralMicrobleedsInfographic;
