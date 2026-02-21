'use client';
import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

const riskFactorData = [
    { name: 'Hormonal Therapy', value: 23.4, key: "risk1" },
    { name: 'Pregnancy/Puerperium', value: 20.0, key: "risk2" },
    { name: 'Infections', value: 15.0, key: "risk3" },
    { name: 'Thrombophilias', value: 10.0, key: "risk4" },
    { name: 'Other/Unknown', value: 31.6, key: "risk5" },
];

const riskFactorConfig = {
    risk1: { label: 'Hormonal Therapy', color: 'hsl(var(--chart-1))' },
    risk2: { label: 'Pregnancy/Puerperium', color: 'hsl(var(--chart-2))' },
    risk3: { label: 'Infections', color: 'hsl(var(--chart-3))' },
    risk4: { label: 'Thrombophilias', color: 'hsl(var(--chart-4))' },
    risk5: { label: 'Other/Unknown', color: 'hsl(var(--chart-5))' },
};


const outcomeData = [
    { stage: 'At Diagnosis', mRS_0_1: 18.7 },
    { stage: 'At 3 Months', mRS_0_1: 83.2 },
    { stage: 'At 6 Months', mRS_0_1: 85.1 },
];

const outcomeConfig = {
    mRS_0_1: {
        label: 'Good Outcome (mRS 0-1)',
        color: 'hsl(var(--chart-1))',
    },
};

const mortalityData = [
    { name: 'General Population', rate: 5, key: "mortality1" },
    { name: 'Obstetric Cases', rate: 18.5, key: "mortality2" },
    { name: 'Vaccine-Induced', rate: 50, key: "mortality3" },
    { name: 'Endovascular Tx', rate: 9.2, key: "mortality4" },
];

const mortalityConfig = {
    rate: {
        label: 'Mortality Rate (%)',
    },
    mortality1: { color: 'hsl(var(--chart-1))' },
    mortality2: { color: 'hsl(var(--chart-2))' },
    mortality3: { color: 'hsl(var(--chart-3))' },
    mortality4: { color: 'hsl(var(--chart-4))' },
};


// --- Main Infographic Component ---

const CerebralVenousSinusThrombosisInfographic = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Cerebral Venous Sinus Thrombosis <GradientText>(CVST)</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Comprehensive Briefing on a Rare Cerebrovascular Condition</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Epidemiology and Risk Factors */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            <h2 className="text-xl font-bold text-foreground">1. Epidemiology and Risk Factors</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground">CVST is an uncommon cause of stroke (0.5-1% of cases), disproportionately affecting young adults (mean age 35-40) and women (up to 75% of cases), largely due to hormonal factors.</p>
                            <div>
                                <h3 className="font-semibold text-foreground">Key Risk Factors:</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>**Pregnancy & Puerperium:** Accounts for ~20% of cases, with risk heightened by procoagulant changes.</li>
                                    <li>**Hormonal Therapy:** Increases odds nearly 8-fold.</li>
                                    <li>**Infections:** Head and neck infections are common contributors.</li>
                                    <li>**Thrombophilias:** Genetic and acquired conditions like Factor V Leiden.</li>
                                    <li>**Vaccine-Induced Immune Thrombotic Thrombocytopenia (VITT):** A rare complication of adenovirus-based COVID-19 vaccines.</li>
                                </ul>
                            </div>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Common Contributing Factors</CardTitle>
                                <CardDescription>Approximate percentage distribution of key risk factors in studied cohorts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={riskFactorConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Tooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Pie data={riskFactorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {riskFactorData.map((entry) => (
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

                {/* Clinical Presentation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            <h2 className="text-xl font-bold text-foreground">2. Clinical Presentation</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground mb-2">Presentation is highly variable, with a subacute onset (2 days to 1 month) being most common (50-60% of cases).</p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                            <li><strong>Headache (~90%):</strong> Most common symptom, often progressive and worsens when lying down.</li>
                            <li><strong>Seizures (~40%):</strong> Far more frequent than in arterial stroke.</li>
                            <li><strong>Focal Neurological Deficits (20-50%):</strong> Hemiparesis, aphasia, visual loss.</li>
                            <li><strong>Altered Mental Status (up to 45%):</strong> Can range from lethargy to deep coma.</li>
                            <li><strong>Visual Disturbances:</strong> Papilledema, vision loss, and diplopia.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Diagnosis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            <h2 className="text-xl font-bold text-foreground">3. Diagnosis</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground mb-2">Due to non-specific symptoms, neuroimaging is essential for an accurate and early diagnosis.</p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                            <li><strong>MRI with MRV:</strong> The modality of choice and gold standard. Allows direct visualization of the thrombus and parenchymal lesions.</li>
                            <li><strong>CT with CTV:</strong> A reliable alternative when MRI is unavailable or contraindicated. Non-contrast CT can be normal in 25-30% of cases.</li>
                            <li><strong>D-dimer:</strong> Suggested before imaging in suspected acute cases; high sensitivity (89.1%).</li>
                            <li><strong>PF4 Antibodies:</strong> Recommended for suspected Vaccine-Induced Immune Thrombotic Thrombocytopenia.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Treatment and Management */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            <h2 className="text-xl font-bold text-foreground">4. Treatment and Management</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-primary">Anticoagulation</h3>
                            <p className="text-base text-muted-foreground mt-1">The cornerstone of treatment, even with intracranial hemorrhage.</p>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-2 space-y-1">
                                <li><strong>Initial:</strong> Low-Molecular-Weight Heparin (LMWH) is preferred.</li>
                                <li><strong>Long-Term:</strong> Transition to oral anticoagulants (VKAs or DOACs). DOACs are a safe and effective alternative.</li>
                                <li><strong>Duration:</strong> 3-12 months for transient risks; may be indefinite for chronic conditions.</li>
                                <li><strong>Pregnancy:</strong> LMWH is recommended throughout pregnancy and postpartum.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary">Other Interventions</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li><strong>Endovascular Treatment (EVT):</strong> Reserved as a rescue therapy for patients with clinical deterioration; no clear benefit over standard anticoagulation shown.</li>
                                <li><strong>Decompressive Craniectomy:</strong> A lifesaving approach for patients with severe swelling and impending herniation.</li>
                                <li><strong>Antiepileptic Drugs:</strong> Suggested for patients with supratentorial lesions and seizures to prevent recurrence.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Complications and Outcomes */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            <h2 className="text-xl font-bold text-foreground">5. Complications and Outcomes</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Functional Recovery Over Time</CardTitle>
                                <CardDescription>Percentage of patients with no or mild disability (mRS 0-1).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={outcomeConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart accessibilityLayer data={outcomeData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
                                            <YAxis unit="%" />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="mRS_0_1" fill={outcomeConfig.mRS_0_1.color} radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Mortality Rates by Subgroup</CardTitle>
                                <CardDescription>Mortality varies significantly based on cause and context.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={mortalityConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart accessibilityLayer data={mortalityData} layout="vertical">
                                            <CartesianGrid horizontal={false} />
                                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={100} tick={{ fontSize: 12 }} />
                                            <XAxis dataKey="rate" type="number" unit="%" />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={30}>
                                                {mortalityData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
                {/* Sources */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            <h2 className="text-xl font-bold text-foreground">Sources</h2>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-xs text-muted-foreground columns-1 md:columns-2">
                            <li className="break-inside-avoid">Algahtani, H., et al. (2022). *Brain Circulation*. <a href="https://doi.org/10.4103/bc.bc_50_22" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.4103/bc.bc_50_22</a></li>
                            <li className="break-inside-avoid">Doggalli, N., et al. (2025). *Cureus*. <a href="https://doi.org/10.7759/cureus.84719" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.7759/cureus.84719</a></li>
                            <li className="break-inside-avoid">Ferro, J. M., et al. (2017). *European Journal of Neurology*. <a href="https://doi.org/10.1111/ene.13381" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1111/ene.13381</a></li>
                            <li className="break-inside-avoid">Furie, K. L., et al. (2021). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.121.035564" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.121.035564</a></li>
                            <li className="break-inside-avoid">Khan, M. W. A., et al. (2020). *Cureus*. <a href="https://doi.org/10.7759/cureus.12221" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.7759/cureus.12221</a></li>
                            <li className="break-inside-avoid">Saposnik, G., et al. (2024). *Stroke*. <a href="https://doi.org/10.1161/STR.0000000000000456" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STR.0000000000000456</a></li>
                            <li className="break-inside-avoid">Sitthilok, P., et al. (2025). *PLoS ONE*. <a href="https://doi.org/10.1371/journal.pone.0316849" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1371/journal.pone.0316849</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key findings on Cerebral Venous Sinus Thrombosis (CVST) based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 31, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default CerebralVenousSinusThrombosisInfographic;
