'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
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

const abscessAccuracyData = [
    { name: 'DWI Accuracy', sensitivity: 93.2, specificity: 93.8 },
];

const abscessAccuracyConfig = {
    sensitivity: {
        label: 'Sensitivity',
        color: 'hsl(var(--chart-1))',
    },
    specificity: {
        label: 'Specificity',
        color: 'hsl(var(--chart-2))',
    },
};

const tumorAccuracyData = [
    { name: 'rCBV + Ktrans', accuracy: 92.8, key: 'rcbv' },
    { name: '18F-FET PET (Recurrence)', accuracy: 93, key: 'fetRecurrence' },
    { name: '18F-FET PET (Pseudoprog.)', accuracy: 96, key: 'fetPseudo' },
];

const tumorAccuracyConfig = {
    accuracy: {
        label: 'Diagnostic Accuracy',
    },
    rcbv: { color: 'hsl(var(--chart-1))' },
    fetRecurrence: { color: 'hsl(var(--chart-2))' },
    fetPseudo: { color: 'hsl(var(--chart-3))' },
};


// --- Main Infographic Component ---

const BrainLesionInfographic = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Differentiating Brain <GradientText>Lesions</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Tumors vs. Non-Neoplastic Conditions</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Introduction */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            Why is Accurate Diagnosis Crucial?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            Observing multiple lesions on a skull CT or MRI is a cause for concern, often pointing to a neoplastic etiology. However, a wide range of non-neoplastic conditions can mimic brain tumors, creating a potential pitfall. Accurate differentiation is critical because treatment strategies differ completely: ischemic lesions are treated with anticoagulants, demyelinating lesions with steroids, infections with targeted agents, and tumors often require surgery or radiotherapy. Due to potential neuroradiological misdiagnosis, histological analysis (biopsy) is frequently necessary for a definitive diagnosis.
                        </p>
                    </CardContent>
                </Card>

                {/* Brain Abscesses */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            1. Brain Abscesses (Infectious)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground">An intracerebral abscess is an encapsulated collection of pus, accounting for ~2% of intracranial mass lesions. Bacteria are responsible for {'>'}95% of cases in immunocompetent patients.</p>
                            <div>
                                <h3 className="font-semibold text-foreground">Imaging Characteristics:</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>**Conventional MRI:** Typically a ring-enhancing lesion with a smooth, complete capsule. Often surrounded by vasogenic edema.</li>
                                    <li>**DWI/ADC:** Hallmark feature is **restricted diffusion** within the central core (hyperintense on DWI, hypointense on ADC).</li>
                                    <li>**MRS:** Shows raised choline, reduced NAA, and prominent lipid and lactate peaks.</li>
                                </ul>
                            </div>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>DWI Diagnostic Accuracy</CardTitle>
                                <CardDescription>For differentiating abscesses from other lesions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={abscessAccuracyConfig} className="min-h-[150px] w-full">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart accessibilityLayer data={abscessAccuracyData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                            <YAxis unit="%" />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="sensitivity" fill="var(--color-sensitivity)" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="specificity" fill="var(--color-specificity)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* Brain Tumors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            2. Brain Tumors (Neoplastic)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-foreground">Imaging Characteristics:</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Conventional MRI:** Can also be ring-enhancing, but often with irregular or incomplete rims.</li>
                                <li>**DWI/ADC:** Necrotic tumors typically have **elevated ADC values** (no restricted diffusion), unlike abscesses.</li>
                                <li>**MRS:** Characterized by raised choline, reduced NAA, and increased Cho/NAA and Cho/Cr ratios.</li>
                                <li>**Perfusion MRI:** Tumor recurrence shows significantly **higher rCBV** and Ktrans values.</li>
                                <li>**Amino Acid PET:** Shows **higher uptake** in tumor tissue compared to treatment-related changes.</li>
                            </ul>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Imaging Accuracy</CardTitle>
                                <CardDescription>For differentiating tumor recurrence from necrosis.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={tumorAccuracyConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart accessibilityLayer data={tumorAccuracyData} layout="vertical">
                                            <CartesianGrid horizontal={false} />
                                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={180} tick={{ fontSize: 14 }} />
                                            <XAxis dataKey="accuracy" type="number" unit="%" />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={30}>
                                                {tumorAccuracyData.map((entry) => (
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

                {/* Radiation Necrosis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            3. Radiation Necrosis (Non-Neoplastic)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-base text-muted-foreground">A severe local tissue reaction after radiotherapy, typically 3-12 months post-treatment. It involves vascular injury, glial damage, and inflammation.</p>
                        <div>
                            <h3 className="font-semibold text-foreground">Imaging Characteristics:</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Conventional MRI:** Mimics tumor recurrence with increased, often irregular, contrast enhancement.</li>
                                <li>**MRS:** Characterized by **lower Cho/Cr and Cho/NAA ratios** compared to recurrent tumors.</li>
                                <li>**Perfusion MRI:** Shows **lower rCBV and Ktrans values** compared to tumor recurrence.</li>
                                <li>**Amino Acid PET:** Typically shows **lower uptake** compared to active tumor tissue.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Other Mimics & Diagnostic Summary */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            Other Mimics & Diagnostic Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-secondary">Other Non-Neoplastic Mimics:</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Infarcts:** Can sometimes mimic high-grade gliomas.</li>
                                <li>**Inflammatory/Granulomatous Lesions:** Tuberculomas, fungal infections.</li>
                                <li>**Demyelinating Diseases:** Tumefactive MS, PML (often with "open ring" enhancement).</li>
                                <li>**Vascular Diseases:** Such as vasculitis.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary">Summary of Diagnostic Approach:</h3>
                            <p className="text-base text-muted-foreground mt-1">
                                A multi-modal imaging approach is necessary. While conventional MRI provides anatomy, advanced techniques like DWI, MRS, and Perfusion MRI offer crucial functional and metabolic information. PET/CT further enhances accuracy. In challenging cases, **histopathological analysis remains the gold standard**.
                            </p>
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
                        <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                            <li className="break-inside-avoid">1. Babar, M., et al. (2015). *Pak J Med Health Sci*. (No DOI provided)</li>
                            <li className="break-inside-avoid">2. Chuang, M.-T., et al. (2016). *PLoS One*. <a href="https://doi.org/10.1371/journal.pone.0141438" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1371/journal.pone.0141438</a></li>
                            <li className="break-inside-avoid">3. Feraco, P., et al. (2020). *J Pract Transl Clin Pharmacol*. <a href="https://doi.org/10.15586/jptcp.v27i3.688" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.15586/jptcp.v27i3.688</a></li>
                            <li className="break-inside-avoid">4. Feng, A., et al. (2022). *Acad Radiol*. <a href="https://doi.org/10.1016/j.acra.2021.11.008" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/j.acra.2021.11.008</a></li>
                            <li className="break-inside-avoid">5. Grabovetskyi, S. (2015). *J Cancer Prev Curr Res*. <a href="https://doi.org/10.15406/jcpcr.2015.02.00052" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.15406/jcpcr.2015.02.00052</a></li>
                            <li className="break-inside-avoid">6. Lasocki, A., et al. (2025). *J Med Imaging Radiat Oncol*. <a href="https://doi.org/10.1111/1754-9485.13847" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1111/1754-9485.13847</a></li>
                            <li className="break-inside-avoid">7. Rabelo, N. N., et al. (2016). *Arq Bras Neurocir*. <a href="http://dx.doi.org/10.1055/s-0035-1570362" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1055/s-0035-1570362</a></li>
                            <li className="break-inside-avoid">8. Raiyani, J. J., et al. (2024). *Int J Med Health Res*. (No DOI provided)</li>
                            <li className="break-inside-avoid">9. Usuda, K., et al. (2021). *Cancers*. <a href="https://doi.org/10.3390/cancers13112720" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3390/cancers13112720</a></li>
                            <li className="break-inside-avoid">10. Zikou, A., et al. (2018). *BioMed Res Int*. <a href="https://doi.org/10.1155/2018/6828396" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1155/2018/6828396</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key clinicoradiological findings of Differentiating Brain Lesions based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 3, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default BrainLesionInfographic;
