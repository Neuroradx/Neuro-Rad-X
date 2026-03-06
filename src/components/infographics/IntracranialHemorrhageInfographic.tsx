
'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { GradientText, SectionIcon } from './infographic-shared';

// --- Chart Data & Config ---
const spontaneousIchData = [
    { name: 'Hypertensive Arteriopathy', value: 55, key: 'etio1' },
    { name: 'Coagulopathy / Antithrombotic Use', value: 20, key: 'etio2' },
    { name: 'Cerebral Amyloid Angiopathy (CAA)', value: 15, key: 'etio3' },
    { name: 'Vascular Malformations', value: 5, key: 'etio4' },
    { name: 'Brain Tumors', value: 5, key: 'etio5' },
];

const ichEtiologyConfig = {
    value: { label: 'Prevalence' },
    etio1: { label: 'Hypertensive Arteriopathy', color: 'hsl(var(--chart-1))' },
    etio2: { label: 'Coagulopathy', color: 'hsl(var(--chart-2))' },
    etio3: { label: 'CAA', color: 'hsl(var(--chart-3))' },
    etio4: { label: 'Vascular Malformations', color: 'hsl(var(--chart-4))' },
    etio5: { label: 'Brain Tumors', color: 'hsl(var(--chart-5))' },
};


const spontaneousSahData = [
    { name: 'Ruptured Aneurysm', value: 85, key: 'aneurysm' },
    { name: 'Non-Aneurysmal Causes', value: 15, key: 'nonAneurysm' },
];
const sahEtiologyConfig = {
    value: { label: 'Prevalence' },
    aneurysm: { label: 'Ruptured Aneurysm', color: 'hsl(var(--chart-2))' },
    nonAneurysm: { label: 'Non-Aneurysmal', color: 'hsl(var(--muted-foreground))' },
}

const sahRiskRateData = [
    { name: 'Aneurysm Prevalence (General Pop.)', rate: 4, key: 'prev' },
    { name: 'Annual Rupture Risk (Unruptured)', rate: 6, key: 'rupture' },
    { name: 'Re-bleeding Risk (2 Weeks Post-Rupture)', rate: 20, key: 'rebleed' },
];

const riskRateConfig = {
    rate: { label: 'Rate (%)' },
    prev: { color: 'hsl(var(--chart-1))' },
    rupture: { color: 'hsl(var(--chart-3))' },
    rebleed: { color: 'hsl(var(--chart-2))' },
};


// --- Main Infographic Component ---

const IntracranialHemorrhageInfographic = () => {
    // --- Extracted Sources for Mandatory Sources Card ---
    const sources = [
        { title: 'Intracranial Hemorrhage: A Breakdown by Etiology, Types, Causes, and Outcomes', source: 'Codman Surgical', url: 'https://codmansurgical.integralife.com/intracranial-hemorrhage-types-causes-and-outcomes/' },
        { title: 'Subdural Hematoma', source: 'DynaMed', url: 'https://www.dynamed.com/condition/subdural-hematoma' },
        { title: 'Prevalence of Subdural and Epidural Hematoma in Head Trauma Patients: A Cross-sectional Study', source: 'Index Copernicus', url: 'https://journals.indexcopernicus.com/api/file/viewByFileId/1898106' },
        { title: 'A case of spontaneous bilateral epidural hematoma associated with decreased coagulation factor XII activity: case report and literature review', source: 'Frontiers', url: 'https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2024.1460073/full' },
        { title: 'Epidural Hematoma', source: 'StatPearls - NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK518982/' },
        { title: 'Epidural Hematoma (EDH): Symptoms, Causes & Treatment', source: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org/health/diseases/22034-epidural-hematoma' },
        { title: 'The importance of additional intracranial injuries in epidural hematomas: detailed clinical analysis, long-term outcome, and literature review in surgically managed epidural hematomas', source: 'Frontiers', url: '#' },
    ];


    return (
        <div className="infographic-layout space-y-8">
            <header className="infographic-header">
                <h1 className="infographic-title">
                    Intracranial Hemorrhage: <GradientText>A Breakdown by Etiology</GradientText>
                </h1>
                <p className="infographic-subtitle">Classification and Prevalence of Spontaneous and Traumatic Causes</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Spontaneous Intracerebral Hemorrhage (ICH) */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            1. Spontaneous Intracerebral Hemorrhage (ICH)
                        </CardTitle>
                        <CardDescription>
                            Defined as non-traumatic bleeding within the brain tissue (parenchyma), it is the deadliest form of stroke. Spontaneous ICH is classified into primary causes (from small vessel disease) and secondary causes (from structural anomalies or systemic issues).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <h3 className="font-semibold text-foreground mb-2">Key Etiologies:</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                    <li className="font-semibold text-primary">Hypertensive Arteriopathy: <span className="font-normal text-muted-foreground">Most common cause. Weakens deep-penetrating arteries due to chronic hypertension.</span></li>
                                    <li className="font-semibold text-[hsl(var(--chart-2))]">Coagulopathy / Antithrombotic Use: <span className="font-normal text-muted-foreground">Increasingly common due to widespread use of anticoagulants (e.g., warfarin) and antiplatelet drugs.</span></li>
                                    <li className="font-semibold text-[hsl(var(--chart-3))]">Cerebral Amyloid Angiopathy (CAA): <span className="font-normal text-muted-foreground">Protein deposits weakening cortical vessels. Leading cause of lobar (superficial) ICH in the elderly.</span></li>
                                    <li className="font-semibold text-[hsl(var(--chart-4))]">Vascular Malformations: <span className="font-normal text-muted-foreground">AVMs are the leading cause of ICH in adults younger than 35.</span></li>
                                    <li><span className="font-normal text-muted-foreground">Undetermined / Other: Accounts for 5% to 18% of cases after initial investigation.</span></li>
                                </ul>
                            </div>
                            <div className="lg:col-span-2">
                                <Card className="infographic-card-inner">
                                    <CardHeader className="p-2 pt-0">
                                        <CardTitle className="text-lg">Prevalence of Spontaneous ICH Etiologies</CardTitle>
                                        <CardDescription>Estimated percentage composition of underlying causes.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ChartContainer config={ichEtiologyConfig} className="infographic-chart">
                                            <ResponsiveContainer width="100%" height={260}>
                                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                                    <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                                    <Pie data={spontaneousIchData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} paddingAngle={4} strokeWidth={2.5} stroke="hsl(var(--background))">
                                                        {spontaneousIchData.map((entry) => (
                                                            <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="infographic-card">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            2. Subarachnoid Hemorrhage (SAH)
                        </CardTitle>
                        <CardDescription>Bleeding into the subarachnoid space. Trauma is the most common cause overall, but spontaneous SAH is dominated by aneurysms.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={sahEtiologyConfig} className="infographic-chart">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                                    <Legend iconType="circle" />
                                    <Pie data={spontaneousSahData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={105} paddingAngle={4} strokeWidth={2.5} stroke="hsl(var(--background))">
                                        {spontaneousSahData.map((entry) => (
                                            <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <p className="text-sm text-center mt-2 text-muted-foreground">85% of spontaneous cases are due to ruptured aneurysms.</p>
                    </CardContent>
                </Card>

                <Card className="infographic-card">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            3. Traumatic Hemorrhages & Risk Rates
                        </CardTitle>
                        <CardDescription>Key rates for aneurysms and an overview of traumatic bleeds.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="flex items-center justify-center">
                            <ChartContainer config={riskRateConfig} className="infographic-chart">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={sahRiskRateData} layout="vertical">
                                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                                        <XAxis type="number" unit="%" tickLine={false} tickMargin={10} axisLine={false} />
                                        <YAxis dataKey="name" type="category" tickLine={false} width={150} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                        <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={32}>
                                            {sahRiskRateData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="infographic-alert-box">
                                <h4 className="font-bold text-destructive text-lg">Subdural Hematoma (SDH)</h4>
                                <p className="text-sm text-muted-foreground mt-2">Overwhelmingly <strong>traumatic</strong>. Caused by tearing of <strong>bridging veins</strong>. Occurs in <strong>11% to 25%</strong> of significant head injuries.</p>
                            </div>
                            <div className="infographic-alert-box">
                                <h4 className="font-bold text-destructive text-lg">Epidural Hematoma (EDH)</h4>
                                <p className="text-sm text-muted-foreground mt-2">Almost exclusively <strong>traumatic</strong>. Usually involves a skull fracture tearing the <strong>middle meningeal artery</strong>. Occurs in <strong>2% to 10%</strong> of head injuries.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MANDATORY SOURCES CARD */}
                <Card className="infographic-card md:col-span-2">
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
                                    {source.url && source.url !== '#' && (
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                            [Access Link]
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

            </main>

            {/* Mandatory Footer */}
            <footer className="infographic-footer">
                <p>This infographic summarizes key findings on Intracranial Hemorrhage Etiology and Classification based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 9, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default IntracranialHemorrhageInfographic;
