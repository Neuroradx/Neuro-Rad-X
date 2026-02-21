
'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const intraventricularLocationData = [
    { name: 'Fourth Ventricle', frequency: 56.5, key: 'loc1' },
    { name: 'Lateral Ventricles', frequency: 25, key: 'loc2' },
    { name: 'Third Ventricle', frequency: 10, key: 'loc3' },
    { name: 'Aqueduct', frequency: 8.5, key: 'loc4' },
];

const intraventricularLocationConfig = {
    loc1: { label: 'Fourth Ventricle', color: 'hsl(var(--chart-1))' },
    loc2: { label: 'Lateral Ventricles', color: 'hsl(var(--chart-2))' },
    loc3: { label: 'Third Ventricle', color: 'hsl(var(--chart-3))' },
    loc4: { label: 'Aqueduct', color: 'hsl(var(--chart-4))' },
};


// --- Main Infographic Component ---

const NeurocysticercosisInfographic = () => {
    // Get current date for footer
    const currentDate = "October 9, 2025";
    const infoTheme = "Neurocysticercosis (NCC)";

    // --- Extracted Sources for Mandatory Sources Card ---
    const sources = [
        { title: 'Neurocysticercosis: Unwinding the radiological conundrum', source: 'Bhattacharjee, S., & Shameem, M. (2024)', url: 'https://doi.org/10.5114/pjr.2024.136868' },
        { title: 'Neurocysticercosis: Radiologic-pathologic correlation', source: 'Kimura-Hayama, E. T., et al. (2010)', url: 'https://doi.org/10.1148/rg.306105522' },
        { title: 'Clinical symptoms, diagnosis, and treatment of neurocysticercosis', source: 'Garcia, H. H., et al. (2014)', url: 'https://doi.org/10.1016/S1474-4422(14)70094-8' },
        { title: 'Predictors of hydrocephalus in patients with neurocysticercosis', source: 'Sharma, M., et al. (2016)', url: 'https://doi.org/10.1016/j.jns.2016.07.039' },
        { title: 'Neurocysticercosis: Five new things', source: 'Carpio, A., et al. (2013)', url: 'https://doi.org/10.1212/CPJ.0b013e31828d9f17' },
        { title: 'From seizures to epilepsy and its substrates: Neurocysticercosis', source: 'Singh, G., et al. (2013)', url: 'https://doi.org/10.1111/epi.12217' },
        { title: 'The role of conventional MR imaging sequences in the evaluation of neurocysticercosis', source: 'Lucato, L. T., et al. (2007)', url: 'https://doi.org/10.3174/ajnr.A0573' },
        { title: 'MR spectroscopy in neurocysticercosis', source: 'Jayakumar, P. N., et al. (2001)', url: 'https://pubmed.ncbi.nlm.nih.gov/11711809/' },
    ];


    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    <GradientText>Neurocysticercosis (NCC)</GradientText>: Radiological Aspects
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Comprehensive Analysis Based on Recent Evidence</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            1. Introduction & Pathophysiology
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-base">
                            Neurocysticercosis (NCC) is the most common parasitic CNS infection globally, caused by the larval form (cysticercus) of the pork tapeworm, *Taenia solium*. It's endemic in many developing regions and a leading cause of adult-onset epilepsy (approx. 1/3 of cases in endemic areas). Humans acquire NCC by ingesting parasite eggs via the fecal-oral route. Oncospheres hatch, penetrate the intestinal wall, enter the bloodstream, and lodge primarily in the CNS (gray-white matter junction, basal ganglia, cortex). Clinical presentation depends on the <strong className="text-primary">location, number, and evolutionary stage</strong> of the cysts, which dictates the host's inflammatory response.
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            2. Parenchymal NCC: Evolutionary Stages & Imaging
                        </CardTitle>
                        <CardDescription>Imaging varies dramatically by stage (Escobar's Classification).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>CT Findings</TableHead>
                                        <TableHead>MRI T1</TableHead>
                                        <TableHead>MRI T2</TableHead>
                                        <TableHead>MRI FLAIR</TableHead>
                                        <TableHead>MRI T1+C</TableHead>
                                        <TableHead>Key Feature</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Vesicular (Viable)</TableCell>
                                        <TableCell>Hypodense cyst, ± dot sign (scolex)</TableCell>
                                        <TableCell>CSF signal cyst, iso/hyper scolex</TableCell>
                                        <TableCell>CSF signal cyst</TableCell>
                                        <TableCell>Suppressed cyst, hyper scolex</TableCell>
                                        <TableCell>Usually none</TableCell>
                                        <TableCell>Visible scolex (pathognomonic)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Colloidal (Degenerating)</TableCell>
                                        <TableCell>Hyperdense content, ring enhancement, edema</TableCell>
                                        <TableCell>Hyperintense content</TableCell>
                                        <TableCell>Perilesional edema, ± wall ring</TableCell>
                                        <TableCell>Hyperintense content & edema</TableCell>
                                        <TableCell>Thick, regular ring enhancement</TableCell>
                                        <TableCell>Intense inflammation, edema</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Granular Nodular (Involution)</TableCell>
                                        <TableCell>Isodense/hyperdense nodule, ↓ edema</TableCell>
                                        <TableCell>Isointense nodule</TableCell>
                                        <TableCell>Variable signal</TableCell>
                                        <TableCell>Variable signal</TableCell>
                                        <TableCell>Nodular/smaller ring enhancement</TableCell>
                                        <TableCell>Shrinking lesion, resolving edema</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Nodular Calcified (Scar)</TableCell>
                                        <TableCell>Hyperdense nodule (CT best)</TableCell>
                                        <TableCell>Variable, ± hyperintense</TableCell>
                                        <TableCell>Signal void (T2*/SWI best)</TableCell>
                                        <TableCell>Signal void</TableCell>
                                        <TableCell>Usually none (± persistent enhancement)</TableCell>
                                        <TableCell>Calcification; may still cause seizures</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">*Note: Coexistence of lesions in different stages is highly suggestive of NCC.*</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            3. Extraparenchymal Forms (Higher Morbidity/Mortality)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-primary">Intraventricular (7-20%)</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p><strong>Risk:</strong> Obstructive hydrocephalus, ependymitis.</p>
                                <p><strong>Imaging Challenge:</strong> Cysts often isointense to CSF (invisible). Look for indirect signs (hydrocephalus) or use 3D CISS/FIESTA sequences.</p>
                                <ChartContainer config={intraventricularLocationConfig} className="min-h-[150px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart data={intraventricularLocationData} layout="vertical" margin={{ left: 80, right: 10 }}>
                                            <CartesianGrid horizontal={false} />
                                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 9 }} />
                                            <XAxis dataKey="frequency" type="number" unit="%" />
                                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="frequency" name="Frequency" radius={[0, 4, 4, 0]} barSize={30}>
                                                {intraventricularLocationData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                                <p className="text-xs text-center">Typical locations within ventricles.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-secondary">Subarachnoid/Racemose</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p><strong>Location:</strong> Basal cisterns, Sylvian fissures.</p>
                                <p><strong>Morphology:</strong> "Grape-like" clusters, often without scolex.</p>
                                <p><strong>Risks:</strong> Hydrocephalus, chronic arachnoiditis, vasculitis, infarcts.</p>
                                <p><strong>Imaging:</strong> Cysts isointense to CSF. Intense leptomeningeal enhancement indicates arachnoiditis.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base" style={{ color: 'hsl(var(--chart-5))' }}>Spinal (1-5%, Rare)</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p><strong>Types:</strong> Extramedullary-intradural (most common, often from CSF migration), Intramedullary (hematogenous).</p>
                                <p><strong>Imaging (MRI):</strong> Cysts isointense to CSF, ± ring enhancement. Intramedullary lesions mimic parenchymal stages.</p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            4. Advanced MRI Techniques
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><strong>High-Resolution T2 (3D-CISS/FIESTA):</strong> Essential for extraparenchymal disease. Excellent CSF-cyst contrast, improves scolex detection (visible in 93% with CISS).</p>
                        <p><strong>Diffusion-Weighted Imaging (DWI):</strong> Crucial for differentiating colloidal NCC (no/mild restriction) from pyogenic abscess (marked restriction). Scolex may show restriction in early degeneration.</p>
                        <p><strong>Susceptibility-Weighted Imaging (SWI):</strong> Highly sensitive for scolex (appears as a hypointense dot due to calcific corpuscles) and calcifications (shows "blooming").</p>
                        <p><strong>MR Spectroscopy (MRS):</strong> Powerful for differential diagnosis. NCC shows elevated <strong className="text-amber-600">Succinate</strong>, Alanine, Lactate; low NAA, Cr; low/normal Choline. Differentiates from Tuberculomas (↑ Lipids) and Tumors (↑↑ Choline).</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            5. Complications & Differential Diagnosis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h3 className="font-semibold text-destructive mb-2">Complications (Mainly Extraparenchymal)</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Vasculitis & Stroke:</strong> Arachnoiditis inflames basal arteries → stenosis/occlusion → infarcts (lacunar/territorial). MRA/CTA/DSA show segmental stenosis.</li>
                                <li><strong>Arachnoiditis & Hydrocephalus:</strong> Chronic inflammation → fibrosis → CSF obstruction (communicating or non-communicating). MRI+C shows leptomeningeal enhancement.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Differential Diagnosis (Ring-Enhancing Lesions)</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>vs. Tuberculoma:</strong> Tuberculomas often have T2 hypointense center, target sign, MRS shows high Lipids.</li>
                                <li><strong>vs. Pyogenic Abscess:</strong> Abscess shows marked central DWI restriction (low ADC).</li>
                                <li><strong>vs. Tumors (Metastasis/Glioblastoma):</strong> Tumors have irregular walls, more edema/mass effect, MRS shows high Choline.</li>
                            </ul>
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
                <p>This infographic summarizes radiological aspects of {infoTheme} based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default NeurocysticercosisInfographic;
