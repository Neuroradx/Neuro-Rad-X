'use client';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { GradientText, SectionIcon } from './infographic-shared';

// --- Chart Data & Config ---

const strokePrevalenceData = [
    { name: 'Ischemic Stroke (IS)', value: 65.3, key: 'ischemic' },
    { name: 'Intracerebral Hemorrhage (ICH)', value: 28.8, key: 'ich' },
    { name: 'Subarachnoid Hemorrhage (SAH)', value: 5.8, key: 'sah' },
];

const strokePrevalenceConfig = {
    ischemic: { label: 'Ischemic Stroke (IS)', color: 'hsl(var(--chart-1))' },
    ich: { label: 'Intracerebral Hemorrhage (ICH)', color: 'hsl(var(--chart-2))' },
    sah: { label: 'Subarachnoid Hemorrhage (SAH)', color: 'hsl(var(--chart-3))' },
};

const riskFactorData = [
    { name: 'High BP', value: 56.8, key: 'risk1' },
    { name: 'High BMI', value: 37.0, key: 'risk2' },
    { name: 'Air Pollution', value: 16.6, key: 'risk3' },
    { name: 'Smoking', value: 13.7, key: 'risk4' },
    { name: 'High Glucose', value: 17.1, key: 'risk5' },
];

const riskFactorConfig = {
    risk1: { label: 'High BP', color: 'hsl(var(--chart-1))' },
    risk2: { label: 'High BMI', color: 'hsl(var(--chart-2))' },
    risk3: { label: 'Air Pollution', color: 'hsl(var(--chart-3))' },
    risk4: { label: 'Smoking', color: 'hsl(var(--chart-4))' },
    risk5: { label: 'High Glucose', color: 'hsl(var(--chart-5))' },
};


const ischemicSubtypeData = [
    { name: 'Undetermined', value: 26, key: 'subtype1' },
    { name: 'Large Artery', value: 23, key: 'subtype2' },
    { name: 'Cardioembolism', value: 22, key: 'subtype3' },
    { name: 'Small Vessel', value: 22, key: 'subtype4' },
];

const ischemicSubtypeConfig = {
    subtype1: { label: 'Undetermined', color: 'hsl(var(--muted-foreground))' },
    subtype2: { label: 'Large Artery', color: 'hsl(var(--chart-1))' },
    subtype3: { label: 'Cardioembolism', color: 'hsl(var(--chart-2))' },
    subtype4: { label: 'Small Vessel', color: 'hsl(var(--chart-4))' },
};


// --- Main Infographic Component ---

const StrokeSubtypesInfographic = () => {
    return (
        <div className="infographic-layout space-y-8">
            {/* Header */}
            <header className="infographic-header">
                <h1 className="infographic-title">
                    Ischemic vs. Hemorrhagic <GradientText>Stroke</GradientText>
                </h1>
                <p className="infographic-subtitle">A Comparative Analysis of Demographics, Statistics, and Epidemiology</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Introduction */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            Ischemic vs. Hemorrhagic Stroke: An Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-primary">Ischemic Stroke (IS)</h3>
                            <p className="text-base text-muted-foreground mt-1">Occurs when a blood vessel supplying the brain is blocked by a clot, leading to insufficient blood flow. It accounts for the vast majority of strokes.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-destructive">Hemorrhagic Stroke (HS)</h3>
                            <p className="text-base text-muted-foreground mt-1">Occurs when a blood vessel in the brain ruptures, causing bleeding into the brain (ICH) or the surrounding space (SAH).</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Incidence and Prevalence */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            1. Incidence and Prevalence by Subtype
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground">The proportion of stroke subtypes varies globally, with high-income countries (HICs) having a higher proportion of ischemic strokes compared to low- and middle-income countries (LMICs).</p>
                            <div>
                                <h3 className="font-semibold text-foreground">Geographical Variation:</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>**HICs:** ~74.9% of incident strokes are ischemic.</li>
                                    <li>**LMICs:** Higher relative proportion of hemorrhagic strokes.</li>
                                </ul>
                            </div>
                        </div>
                        <Card className="infographic-card-inner">
                            <CardHeader>
                                <CardTitle>Global Stroke Prevalence (2021)</CardTitle>
                                <CardDescription>Approximate percentage of all incident strokes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={strokePrevalenceConfig} className="infographic-chart min-h-[260px] w-full">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Pie data={strokePrevalenceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} paddingAngle={4} strokeWidth={2.5} stroke="hsl(var(--background))" label>
                                                {strokePrevalenceData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Epidemiology: Key Modifiable Risk Factors */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            2. Epidemiology: Key Modifiable Risk Factors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <p className="text-base text-muted-foreground lg:col-span-2">Up to 90% of all stroke cases globally could be preventable by addressing modifiable risk factors. High systolic blood pressure is the single most important factor.</p>
                        <Card className="infographic-card-inner">
                            <CardHeader>
                                <CardTitle>Contribution to Stroke DALYs (2021)</CardTitle>
                                <CardDescription>Percentage of Disability-Adjusted Life Years.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={riskFactorConfig} className="infographic-chart min-h-[260px] w-full">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={riskFactorData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                                            <XAxis type="number" dataKey="value" unit="%" />
                                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                                                {riskFactorData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card className="infographic-card-inner">
                            <CardHeader>
                                <CardTitle>Etiological Subtypes of Ischemic Stroke</CardTitle>
                                <CardDescription>Approximate distribution percentage.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={ischemicSubtypeConfig} className="infographic-chart min-h-[260px] w-full">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Pie data={ischemicSubtypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} paddingAngle={4} strokeWidth={2.5} stroke="hsl(var(--background))" label>
                                                {ischemicSubtypeData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Risk Factors by Subtype */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            3. Specific Risk Factors by Stroke Subtype
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-primary">Ischemic Stroke Specific Risk Factors</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Atrial Fibrillation (AF):** Powerful risk factor for cardioembolic stroke.</li>
                                <li>**Atherosclerosis:** Drives large vessel ischemic stroke.</li>
                                <li>**Diabetes Mellitus:** Strongly associated with small vessel (lacunar) stroke.</li>
                                <li>**Dyslipidemia:** High LDL cholesterol linked to atherosclerotic stroke.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-destructive">Hemorrhagic Stroke Specific Risk Factors</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Uncontrolled Hypertension:** The dominant risk factor for ICH (up to 65% of cases).</li>
                                <li>**Anticoagulation Therapy:** Significantly increases ICH risk.</li>
                                <li>**Cerebral Amyloid Angiopathy (CAA):** A leading cause of lobar ICH in older adults.</li>
                                <li>**Smoking & Alcohol:** Strongly linked to SAH and ICH.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Diagnostic Imaging */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            4. Diagnostic Imaging Considerations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-foreground">Computed Tomography (CT)</h3>
                            <p className="text-base text-muted-foreground mt-1">Initial modality of choice due to speed and high sensitivity for acute hemorrhage.</p>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-2 space-y-1">
                                <li>**Hemorrhagic Stroke:** Appears as a **hyperdense (bright white)** area immediately.</li>
                                <li>**Ischemic Stroke:** May be normal initially, becoming **hypodense (darker)** within 24-48 hours.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Magnetic Resonance Imaging (MRI)</h3>
                            <p className="text-base text-muted-foreground mt-1">Provides more detail and detects acute ischemic changes earlier than CT.</p>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-2 space-y-1">
                                <li>**Ischemic Stroke:** **DWI** is the most sensitive sequence, showing a bright signal within minutes.</li>
                                <li>**Hemorrhagic Stroke:** Appearance is complex and varies with age. **SWI/GRE** sequences are highly sensitive for blood products, which appear very dark.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
                {/* Sources */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                            <li className="break-inside-avoid">GBD 2021 Stroke Collaborators. (2024). *The Lancet Neurology*. <a href="https://www.healthdata.org/research-analysis/library/global-regional-and-national-burden-stroke-and-its-risk-factors-1990-2021" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">healthdata.org</a></li>
                            <li className="break-inside-avoid">Feigin, V. L., et al. (2020). *The Lancet Neurology*. <a href="https://doi.org/10.1016/S1474-4422(20)30500-0" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(20)30500-0</a></li>
                            <li className="break-inside-avoid">Tsao, C. W., et al. (2025). *Circulation*. <a href="https://www.heart.org/en/-/media/PHD-Files-2/Science-News/2/2025-Heart-and-Stroke-Stat-Update/2025-Statistics-At-A-Glance.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">heart.org</a></li>
                            <li className="break-inside-avoid">Yang, Z., et al. (2025). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.122.040073" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.122.040073</a></li>
                            <li className="break-inside-avoid">Sun, J., et al. (2024). *Journal of the American Heart Association*. <a href="https://doi.org/10.1161/JAHA.124.039387" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/JAHA.124.039387</a></li>
                            <li className="break-inside-avoid">Kleindorfer, D. O., et al. (2021). *The Lancet Neurology*. <a href="https://doi.org/10.1016/S1474-4422(21)00022-6" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(21)00022-6</a></li>
                            <li className="break-inside-avoid">Diringer, M. N., & Hemphill, J. C., III. (2023). *StatPearls*. <a href="https://www.ncbi.nlm.nih.gov/books/NBK559173/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ncbi.nlm.nih.gov</a></li>
                            <li className="break-inside-avoid">Fonseca, A. C., & Ferro, J. M. (2015). *J Neurol Sci*. <a href="https://doi.org/10.1016/j.jns.2014.07.039" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/j.jns.2014.07.039</a></li>
                            <li className="break-inside-avoid">Spiotta, A. M., et al. (2024). *Br J Radiol*. <a href="https://doi.org/10.1259/bjr.20230571" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1259/bjr.20230571</a></li>
                            <li className="break-inside-avoid">Li, M., et al. (2024). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.123.045154" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.123.045154</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="infographic-footer">
                <p>This infographic summarizes key distinctions between Ischemic and Hemorrhagic Stroke based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 3, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default StrokeSubtypesInfographic;
