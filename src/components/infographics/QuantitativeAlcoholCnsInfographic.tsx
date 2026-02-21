'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

// --- Chart Data & Config ---

const wePrevalenceData = [
    { name: 'Chronic Alcohol Users', value: 13, key: 'riskHigh' },
    { name: 'General Population', value: 1.5, key: 'riskLow' },
];
const wePrevalenceConfig = {
    riskHigh: { label: 'Chronic Alcohol Users', color: 'hsl(var(--chart-5))' },
    riskLow: { label: 'General Population', color: 'hsl(var(--chart-1))' },
};


const weDetectionData = [
    { name: 'Classic Triad Present', value: 24.5, key: 'classic' },
    { name: 'Atypical/Subclinical', value: 75.5, key: 'atypical' },
];
const weDetectionConfig = {
    classic: { label: 'Classic Triad', color: 'hsl(var(--chart-2))' },
    atypical: { label: 'Atypical/Subclinical', color: 'hsl(var(--muted))' },
};

const mriWeSensitivityData = [
    { name: 'Sensitivity', value: 53, key: 'sensitivity' },
    { name: 'Specificity', value: 93, key: 'specificity' },
];
const mriSensitivityConfig = {
    sensitivity: { label: 'Sensitivity', color: 'hsl(var(--chart-1))' },
    specificity: { label: 'Specificity', color: 'hsl(var(--chart-2))' },
};


const mriWeLocationData = [
    { name: 'Medial Thalamus / 3rd Ventricle', frequency: 82.5, key: 'loc1' },
    { name: 'Periaqueductal Area', frequency: 62, key: 'loc2' },
    { name: 'Mammillary Bodies', frequency: 41.5, key: 'loc3' },
    { name: 'Midbrain Tectum', frequency: 37, key: 'loc4' },
];
const mriLocationConfig = {
    loc1: { label: 'Medial Thalamus', color: 'hsl(var(--chart-1))' },
    loc2: { label: 'Periaqueductal', color: 'hsl(var(--chart-2))' },
    loc3: { label: 'Mammillary Bodies', color: 'hsl(var(--chart-3))' },
    loc4: { label: 'Midbrain Tectum', color: 'hsl(var(--chart-4))' },
};


const corpusCallosumAtrophyData = [
    { name: 'Genu', reduction: 18, key: 'genu' },
    { name: 'Truncus', reduction: 16, key: 'truncus' },
    { name: 'Splenium', reduction: 15, key: 'splenium' },
];
const corpusCallosumConfig = {
    genu: { label: 'Genu', color: 'hsl(var(--chart-3))' },
    truncus: { label: 'Truncus', color: 'hsl(var(--chart-4))' },
    splenium: { label: 'Splenium', color: 'hsl(var(--chart-5))' },
};


const odsAudAssociationData = [
    { name: 'Associated with AUD', value: 50.5, key: 'aud' },
    { name: 'Other Causes', value: 49.5, key: 'other' },
];
const odsConfig = {
    aud: { label: 'AUD-Associated', color: 'hsl(var(--chart-5))' },
    other: { label: 'Other Causes', color: 'hsl(var(--muted))' },
};


// --- Main Infographic Component ---

const QuantitativeAlcoholCnsInfographic = () => {
    // Current date for the mandatory footer
    const currentDate = "October 9, 2025";
    const infoTheme = "Quantitative Analysis: Alcohol's Effects on the Central Nervous System";

    // --- Extracted Sources for Mandatory Sources Card ---
    const sources = [
        { title: 'Wet Brain from Alcohol: Wernicke-Korsakoff Syndrome (WKS)', source: 'American Addiction Centers', url: 'https://americanaddictioncenters.org/alcohol/risks-effects-dangers/wernicke-korsakoff-syndrome' },
        { title: 'Wernicke Encephalopathy', source: 'DynaMed', url: 'https://www.dynamed.com/condition/wernicke-encephalopathy' },
        { title: 'The Korsakoff syndrome: clinical aspects, psychology and treatment', source: 'Kopelman, M. D., et al. (2015). Alcohol and Alcoholism', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4728174/' },
        { title: 'Usefulness of CT and MR imaging in the diagnosis of acute Wernicke\'s encephalopathy', source: 'Antunez, E., et al. (1998). AJR', url: 'https://pubmed.ncbi.nlm.nih.gov/9763009/' },
        { title: 'Alcohol: effects on neurobehavioral functions and the brain', source: 'Oscar-Berman, M., & Marinković, K. (2007). Neuropsychology review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5513685/' },
        { title: 'Hypoperfusion of inferior frontal brain regions in abstinent alcoholics: a pilot SPECT study', source: 'Gansler, D. A., et al. (2000). Journal of studies on alcohol', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2077939/' },
        { title: 'Osmotic Demyelination Syndrome', source: 'DynaMed', url: 'https://www.dynamed.com/condition/osmotic-demyelination-syndrome' },
        { title: 'Marchiafava-Bignami disease: a rare entity with a poor outcome', source: 'Menegon, V., et al. (2008). Neurological Sciences', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4031867/' },
        { title: 'Síndrome de Wernicke-Korsakoff', source: 'Family Caregiver Alliance', url: 'https://www.caregiver.org/es/resource/wernicke-korsakoff-spanish/' },
    ];


    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Quantitative Analysis: Alcohol's Effects on the <GradientText>Central Nervous System</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Incidence, Prevalence, and Radiological Detection (CT/MRI)</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            1. Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            Alcohol Use Disorder (AUD) causes significant CNS morbidity. Nutritional deficiencies elevate risks for acute conditions like Wernicke Encephalopathy (WE), with a post-mortem/subclinical prevalence of <strong className="text-destructive">12-14%</strong> in chronic users, yet the classic triad appears in only <strong className="text-destructive">16-33%</strong>. MRI is the gold standard for diagnosis (WE Sensitivity: <strong className="text-primary">53%</strong>, Specificity: <strong className="text-primary">93%</strong>), vastly outperforming CT. Chronic effects like atrophy are detectable in <strong className="text-primary">93-100%</strong> of complicated cases via MRI.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M15.042 21.002a2.25 2.25 0 01-3.084 0 2.25 2.25 0 01-3.084 0M12 6.002v9.75m-3.111 2.553a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.06 1.06 4.765-4.764a.75.75 0 111.06 1.06l-5.25 5.25-1.591 1.591z" />
                            2. Wernicke-Korsakoff Syndrome (WKS)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ChartContainer config={wePrevalenceConfig} className="min-h-[150px] w-full">
                            <>
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle className="text-base">Prevalence of WKS</CardTitle>
                                </CardHeader>
                                <ResponsiveContainer width="100%" height={150}>
                                    <BarChart accessibilityLayer data={wePrevalenceData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis unit="%" />
                                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="value" name="Prevalence" radius={[4, 4, 0, 0]} barSize={40}>
                                            {wePrevalenceData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        </ChartContainer>

                        <ChartContainer config={weDetectionConfig} className="min-h-[150px] w-full">
                            <>
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle className="text-base">Clinical Presentation of Acute WE</CardTitle>
                                </CardHeader>
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={weDetectionData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} >
                                            {weDetectionData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Pie>
                                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </>
                        </ChartContainer>
                        <p className="text-xs text-muted-foreground mt-2">The high prevalence combined with low classic symptom frequency highlights a crisis of underdiagnosis. Empirical thiamine treatment is crucial.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                            3. Imaging WE: MRI vs. CT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ChartContainer config={mriSensitivityConfig} className="min-h-[150px] w-full">
                            <>
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle className="text-base">MRI Diagnostic Accuracy for Acute WE</CardTitle>
                                </CardHeader>
                                <ResponsiveContainer width="100%" height={150}>
                                    <BarChart accessibilityLayer data={mriWeSensitivityData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis unit="%" />
                                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="value" name="Percentage" radius={[4, 4, 0, 0]} barSize={40}>
                                            {mriWeSensitivityData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        </ChartContainer>

                        <ChartContainer config={mriLocationConfig} className="min-h-[200px] w-full">
                            <>
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle className="text-base">Frequency of MRI Regional Findings</CardTitle>
                                </CardHeader>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart accessibilityLayer data={mriWeLocationData} layout="vertical" margin={{ left: 150, right: 20 }}>
                                        <CartesianGrid horizontal={false} />
                                        <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={150} tick={{ fontSize: 10 }} />
                                        <XAxis dataKey="frequency" type="number" unit="%" />
                                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="frequency" name="Frequency" radius={[0, 4, 4, 0]} barSize={30}>
                                            {mriWeLocationData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        </ChartContainer>
                        <p className="text-sm text-muted-foreground mt-4"><strong>CT Performance:</strong> CT detected acute low-density changes in only <strong>13%</strong> of WE cases and is considered not useful for acute diagnosis. While CT can show chronic atrophy (53-86% in WE), MRI is superior (93-100%).</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            4. MBD & ODS Quantification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-foreground">Marchiafava-Bignami Disease (MBD)</h3>
                            <p className="text-sm text-muted-foreground mt-1">Extremely rare degeneration of the corpus callosum linked to chronic alcohol use and B vitamin deficiencies. Prevalence is underestimated ({'<'}300 reported cases pre-2001). MRI is essential for diagnosis, showing symmetrical corpus callosum lesions.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Osmotic Demyelination Syndrome (ODS)</h3>
                            <p className="text-sm text-muted-foreground mt-1">Caused by rapid correction of chronic hyponatremia. AUD is a major risk factor (ORa: 15.27).</p>
                            <ChartContainer config={odsConfig} className="min-h-[150px] w-full">
                                <>
                                    <CardHeader className="p-0 mt-2 mb-2">
                                        <CardTitle className="text-base">Association of ODS with AUD</CardTitle>
                                    </CardHeader>
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={odsAudAssociationData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} >
                                                {odsAudAssociationData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Pie>
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            5. Chronic Effects: Cerebral Atrophy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Chronic alcohol use leads to structural brain damage, primarily cerebral atrophy and white matter deficits. White matter damage is considered a defining characteristic.</p>
                        <ChartContainer config={corpusCallosumConfig} className="min-h-[200px] w-full">
                            <>
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle className="text-base">Corpus Callosum Atrophy in AUD</CardTitle>
                                </CardHeader>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart accessibilityLayer data={corpusCallosumAtrophyData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis unit="%" domain={[0, 20]} />
                                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="reduction" name="Reduction (%)" radius={[4, 4, 0, 0]} barSize={40}>
                                            {corpusCallosumAtrophyData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        </ChartContainer>
                        <p className="text-xs text-muted-foreground mt-2">Corpus callosum atrophy directly correlates with lifetime alcohol consumption, serving as a biomarker of chronic toxicity.</p>
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
                        <ul className="space-y-3 text-xs text-muted-foreground columns-1 md:columns-2">
                            {sources.map((source, index) => (
                                <li key={index} className="break-inside-avoid">
                                    <span className="font-semibold">{source.title}</span> - {source.source}.
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                        [Access Link]
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes quantitative findings on {infoTheme} based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default QuantitativeAlcoholCnsInfographic;
