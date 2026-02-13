'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from "@/components/ui/badge"; // Importación que faltaba en el código original

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

const Section = ({ title, iconPath, children }: { title: string, iconPath: string, children: React.ReactNode }) => (
    <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center">
                <svg className="h-7 w-7 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
                <CardTitle>{title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);


// --- Chart Data & Config ---

const survivalData: {
    grade: string;
    survival: number;
    key: 'grade2' | 'grade3';
}[] = [
  { grade: 'WHO Grade 2', survival: 95, key: 'grade2' },
  { grade: 'WHO Grade 3', survival: 75, key: 'grade3' },
];

const survivalConfig = {
    survival: { label: '5-Year Survival'},
    grade2: { color: 'hsl(var(--chart-2))' },
    grade3: { color: 'hsl(var(--chart-5))' },
}

// --- Main Infographic Component ---

const OligodendrogliomaInfographic = () => {
    const { t } = useTranslation();
    const currentDate = "October 9, 2025";
    const infoTheme = "IDH-Mutated, 1p/19q Codeleted Oligodendroglioma";
    
    const sources = [
        { title: 'The 2021 WHO Classification of Tumors of the Central Nervous System: a summary', source: 'Louis, D. N., et al. (2021). Neuro-oncology', url: 'https://doi.org/10.1093/neuonc/noab106' },
        { title: 'Oligodendroglioma and Other IDH-Mutated Tumors: Diagnosis and Treatment', source: 'National Cancer Institute', url: 'https://www.cancer.gov/rare-brain-spine-tumor/tumors/oligodendroglioma' },
        { title: 'Oligodendroglioma: a critical appraisal', source: 'Wesseling, P., et al. (2015). Clinical Neuropathology', url: 'https://pubmed.ncbi.nlm.nih.gov/26068995/' },
        { title: 'Oligodendroglioma', source: 'Radiopaedia.org', url: 'https://radiopaedia.org/articles/oligodendroglioma' },
        { title: 'Implication of radiological pattern in the prognosis of oligodendroglial tumors', source: 'García‐Figueiras, R., et al. (2011). Revista de neurologia', url: 'https://pubmed.ncbi.nlm.nih.gov/21448834/' },
        { title: 'Oligodendroglioma - Symptoms and causes', source: 'Mayo Clinic', url: 'https://www.mayoclinic.org/diseases-conditions/oligodendroglioma/symptoms-causes/syc-20576736' },
        { title: 'Detection of Intratumoral Calcification in Oligodendrogliomas by Susceptibility-Weighted MR Imaging', source: 'Jeon, H. M., et al. (2019). Korean Journal of Radiology', url: 'https://doi.org/10.3348/kjr.2019.0149' },
        { title: 'Grading of oligodendroglial tumors of the brain with apparent diffusion coefficient, magnetic resonance spectroscopy, and dynamic susceptibility contrast imaging', source: 'Kim, Y., et al. (2011). Korean Journal of Radiology', url: 'https://doi.org/10.3348/kjr.2011.12.6.665' },
        { title: 'Modern imaging of oligodendroglioma', source: 'Villanueva-Meyer, J. E., et al. (2017). Neuro-Oncology', url: 'https://doi.org/10.1093/neuonc/now150' },
        { title: 'Advanced MRI Techniques for Glioma', source: 'Lasocki, A., et al. (2020). AJNR Am J Neuroradiol', url: 'https://doi.org/10.3174/ajnr.A6680' },
    ];


    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    IDH-Mutated, 1p/19q Codeleted <GradientText>Oligodendroglioma</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">An Expert Report on Epidemiology and Advanced Biomarkers</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            1. Introduction & Molecular Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            Oligodendroglioma (ODG) diagnosis was redefined by the WHO 2016/2021 classifications. It's now a <strong className="text-primary">molecularly defined tumor</strong>, requiring both an <strong className="text-primary">IDH mutation (IDH1/IDH2)</strong> and the <strong className="text-primary">1p/19q codeletion</strong>. This genetic signature predicts favorable prognosis and better response to chemoradiation compared to other gliomas. Histologically graded as WHO Grade 2 (low-grade) or Grade 3 (malignant).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.497 0 .98-.032 1.453-.091M12 21a8.958 8.958 0 01-1.453-.091m6.264-6.656a8.973 8.973 0 01-1.453.091M3.284 14.253a8.973 8.973 0 001.453.091M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 3c-.497 0-.98.032-1.453-.091M12 3a8.958 8.958 0 00-1.453-.091m6.264 6.656a8.973 8.973 0 001.453-.091M3.284 9.747a8.973 8.973 0 011.453-.091" />
                            2. Epidemiology & Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                           <li><strong>Incidence:</strong> ~0.3 per 100,000 population/year (5-25% of all gliomas).</li>
                           <li><strong>Peak Age:</strong> Adults, commonly 20-60 years. Rare in children.</li>
                           <li><strong>Sex:</strong> Slight male predominance.</li>
                           <li><strong>Location:</strong> Typically <strong className="text-primary">supratentorial</strong>, with predilection for <strong className="text-primary">frontal or temporal lobes</strong>.</li>
                           <li><strong>Growth Pattern:</strong> Infiltrative, involving both cortex and subcortical white matter.</li>
                           <li><strong>Common Symptom:</strong> <strong className="text-amber-600 dark:text-amber-400">Seizures</strong> due to cortical involvement.</li>
                        </ul>
                    </CardContent>
                </Card>
                
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                             <SectionIcon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            3. Conventional Imaging Findings
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                         <div className="overflow-x-auto">
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Modality/Sequence</TableHead>
                                        <TableHead>Typical Sign</TableHead>
                                        <TableHead>Comments</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">CT</TableCell>
                                        <TableCell>Hypodensity, <strong className="text-amber-600 dark:text-amber-400">Intratumoral Calcifications</strong></TableCell>
                                        <TableCell>Calcification is the classic sign; SWI is more sensitive.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">MRI T1</TableCell>
                                        <TableCell>Hypointense</TableCell>
                                        <TableCell>Reflects high water content.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">MRI T2/FLAIR</TableCell>
                                        <TableCell>Hyperintense, often heterogeneous</TableCell>
                                        <TableCell>Cortical infiltration often seen.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">MRI SWI/GRE</TableCell>
                                        <TableCell><strong className="text-amber-600 dark:text-amber-400">"Blooming" Effect</strong></TableCell>
                                        <TableCell>Superior detection of calcifications & microhemorrhage.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">MRI T1 C+ (Gd)</TableCell>
                                        <TableCell>Variable Enhancement (~50%)</TableCell>
                                        <TableCell><strong className="text-destructive">Low reliability for histological grading (II vs. III)</strong>.</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            4. Advanced Radiological Biomarkers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                             <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Technique</TableHead>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Typical Finding in ODG</TableHead>
                                        <TableHead>Grading Utility (II vs. III)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">DWI/ADC</TableCell>
                                        <TableCell>ADC Value</TableCell>
                                        <TableCell>High (no restriction)</TableCell>
                                        <TableCell>Good for differentiating from high-grade astrocytomas (low ADC).</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">MRS</TableCell>
                                        <TableCell>Cho/NAA, Cho/Cr, Lipids</TableCell>
                                        <TableCell>Increased Cho/NAA; prominent lipid peak</TableCell>
                                        <TableCell>High Cho/Cr suggests Grade III, but overlap limits certainty. Guides biopsy.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">PWI (Perfusion)</TableCell>
                                        <TableCell>rCBV</TableCell>
                                        <TableCell>Generally low ({'<'}1.5 in Grade II)</TableCell>
                                        <TableCell><strong className="text-destructive">Poor reliable correlation</strong>. Not a primary marker for ODG malignancy.</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Unlike astrocytomas, malignancy (Grade III) in ODG often lacks markedly elevated rCBV, relying more on MRS findings and growth.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M16.023 9.348h4.992v-.001a.75.75 0 01.75.75c0 .414-.336.75-.75.75h-4.992a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 0112 4.5v-2.25c0-.414.336-.75.75-.75s.75.336.75.75V4.5a.75.75 0 00.75.75h3.037a.75.75 0 010 1.5H13.5a.75.75 0 00-.75.75V9a2.25 2.25 0 012.273-2.25zM5.25 6.75c0-.414.336-.75.75-.75H9a.75.75 0 010 1.5H6a.75.75 0 000 1.5h3a.75.75 0 010 1.5H6a.75.75 0 000 1.5h3a.75.75 0 010 1.5H6a.75.75 0 00-.75.75v1.5c0 .414-.336-.75-.75.75s-.75-.336-.75-.75v-1.5A2.25 2.25 0 015.25 9V6.75z" />
                           5. Radiogenomics & Prognosis
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <h3 className="font-semibold text-foreground mb-1">Predicting 1p/19q Codeletion:</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                            <li><strong className="text-amber-600 dark:text-amber-400">Calcification:</strong> Strongest morphological predictor.</li>
                            <li><strong className="text-primary">Cortical Infiltration:</strong> Characteristic growth pattern.</li>
                            <li><strong className="text-purple-600 dark:text-purple-400">Low rCBV / High ADC:</strong> Functional profile leaning towards ODG.</li>
                        </ul>
                        {/* ----- INICIO DE LA SECCIÓN CORREGIDA ----- */}
                        <Card className="mt-4">
                            <CardHeader className="p-2">
                               <CardTitle className="text-base">5-Year Survival by WHO Grade</CardTitle>
                               <CardDescription className="text-xs">Illustrates the significant prognostic impact of grade.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ChartContainer config={survivalConfig} className="min-h-[150px] w-full">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart accessibilityLayer data={survivalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="grade" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                            <YAxis unit="%" domain={[0, 100]}/>
                                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="survival" name="5-Year Survival" radius={4}>
                                                {survivalData.map((entry) => (
                                                    <Cell key={`cell-${entry.grade}`} fill={survivalConfig[entry.key].color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        {/* ----- FIN DE LA SECCIÓN CORREGIDA ----- */}
                        <p className="text-xs text-muted-foreground mt-2">1p/19q codeletion predicts superior survival and chemo/radiosensitivity.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            6. Follow-up & Clinical Implications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-2">
                           <li><strong>Monitoring:</strong> Regular MRI (at least annually) is crucial due to slow growth and risk of anaplastic transformation.</li>
                           <li><strong>Signs of Progression:</strong> Increased volume, new/progressive enhancement, or rising Cho/NAA ratio on MRS may indicate transformation to Grade 3.</li>
                           <li><strong>Therapeutic Guidance:</strong> MRI guides maximal safe resection. Radiogenomic profile (suggested by imaging) determines chemo/radiotherapy decisions.</li>
                        </ul>
                    </CardContent>
                </Card>
                
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
                <p>This infographic summarizes key findings on {infoTheme} based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default OligodendrogliomaInfographic;