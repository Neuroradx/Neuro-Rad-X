'use client';
import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// --- Helper Components ---

const GradientText = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
        {children}
    </span>
);

const SectionIcon = ({ path }: { path: string }) => (
    <svg className="h-8 w-8 text-primary mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// --- Chart Data & Config ---

const imagingMarkersData = [
  { name: 'Lobar Cerebral Microbleeds', prevalence: 92.5, key: 'lobar' },
  { name: 'WMHs (Multispot)', prevalence: 50.0, key: 'wmh' },
  { name: 'Enlarged PVS', prevalence: 50.0, key: 'pvs' },
  { name: 'Cortical Superficial Siderosis', prevalence: 47.8, key: 'siderosis' },
  { name: 'Cerebellar Microbleeds', prevalence: 38.8, key: 'cerebellar' },
];

const imagingMarkersConfig = {
  prevalence: {
    label: 'Prevalence (%)',
  },
  lobar: { color: 'hsl(var(--chart-1))' },
  wmh: { color: 'hsl(var(--chart-2))' },
  pvs: { color: 'hsl(var(--chart-3))' },
  siderosis: { color: 'hsl(var(--chart-4))' },
  cerebellar: { color: 'hsl(var(--chart-5))' },
};

const bostonCriteriaData = [
    { version: 'v1.5', sensitivity: 70.8, specificity: 88.8 },
    { version: 'v2.0', sensitivity: 79.8, specificity: 84.7 },
];

const bostonCriteriaConfig = {
    sensitivity: { label: 'Sensitivity', color: 'hsl(var(--chart-1))' },
    specificity: { label: 'Specificity', color: 'hsl(var(--chart-2))' },
};


// --- Main Infographic Component ---

const CerebralAmyloidAngiopathyInfographic = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Cerebral Amyloid <GradientText>Angiopathy (CAA)</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Summary of Pathophysiology, Imaging, and Clinical Concepts</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Pathophysiology and Core Concepts */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            1. Pathophysiology and Core Concepts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            CAA is a small vessel disease characterized by amyloid-beta (Aβ) protein deposition in the walls of small to medium-sized arteries, arterioles, and capillaries in the cerebral cortex and leptomeninges. This accumulation leads to vessel fragility, increasing the risk of hemorrhage. Dysfunctional perivascular spaces (PVSs) may contribute by limiting Aβ clearance.
                        </p>
                    </CardContent>
                </Card>

                {/* Clinical Manifestations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M15.042 21.002a2.25 2.25 0 01-3.084 0 2.25 2.25 0 01-3.084 0M12 6.002v9.75m-3.111 2.553a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.06 1.06 4.765-4.764a.75.75 0 111.06 1.06l-5.25 5.25-1.591 1.591z" />
                            2. Clinical Manifestations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                            <li><strong>Cognitive Impairment (57.4%):</strong> Especially in executive function and processing speed.</li>
                            <li><strong>Intracerebral Hemorrhage (42.6%):</strong> A primary manifestation, particularly lobar hemorrhages.</li>
                            <li><strong>Behavioral/Psychiatric Signs (27.9%)</strong></li>
                            <li><strong>Headache (25.0%)</strong></li>
                            <li><strong>Transient Focal Neurological Episodes (20.6%)</strong></li>
                            <li><strong>Seizures (16.2%)</strong></li>
                        </ul>
                    </CardContent>
                </Card>
                
                {/* Diagnostic Imaging Markers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                             <SectionIcon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            3. Key Imaging Markers & Prevalence
                        </CardTitle>
                        <CardDescription>Data from a prospective cohort study.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={imagingMarkersConfig} className="min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart accessibilityLayer data={imagingMarkersData} layout="vertical" margin={{ left: 150, right: 20 }}>
                                    <CartesianGrid horizontal={false} />
                                    <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={150} tick={{ fontSize: 10 }} />
                                    <XAxis dataKey="prevalence" type="number" unit="%" />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="prevalence" name="Prevalence" radius={4}>
                                        {imagingMarkersData.map((entry) => (
                                            <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                 {/* Boston Criteria v2.0 */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            4. Boston Criteria v2.0 for Probable CAA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground">The Boston Criteria v2.0 classify CAA based on clinical and imaging findings, with "Probable CAA" being the highest certainty in living patients without biopsy.</p>
                            <div>
                                <h3 className="font-semibold text-foreground">Core Requirements:</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>Age {'>='} 50 years with spontaneous Intracerebral Hemorrhage, Transient Focal Neurological Episodes, or cognitive impairment.</li>
                                    <li>Absence of deep hemorrhagic lesions (Intracerebral Hemorrhage or Cerebral Microbleeds).</li>
                                    <li>Absence of other causes for hemorrhage.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary">Required MRI Patterns (Either A or B):</h3>
                                 <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li><strong>A:</strong> {'>='}2 strictly lobar hemorrhagic lesions (Intracerebral Hemorrhage, Cerebral Microbleeds, Cortical Superficial Siderosis).</li>
                                    <li><strong>B:</strong> 1 lobar hemorrhagic lesion + 1 white matter feature (severe PVS or multispot WMH).</li>
                                </ul>
                            </div>
                        </div>
                         <Card>
                            <CardHeader>
                                <CardTitle>Boston Criteria v2.0 vs v1.5 Accuracy</CardTitle>
                                <CardDescription>For probable CAA diagnosis (vs. non-probable).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={bostonCriteriaConfig} className="min-h-[150px] w-full">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart accessibilityLayer data={bostonCriteriaData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="version" tickLine={false} tickMargin={10} axisLine={false} />
                                            <YAxis unit="%" />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Legend />
                                            <Bar dataKey="sensitivity" fill="var(--color-sensitivity)" radius={4} name="Sensitivity" />
                                            <Bar dataKey="specificity" fill="var(--color-specificity)" radius={4} name="Specificity" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Risk Factors & Clinical Implications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            5. Risk Factors & Clinical Implications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                             <li><strong>Hypertension:</strong> Present in 70.6% of CAA patients in one study. Visit-to-visit BP variability is linked to Cerebral Microbleed and WMH progression.</li>
                            <li><strong>Anticoagulation Decisions:</strong> A diagnosis of CAA is a strong contraindication for antithrombotic therapy due to the high risk of recurrent Intracerebral Hemorrhage.</li>
                            <li><strong>Risk Stratification:</strong> The Boston Criteria help stratify the risk of recurrent Intracerebral Hemorrhage. v2.0 may identify a wider spectrum of the disease.</li>
                            <li><strong>Cognitive Impairment:</strong> CAA is a significant contributor to age-related cognitive decline, and early diagnosis can inform prognosis and management.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Recurrent Hemorrhage Risk */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M16.023 9.348h4.992v-.001a.75.75 0 01.75.75c0 .414-.336.75-.75.75h-4.992a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 0112 4.5v-2.25c0-.414.336-.75.75-.75s.75.336.75.75V4.5a.75.75 0 00.75.75h3.037a.75.75 0 010 1.5H13.5a.75.75 0 00-.75.75V9a2.25 2.25 0 012.273-2.25zM5.25 6.75c0-.414.336-.75.75-.75H9a.75.75 0 010 1.5H6a.75.75 0 000 1.5h3a.75.75 0 010 1.5H6a.75.75 0 000 1.5h3a.75.75 0 010 1.5H6a.75.75 0 00-.75.75v1.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-1.5A2.25 2.25 0 015.25 9V6.75z" />
                            6. Risk of Recurrent Hemorrhage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-foreground">Annual Risk of a New Bleed</h3>
                            <p className="text-center text-3xl font-bold text-destructive my-2">7% - 14% <span className="text-lg text-muted-foreground font-medium">per year</span></p>
                            <p className="text-xs text-center text-muted-foreground">For a survivor of a CAA-related lobar hemorrhage. This risk depends on MRI factors.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Timeline of Risk</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <Card className="bg-destructive/10 border-destructive/20">
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-base text-destructive">Early Recurrence (First 90 Days)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs text-muted-foreground mt-1">The risk is maximal in the first 3 months, often reflecting a more severe disease burden on MRI.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                     <CardHeader className="p-3">
                                        <CardTitle className="text-base text-foreground">Chronic Risk (After 90 Days)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs text-muted-foreground mt-1">After the initial period, the risk stabilizes to a sustained annual rate due to the progressive nature of CAA.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-foreground">Key MRI Predictors of Future Bleeds</h3>
                            <ul className="space-y-2 mt-2 text-sm text-muted-foreground">
                                <li><strong>Cortical Superficial Siderosis (cSS):</strong> The single strongest predictor. Widespread cSS elevates the annual risk to nearly 19%.</li>
                                <li><strong>Cerebral Microbleeds (CMBs):</strong> A high number of strictly lobar CMBs is associated with an annual recurrence risk of over 10%.</li>
                                <li><strong>Genetic Factors (APOE Alleles):</strong> APOE ε2 is strongly associated with a higher risk of recurrent hemorrhage, while ε4 is linked to a higher overall amyloid burden.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Sources */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                           7. Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                           <li className="break-inside-avoid">Charidimou, A., et al. (2022). *Lancet Neurology*. <a href="https://doi.org/10.1016/S1474-4422(22)00208-3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(22)00208-3</a></li>
                           <li className="break-inside-avoid">Chen, S.-J., & Tsai, H.-H. (2019). *Ther Adv Neurol Disord*. <a href="https://doi.org/10.1177/1756286419844113" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1177/1756286419844113</a></li>
                           <li className="break-inside-avoid">Greenberg, S. M., & Charidimou, A. (2018). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.117.016990" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.117.016990</a></li>
                           <li className="break-inside-avoid">Kozberg, M. G. (2020). *Int J Stroke*. <a href="https://doi.org/10.1177/1747493020974464" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1177/1747493020974464</a></li>
                           <li className="break-inside-avoid">Panteleienko, L., et al. (2024). *Neurology*. <a href="https://doi.org/10.1212/WNL.0000000000210084" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1212/WNL.0000000000210084</a></li>
                           <li className="break-inside-avoid">Samarasekera, N., et al. (2017). *PLoS ONE*. <a href="https://doi.org/10.1371/journal.pone.0180923" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1371/journal.pone.0180923</a></li>
                           <li className="break-inside-avoid">Schrag, M., & Kirshner, H. (2016). *Curr Neurol Neurosci Rep*. <a href="https://doi.org/10.1007/s11910-016-0674-1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1007/s11910-016-0674-1</a></li>
                           <li className="break-inside-avoid">Storti, B., et al. (2023). *Frontiers in Neuroscience*. <a href="https://doi.org/10.3389/fnins.2023.1219025" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3389/fnins.2023.1219025</a></li>
                           <li className="break-inside-avoid">Tanaka, F., et al. (2024). *Jpn J Radiol*. <a href="https://doi.org/10.1007/s11604-024-01720-2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1007/s11604-024-01720-2</a></li>
                           <li className="break-inside-avoid">Theodorou, A., et al. (2023). *J Clin Med*. <a href="https://doi.org/10.3390/jcm12175591" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3390/jcm12175591</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key findings on Cerebral Amyloid Angiopathy (CAA) based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 3, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default CerebralAmyloidAngiopathyInfographic;
