'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend, Pie, PieChart } from 'recharts';
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

const hemorrhageRiskData = [
    { name: 'Incidental Lesions', risk: 0.08, key: 'risk1' },
    { name: 'Non-Brainstem (No Prior ICH)', risk: 0.3, key: 'risk2' },
    { name: 'Brainstem (No Prior ICH)', risk: 2.8, key: 'risk3' },
    { name: 'Non-Brainstem (Post-ICH)', risk: 6.3, key: 'risk4' },
    { name: 'Brainstem (Post-ICH)', risk: 32.3, key: 'risk5' },
];

const hemorrhageRiskConfig = {
    risk: { label: 'Annual Risk' },
    risk1: { color: 'hsl(var(--chart-1))' },
    risk2: { color: 'hsl(var(--chart-2))' },
    risk3: { color: 'hsl(var(--chart-3))' },
    risk4: { color: 'hsl(var(--chart-4))' },
    risk5: { color: 'hsl(var(--chart-5))' },
};


const fiveYearRiskData = [
    { name: 'Brainstem w/ ICH', risk: 30.8 },
    { name: 'Other w/ ICH', risk: 18.4 },
    { name: 'Brainstem w/o ICH', risk: 8.0 },
    { name: 'Other w/o ICH', risk: 3.8 },
];

const fiveYearRiskConfig = {
    risk: { label: '5-Year ICH Risk (%)', color: 'hsl(var(--chart-3))' },
};


// --- Main Infographic Component ---

const CerebralCavernousMalformationInfographic = () => {
    return (
        <div className="space-y-6">

            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Cerebral Cavernous <GradientText>Malformation (CCM)</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Integrated Perspectives from Neuroradiology, Neurosurgery, and Neurology</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Definition & Clinical Context */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            1. Definition & Clinical Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-foreground">Cerebral Cavernous Malformation (CCM)</h3>
                            <p className="text-muted-foreground text-base mt-1">
                                A CCM is a low-flow vascular lesion composed of dilated, weak-walled sinusoidal channels. It's the second most common cerebral vascular anomaly, with a prevalence of about <strong className="text-primary">0.5% in the general population (1 in 200 people)</strong>. While many are asymptomatic, CCMs can cause seizures, headaches, focal neurological deficits, or intracranial hemorrhage.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">The Most Common Anomaly: DVA</h3>
                            <p className="text-muted-foreground text-base mt-1">
                                The <strong className="text-primary">Developmental Venous Anomaly (DVA)</strong> is the most common cerebral vascular malformation. It is a benign variant of venous drainage. CCMs are frequently associated with a DVA, a crucial consideration for surgical planning to avoid venous infarction if the DVA is resected.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Neuroradiological Diagnosis */}
                <Card className="md:col-span-2 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                            2. Neuroradiological Diagnosis with MRI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-foreground">Classic MRI Appearance of CCM</h3>
                            <p className="text-base text-muted-foreground mt-1">CCMs have a pathognomonic "popcorn" or reticulated core of mixed signal on T2-weighted images, surrounded by a complete, dark (hypointense) halo of hemosiderin. Contrast enhancement is typically minimal or absent.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">The Gold Standard: SWI</h3>
                            <p className="text-base text-muted-foreground mt-1">
                                Susceptibility-Weighted Imaging (SWI) is significantly more sensitive than T2* GRE for detecting CCMs. Studies show SWI detects a much higher number of lesions (152 vs. 56 in one study) and reveals microcavernomas (Type IV/V) invisible on conventional sequences.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Molecular & Genetic Basis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.654 5.654a2.652 2.652 0 01-3.752-3.752l5.654-4.654M3 3l3.59 3.59m0 0A2.652 2.652 0 019 9m7.5-3A2.652 2.652 0 0013.5 3m-3 0a2.652 2.652 0 00-3 3.59" />
                            3. Molecular & Genetic Basis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground mb-2">Familial CCM is linked to mutations in three key genes: <strong className="text-primary">CCM1 (KRIT1)</strong>, <strong className="text-primary">CCM2 (MGC4607)</strong>, and <strong className="text-primary">CCM3 (PDCD10)</strong>. These genes are vital for endothelial cell junction integrity.</p>
                        <p className="text-base text-muted-foreground">Mutations in <strong className="text-destructive">CCM3</strong> are associated with the most severe disease form, often in children, leading to multiple lesions and recurrent hemorrhages.</p>
                    </CardContent>
                </Card>

                {/* Natural History & Hemorrhage Risk */}
                <Card className="md:col-span-2 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-1.37-1.37m1.37 1.37l-1.586 1.585" />
                            4. Natural History & Hemorrhage Risk
                        </CardTitle>
                        <CardDescription>Annual Hemorrhage Risk (AHR) varies dramatically based on location and prior bleeding.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={hemorrhageRiskConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={hemorrhageRiskData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-40} textAnchor="end" height={80} interval={0} />
                                    <YAxis unit="%" />
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="risk" name="Annual Risk" radius={[4, 4, 0, 0]} barSize={40}>
                                        {hemorrhageRiskData.map((entry) => (
                                            <Cell key={entry.name} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* 5-Year Risk Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>5. 5-Year Accumulated ICH Risk</CardTitle>
                        <CardDescription>Based on location and initial presentation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={fiveYearRiskConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart accessibilityLayer data={fiveYearRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-40} textAnchor="end" height={80} interval={0} />
                                    <YAxis unit="%" />
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="risk" name="5-Year Risk" fill="var(--color-risk)" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Therapeutic Management */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662v1.562a4.006 4.006 0 003.7 3.7c1.846.053 3.695.085 5.568 0a4.006 4.006 0 003.7-3.7v-1.562z" />
                            6. Therapeutic Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="bg-muted/50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-foreground">Observation</h3>
                            <p className="text-muted-foreground mt-1">Appropriate for asymptomatic lesions, especially those discovered incidentally, given the very low annual hemorrhage risk (0.08%).</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-foreground">Microsurgery</h3>
                            <p className="text-muted-foreground mt-1">The only curative option, immediately eliminating re-bleed risk. Indicated for symptomatic CCMs that have bled or cause refractory seizures. Total resection is achieved in &gt;98% of pediatric cases.</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-foreground">Stereotactic Radiosurgery (SRS)</h3>
                            <p className="text-muted-foreground mt-1">An alternative for deep or eloquent lesions. Hemorrhage risk reduction begins ~2 years post-treatment. PND rates are comparable to microsurgery for brainstem CCMs.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sources */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                            <li className="break-inside-avoid">Al-Shahi Salman, R., et al. (2016). *The Lancet Neurology*. <a href="https://doi.org/10.1016/S1474-4422(15)00164-7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(15)00164-7</a></li>
                            <li className="break-inside-avoid">Goldstein, H. E., et al. (2022). *Neurosurgery*. <a href="https://doi.org/10.1227/neu.0000000000001994" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1227/neu.0000000000001994</a></li>
                            <li className="break-inside-avoid">Ren, Y., et al. (2023). *Frontiers in Neurology*. <a href="https://doi.org/10.3389/fneur.2023.1168812" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3389/fneur.2023.1168812</a></li>
                            <li className="break-inside-avoid">Scimone, C., et al. (2022). *Cancers*. <a href="https://doi.org/10.3390/cancers14092265" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3390/cancers14092265</a></li>
                            <li className="break-inside-avoid">Zhang, C., et al. (2020). *Frontiers in Neurology*. <a href="https://doi.org/10.3389/fneur.2020.00591" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3389/fneur.2020.00591</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key findings on Cerebral Cavernous Malformation (CCM) based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 8, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default CerebralCavernousMalformationInfographic;
