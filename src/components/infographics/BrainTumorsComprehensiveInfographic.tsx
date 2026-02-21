'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

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

const tumorFrequencyData = [
    { type: 'Metastases', frequency: 5, key: 'metastases' },
    { type: 'Primary CNS Tumors', frequency: 1, key: 'primary' },
];

const tumorFrequencyConfig = {
    frequency: { label: "Relative Frequency" },
    metastases: { label: 'Metastases', color: 'hsl(var(--chart-1))' },
    primary: { label: 'Primary CNS', color: 'hsl(var(--chart-2))' },
};

const pcnslIncidenceData: {
    group: string;
    rate: number;
    key: 'gp' | 'immuno' | 'elderly';
}[] = [
        { group: 'General Population', rate: 0.46, key: 'gp' },
        { group: 'Immunocompromised (Pre-HAART)', rate: 10, key: 'immuno' },
        { group: 'Elderly (65+)', rate: 2, key: 'elderly' },
    ];

const pcnslIncidenceConfig = {
    rate: { label: "Rate per 100k/year" },
    gp: { label: "General Population", color: 'hsl(var(--chart-1))' },
    immuno: { label: "Immunocompromised", color: 'hsl(var(--chart-5))' },
    elderly: { label: "Elderly (65+)", color: 'hsl(var(--chart-3))' },
};

const pinealSurvivalData: {
    lineage: string;
    survival: number;
    key: 'gct' | 'ppt';
}[] = [
        { lineage: 'Germ Cell Tumors (GCT)', survival: 78.9, key: 'gct' },
        { lineage: 'Pineal Parenchymal Tumors (PPT)', survival: 47.2, key: 'ppt' },
    ];

const pinealSurvivalConfig = {
    survival: { label: "5-Year Survival (%)" },
    gct: { color: 'hsl(var(--chart-2))' },
    ppt: { color: 'hsl(var(--chart-5))' },
};

// --- Main Infographic Component ---

const BrainTumorsComprehensiveInfographic = () => {
    const currentDate = "October 9, 2025";
    const infoTheme = "Brain Tumors & Metastases";

    const sources = [
        { title: 'Brain Tumors: An Overview', source: 'American Association of Neurological Surgeons (AANS)', url: '#' },
        { title: 'Metastatic Brain Tumors', source: 'American Brain Tumor Association', url: '#' },
        { title: 'Primary Central Nervous System Lymphoma (PCNSL)', source: 'Radiopaedia', url: '#' },
        { title: 'Pineal Region Tumors', source: 'StatPearls', url: '#' },
        { title: 'Imaging of Brain Tumors', source: 'AJR', url: '#' },
    ];

    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Integrated Neuro-Oncology Report: Brain Tumors & <GradientText>Metastases</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Epidemiology, Classification, and Advanced MRI Features</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.497 0 .98-.032 1.453-.091M12 21a8.958 8.958 0 01-1.453-.091m6.264-6.656a8.973 8.973 0 01-1.453.091M3.284 14.253a8.973 8.973 0 001.453.091M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 3c-.497 0-.98.032-1.453-.091M12 3a8.958 8.958 0 00-1.453-.091m6.264 6.656a8.973 8.973 0 001.453-.091M3.284 9.747a8.973 8.973 0 011.453-.091" />
                            <CardTitle>1. Epidemiology: Primary vs. Metastatic</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <p>Patient demographics (age, immune status) are key to differential diagnosis.</p>
                                <p><strong>Adults:</strong> <strong className="text-primary">Metastases are ~5x more common</strong> than primary CNS tumors, occurring in 20-30% of adults with advanced systemic cancer.</p>
                                <p><strong>Pediatrics:</strong> Metastases are rare (~1.4%); <strong className="text-primary">Primary CNS tumors dominate</strong> (e.g., Medulloblastoma, Pilocytic Astrocytoma).</p>
                                <p><strong>PCNSL:</strong> Rare overall (0.43-0.5/100k/year), but rising in the elderly, declining in HIV+ population due to HAART.</p>
                            </div>
                            <ChartContainer config={tumorFrequencyConfig} className="min-h-[150px] w-full">
                                <ResponsiveContainer width="100%" height={150}>
                                    <BarChart accessibilityLayer data={tumorFrequencyData} layout="vertical" margin={{ left: 100 }}>
                                        <CartesianGrid horizontal={false} />
                                        <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                        <XAxis dataKey="frequency" type="number" hide />
                                        <Tooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" hideLabel className="bg-popover text-popover-foreground" />}
                                        />
                                        <Bar dataKey="frequency" name="Relative Frequency" radius={[0, 4, 4, 0]} layout="vertical" barSize={30}>
                                            {tumorFrequencyData.map((entry) => (
                                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            <CardTitle>2. Classification by Location</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Definition</TableHead>
                                        <TableHead>Primary Examples</TableHead>
                                        <TableHead>Key Radiological Sign</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Extra-axial</TableCell>
                                        <TableCell>Outside parenchyma</TableCell>
                                        <TableCell>Meningioma, Schwannoma, Dural Mets</TableCell>
                                        <TableCell>CSF Cleft Sign, Dural Tail</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Intra-axial</TableCell>
                                        <TableCell>Within parenchyma</TableCell>
                                        <TableCell>Glioma, Parenchymal Mets, Lymphoma</TableCell>
                                        <TableCell>Infiltration, Perilesional Edema</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Intraventricular</TableCell>
                                        <TableCell>Within ventricles</TableCell>
                                        <TableCell>Ependymoma, CPP, Mets</TableCell>
                                        <TableCell>Location near Foramen Monro / 4th Ventricle</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            <CardTitle>3. Cerebral Metastases (BMs)</CardTitle>
                        </div>
                        <CardDescription>Most common intracranial neoplasm in adults.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-foreground mb-1 text-sm">Common Primary Sources:</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                            <li>Lung (most common)</li>
                            <li>Breast</li>
                            <li>Melanoma (high hemorrhage risk)</li>
                            <li>Renal Cell Carcinoma (RCC)</li>
                            <li>Colorectal Cancer</li>
                        </ul>
                        <Separator className="my-3" />
                        <h3 className="font-semibold text-foreground mb-1 text-sm">Key MRI Features:</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Multiple lesions, typically at gray-white junction.</li>
                            <li>Round, well-defined.</li>
                            <li>Surrounding vasogenic edema (T2/FLAIR hyperintensity).</li>
                            <li>Strong contrast enhancement (nodular or ring-like).</li>
                            <li>Hemorrhage common in Melanoma, RCC, Choriocarcinoma mets.</li>
                            <li><strong className="text-primary">MRI {'>'} CT</strong> for detection.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                            <CardTitle>4. Primary CNS Lymphoma (PCNSL)</CardTitle>
                        </div>
                        <CardDescription>Rare, aggressive non-Hodgkin lymphoma confined to CNS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <h3 className="font-semibold text-foreground mb-1">Epidemiology:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Incidence rising in elderly immunocompetent.</li>
                                    <li>Strong association with immunosuppression (HIV/AIDS, transplant).</li>
                                </ul>
                                <Separator className="my-3" />
                                <h3 className="font-semibold text-foreground mb-1 mt-3">Key MRI Features (Immunocompetent):</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Typically single (75%) or few lesions.</li>
                                    <li>Location: Periventricular WM, corpus callosum, basal ganglia.</li>
                                    <li>Signal: Iso/hypo T1, Iso/Hyper T2 (less than edema).</li>
                                    <li>Enhancement: <strong className="text-primary">Intense, homogeneous</strong>.</li>
                                    <li>Diffusion: <strong className="text-destructive">Restricted diffusion (Low ADC)</strong> due to high cellularity.</li>
                                    <li>Perfusion: Variable, often low rCBV.</li>
                                    <li>MRS: ↑Cho, ↑Lipid, ↓NAA.</li>
                                </ul>
                                <Separator className="my-3" />
                                <h3 className="font-semibold text-foreground mb-1 mt-3">Key MRI Features (Immunocompromised):</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Often multiple, necrotic centers, irregular/ring enhancement. Mimics Toxoplasmosis.</li>
                                </ul>
                            </div>
                            <Card>
                                <CardHeader className="p-2">
                                    <CardTitle className="text-base">PCNSL Incidence Rates</CardTitle>
                                    <CardDescription className="text-xs">Rate per 100,000 person-years by group.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ChartContainer config={pcnslIncidenceConfig} className="min-h-[200px] w-full">
                                        <BarChart
                                            accessibilityLayer
                                            data={pcnslIncidenceData}
                                            layout="vertical"
                                            margin={{ left: 10, right: 10 }}
                                        >
                                            <XAxis type="number" dataKey="rate" hide />
                                            <YAxis
                                                dataKey="group"
                                                type="category"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Bar dataKey="rate" layout="vertical" radius={[0, 4, 4, 0]} barSize={25}>
                                                {pcnslIncidenceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={pcnslIncidenceConfig[entry.key].color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <CardTitle>5. MRI Differentiation: Glioblastoma vs. Solitary Metastasis</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>Glioblastoma (GBM)</TableHead>
                                        <TableHead>Solitary Metastasis</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Location</TableCell>
                                        <TableCell>Deep Subcortical WM</TableCell>
                                        <TableCell>Cortico-Subcortical Junction</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Enhancement</TableCell>
                                        <TableCell>Thick, irregular, heterogeneous ring</TableCell>
                                        <TableCell>Spherical nodule or thin ring</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Infiltration (MRS)</TableCell>
                                        <TableCell>Elevated Cho/NAA in edema</TableCell>
                                        <TableCell>Normal/depressed Cho/NAA in edema</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Spread</TableCell>
                                        <TableCell>Along corpus callosum/subependymal</TableCell>
                                        <TableCell>Hematogenous, rarely crosses midline</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.654 5.654a2.652 2.652 0 01-3.752-3.752l5.654-4.654M3 3l3.59 3.59m0 0A2.652 2.652 0 019 9m7.5-3A2.652 2.652 0 0013.5 3m-3 0a2.652 2.652 0 00-3 3.59" />
                            <CardTitle>6. Low-Grade Diffuse Gliomas (LGG) & Molecular Surrogates</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Imaging can suggest molecular status (IDH mutation, 1p/19q codeletion).</p>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>Astrocytoma (IDH-mut, 1p/19q-intact)</TableHead>
                                        <TableHead>Oligodendroglioma (IDH-mut, 1p/19q-codeleted)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">T2-FLAIR Mismatch Sign</TableCell>
                                        <TableCell><strong className="text-primary">Frequent ({'>'}50% lesion)</strong></TableCell>
                                        <TableCell>Uncommon</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Calcification</TableCell>
                                        <TableCell>Absent or minimal</TableCell>
                                        <TableCell><strong className="text-primary">Frequent (Conglomerate)</strong></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Contrast Enhancement</TableCell>
                                        <TableCell>Rare (Gr II) to Variable (Gr III)</TableCell>
                                        <TableCell>Variable (~50%)</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            <CardTitle>7. Posterior Fossa & Intraventricular Tumors</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-foreground mb-2 text-sm">Posterior Fossa (Pediatric Focus):</h3>
                        <div className="overflow-x-auto mb-4">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tumor</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Diffusion (ADC)</TableHead>
                                        <TableHead>Key Feature</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Medulloblastoma</TableCell>
                                        <TableCell>4th Ventricle (Midline/Vermis)</TableCell>
                                        <TableCell><strong className="text-destructive">Restricted (Low ADC)</strong></TableCell>
                                        <TableCell>Hyperdense CT, CSF seeding risk</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Ependymoma</TableCell>
                                        <TableCell>4th Ventricle (Floor/Roof)</TableCell>
                                        <TableCell>Often Restricted</TableCell>
                                        <TableCell>"Plastic" tumor, calcification common</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Pilocytic Astrocytoma</TableCell>
                                        <TableCell>Cerebellum (Lateral)</TableCell>
                                        <TableCell>Not Restricted (High ADC)</TableCell>
                                        <TableCell>Cyst with enhancing mural nodule</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <Separator className="my-3" />
                        <h3 className="font-semibold text-foreground mb-2 text-sm">Intraventricular (Lateral/3rd):</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li><strong>Central Neurocytoma:</strong> Near Foramen Monro, avid homogeneous enhancement, often calcified.</li>
                            <li><strong>Choroid Plexus Papilloma (CPP):</strong> Children (lat vent), Adults (4th vent), intense lobulated enhancement, flow voids.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.32h5.368a.563.563 0 01.321.988l-4.204 3.055a.563.563 0 00-.182.635l2.125 5.11a.563.563 0 01-.84.61l-4.203-3.055a.563.563 0 00-.676 0l-4.203 3.055a.563.563 0 01-.84-.61l2.125-5.11a.563.563 0 00-.182-.635l-4.204-3.055a.563.563 0 01.321-.988h5.368a.563.563 0 00.475-.32L11.48 3.5z" />
                            <CardTitle>8. Pineal Region Tumors</CardTitle>
                        </div>
                        <CardDescription>Rare ({'<'}1% CNS tumors), age is key differentiator.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <h3 className="font-semibold text-foreground mb-1">Age & Lineage:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Pediatric/Young Adult:</strong> Dominated by Germ Cell Tumors (GCTs - esp. Germinoma) and Pineoblastoma (PB).</li>
                                    <li><strong>Adult:</strong> Dominated by Pineocytoma (PC), PPTID, and Pineal Cysts.</li>
                                </ul>
                                <Separator className="my-3" />
                                <h3 className="font-semibold text-foreground mb-1 mt-3">Key MRI Differentiators:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Calcification Pattern:</strong> <strong className="text-primary">Engulfed = GCT</strong>, <strong className="text-primary">Exploded = PPT</strong>.</li>
                                    <li><strong>ADC Value:</strong> <strong className="text-destructive">Very Low = PB</strong>, <strong className="text-destructive">Low = Germinoma</strong>, High = PC/Cyst.</li>
                                </ul>
                            </div>
                            {/* ----- INICIO DE LA SECCIÓN CORREGIDA ----- */}
                            <Card>
                                <CardHeader className="p-2">
                                    <CardTitle className="text-base">Pineal Tumor 5-Year Survival</CardTitle>
                                    <CardDescription className="text-xs">Survival differs significantly by lineage.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ChartContainer config={pinealSurvivalConfig} className="min-h-[150px] w-full">
                                        <ResponsiveContainer width="100%" height={150}>
                                            <BarChart accessibilityLayer data={pinealSurvivalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="lineage" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} angle={-15} textAnchor="end" height={40} interval={0} />
                                                <YAxis unit="%" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                                <Tooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent indicator="dot" hideLabel className="bg-popover text-popover-foreground" />}
                                                />
                                                <Bar dataKey="survival" name="5-Yr Survival" radius={[4, 4, 0, 0]} barSize={40}>
                                                    {pinealSurvivalData.map((entry) => (
                                                        <Cell key={entry.lineage} fill={pinealSurvivalConfig[entry.key].color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            {/* ----- FIN DE LA SECCIÓN CORREGIDA ----- */}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            <CardTitle>Sources</CardTitle>
                        </div>
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

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key aspects of {infoTheme} based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="http://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default BrainTumorsComprehensiveInfographic;