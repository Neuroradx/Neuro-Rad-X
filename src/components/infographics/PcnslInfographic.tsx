'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from '@/hooks/use-translation';
import { BarChart as BarChartIcon, BrainCircuit, Droplet, Microscope, ShieldCheck, GitCompareArrows, ScanEye, Activity, Globe, ScrollText, Info } from 'lucide-react';


// --- Helper Components ---

const GradientText = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400 text-transparent bg-clip-text">
        {children}
    </span>
);

const SectionIcon = ({ icon: Icon, className = "text-primary" }: { icon: React.ElementType, className?: string }) => (
    <Icon className={`h-8 w-8 mr-3 flex-shrink-0 ${className}`} />
);

// --- Chart Data & Config ---

const pcnslIncidenceData: {
    group: string;
    rate: number;
    key: 'gp' | 'immuno' | 'elderly';
}[] = [
        { group: 'General Population', rate: 0.46, key: 'gp' },
        { group: 'HIV+ (Post-HAART)', rate: 1, key: 'immuno' },
        { group: 'Elderly (65+)', rate: 2, key: 'elderly' },
    ];

const pcnslIncidenceConfig = {
    rate: { label: "Rate per 100k/year" },
    gp: { label: 'General Population', color: 'hsl(var(--chart-1))' },
    immuno: { label: 'HIV+ (Post-HAART)', color: 'hsl(var(--chart-3))' },
    elderly: { label: 'Elderly (65+)', color: 'hsl(var(--chart-2))' },
};

const survivalData: {
    group: string;
    survival: number;
    key: 'immunoComp' | 'hiv';
}[] = [
        { group: 'Immunocompetent', survival: 30.1, key: 'immunoComp' },
        { group: 'HIV+', survival: 9.0, key: 'hiv' },
    ];

const survivalConfig = {
    survival: { label: "5-Year Survival (%)" },
    immunoComp: { label: 'Immunocompetent', color: 'hsl(var(--chart-2))' },
    hiv: { label: 'HIV+', color: 'hsl(var(--chart-5))' },
};


// --- Main Infographic Component ---

const PcnslInfographic = () => {
    const { t } = useTranslation();
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Primary CNS <GradientText>Lymphoma (PCNSL)</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Epidemiology, Etiopathogenesis, and Advanced Diagnostic Neuroimaging</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={Info} />
                            <CardTitle>1. Introduction & Epidemiological Shifts</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <p>PCNSL is an aggressive extranodal NHL confined to the neuroaxis (brain, spine, eyes, leptomeninges), primarily DLBCL (&gt;90%). It accounts for 3-4% of primary CNS tumors.</p>
                                <p>Incidence is low (~0.43-0.5/100k/year) but has shifted: <strong className="text-destructive">declining in HIV+ patients</strong> due to HAART (from 64% to 13% of cases) but <strong className="text-primary">rising in the elderly immunocompetent</strong> (65+ years).</p>
                                <p>Median age: 67 (immunocompetent), 37 (HIV+), 52 (transplant). Male predominance in immunosuppressed groups.</p>
                                <p><strong>Key Risk Factor:</strong> Immunodeficiency (HIV/AIDS, transplant immunosuppression). EBV is crucial in these settings.</p>
                            </div>
                            <Card>
                                <CardHeader className="p-2">
                                    <CardTitle className="text-base">PCNSL Incidence Rates</CardTitle>
                                    <CardDescription className="text-xs">Rate per 100,000 person-years by group.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ChartContainer config={pcnslIncidenceConfig} className="min-h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart accessibilityLayer data={pcnslIncidenceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="group" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} angle={-30} textAnchor="end" height={50} interval={0} />
                                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                                <Bar dataKey="rate" name="Incidence Rate" radius={[4, 4, 0, 0]} barSize={40}>
                                                    {pcnslIncidenceData.map((entry) => (
                                                        <Cell key={`cell-${entry.key}`} fill={pcnslIncidenceConfig[entry.key].color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={ScanEye} />
                            <CardTitle>2. Conventional Neuroimaging Features</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <h3 className="font-semibold text-foreground mb-1">Morphology & Location:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Focal or multifocal masses. Solitary in immunocompetent, often multiple in immunocompromised.</li>
                                    <li>Predilection for periventricular WM, corpus callosum (24%), basal ganglia (27%), cerebral hemispheres (66%). Subependymal spread common.</li>
                                    <li>Signal: Typically T1 hypointense, T2 iso/hypointense relative to gray matter (due to high cellularity).</li>
                                    <li>Hemorrhage: Foci visible on SWI in ~50%.</li>
                                </ul>
                            </div>
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <h3 className="font-semibold text-foreground mb-1">Contrast Enhancement (Immune Status Dependent):</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Immunocompetent (Classic):</strong> <strong className="text-primary">Intense, homogeneous</strong> enhancement is characteristic (&gt;90%). Minimal necrosis.</li>
                                    <li><strong>Immunocompromised (Atypical):</strong> Peripheral <strong className="text-destructive">ring enhancement</strong> or heterogeneous patterns common (10-15% overall). Central necrosis frequent, mimics toxoplasmosis.</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={Microscope} />
                            <CardTitle>3. Advanced Diagnostic Neuroimaging: Quantitative Biomarkers</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Technique</TableHead>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Typical Finding in PCNSL</TableHead>
                                        <TableHead>Significance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">DWI/ADC</TableCell>
                                        <TableCell>ADC Value</TableCell>
                                        <TableCell><strong className="text-destructive">Significantly Low</strong> (Restricted Diffusion, ~400-600 x 10⁻⁶)</TableCell>
                                        <TableCell>Key differentiator vs. GBM & Toxo (higher ADC). Reflects extreme cellularity.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">PWI (Perfusion)</TableCell>
                                        <TableCell>rCBV (tumor core)</TableCell>
                                        <TableCell><strong className="text-primary">Low or Modest Increase</strong></TableCell>
                                        <TableCell>Contrasts GBM (high rCBV). PCNSL uses host vessels, lacks intense neo-angiogenesis.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">PWI (Perfusion)</TableCell>
                                        <TableCell>rCBV (peritumoral)</TableCell>
                                        <TableCell>Low (similar to normal WM)</TableCell>
                                        <TableCell>Indicates pure vasogenic edema, unlike GBM's infiltrative (high rCBV) edema.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">MRS</TableCell>
                                        <TableCell>Cho/NAA, Cho/Cr, Lipids/Lac</TableCell>
                                        <TableCell>↑↑Cho/NAA (&gt;1.73), ↑Cho/Cr (&gt;2.39), ↑↑Lipids/Lactate</TableCell>
                                        <TableCell>Reflects high proliferation & necrosis. Higher Lip/Lac correlates with worse survival.</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">The combination of <strong className="text-destructive">Low ADC</strong> and <strong className="text-primary">Low rCBV</strong> is a powerful radiological signature for PCNSL.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={GitCompareArrows} />
                            <CardTitle>4. DDx: PCNSL vs. Glioblastoma (GBM)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>PCNSL</TableHead>
                                        <TableHead>GBM</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Enhancement</TableCell>
                                        <TableCell><strong className="text-primary">Intense, Solid, Homogeneous</strong></TableCell>
                                        <TableCell>Irregular, Thick Ring</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Necrosis</TableCell>
                                        <TableCell>Minimal/Absent (Classic)</TableCell>
                                        <TableCell>Extensive Central Necrosis</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Tumor ADC</TableCell>
                                        <TableCell><strong className="text-destructive">Low (Restricted)</strong></TableCell>
                                        <TableCell>Higher (Facilitated)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Tumor rCBV</TableCell>
                                        <TableCell><strong className="text-primary">Low/Modest</strong></TableCell>
                                        <TableCell><strong className="text-destructive">High</strong> (Neo-angiogenesis)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Peritumoral rCBV</TableCell>
                                        <TableCell>Low (Vasogenic Edema)</TableCell>
                                        <TableCell><strong className="text-destructive">High</strong> (Tumor Infiltration)</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={GitCompareArrows} />
                            <CardTitle>5. DDx: PCNSL vs. Toxoplasmosis</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>PCNSL (Immunocompromised)</TableHead>
                                        <TableHead>Cerebral Toxoplasmosis</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Multiplicity</TableCell>
                                        <TableCell>Solitary or Multiple (~50/50)</TableCell>
                                        <TableCell>Multiple (most common)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Location</TableCell>
                                        <TableCell>Periventricular WM, CC, BG</TableCell>
                                        <TableCell>BG, Thalamus, Corticomedullary Junction</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Enhancement</TableCell>
                                        <TableCell>Ring Enhancement Common</TableCell>
                                        <TableCell>Ring Enhancement ("Target Sign")</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">ADC</TableCell>
                                        <TableCell><strong className="text-destructive">Low (Restricted)</strong></TableCell>
                                        <TableCell>Higher (Facilitated - Necrosis)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">PET/SPECT</TableCell>
                                        <TableCell><strong className="text-primary">High Metabolic Uptake</strong> (FDG/Thallium Avid)</TableCell>
                                        <TableCell>Low Metabolic Uptake (Non-Avid)</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={Activity} />
                            <CardTitle>6. Prognosis & Therapeutic Implications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="text-sm space-y-2 text-muted-foreground">
                                <p>Prognosis remains challenging but has improved. Accurate non-invasive diagnosis guides therapy.</p>
                                <p><strong>Treatment:</strong> Primarily high-dose methotrexate (HD-MTX) based chemotherapy. Surgery is generally contraindicated and harmful.</p>
                                <p><strong>Diagnostic Impact:</strong> Differentiating PCNSL from GBM avoids unnecessary surgery. Distinguishing from Toxo in HIV+ patients guides initial anti-infective trial vs. biopsy/chemo.</p>
                            </div>
                            <Card>
                                <CardHeader className="p-2">
                                    <CardTitle className="text-base">PCNSL 5-Year Survival Rates</CardTitle>
                                    <CardDescription className="text-xs">Comparison by immune status (historical data).</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ChartContainer config={survivalConfig} className="min-h-[150px] w-full">
                                        <ResponsiveContainer width="100%" height={150}>
                                            <BarChart accessibilityLayer data={survivalData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="group" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                                <YAxis unit="%" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                                <Bar dataKey="survival" name="5-Yr Survival" radius={[4, 4, 0, 0]} barSize={40}>
                                                    {survivalData.map((entry) => (
                                                        <Cell key={`cell-${entry.key}`} fill={survivalConfig[entry.key].color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground mt-4">Untreated PCNSL is often fatal within 2-6 months. Prognosis is poor if immune reconstitution is not possible (e.g., certain malignancies).</p>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center">
                            <SectionIcon icon={ScrollText} />
                            <CardTitle>Sources</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-xs text-muted-foreground columns-1 md:columns-2">
                            <li className="break-inside-avoid">Villano, J. L., et al. (2011). Age, gender, and racial differences in incidence and survival in primary CNS lymphoma. *British Journal of Cancer*, *105*(9), 1414–1818. <a href="https://doi.org/10.1038/bjc.2011.357" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                            <li className="break-inside-avoid">Al Tawalbeh, S., & Tadi, P. (2023). Central Nervous System Lymphoma. In *StatPearls*. StatPearls Publishing. Retrieved from <a href="https://www.ncbi.nlm.nih.gov/books/NBK545145/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NCBI Bookshelf</a></li>
                            <li className="break-inside-avoid">Lauria, F., et al. (2022). Primary CNS lymphoma in HIV positive and negative patients: comparison of clinical characteristics, outcome and prognostic factors. *Journal of Neuro-Oncology*, *160*(1), 129-141. <a href="https://doi.org/10.1007/s11060-022-04149-x" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                            <li className="break-inside-avoid">Kwon, M., et al. (2010). MRI Findings of Primary CNS Lymphoma in 26 Immunocompetent Patients. *Korean Journal of Radiology*, *11*(3), 275-283. <a href="https://doi.org/10.3348/kjr.2010.11.3.275" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                            <li className="break-inside-avoid">Shiels, M. S., et al. (2016). Trends in Primary Central Nervous System Lymphoma Incidence and Survival in the U.S. *British Journal of Haematology*, *174*(3), 417-424. <a href="https://doi.org/10.1111/bjh.14073" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                            <li className="break-inside-avoid">Radiopaedia.org. (n.d.). *Lymphomas of the central nervous system*. Retrieved {currentDate}, from <a href="https://radiopaedia.org/articles/lymphomas-of-the-central-nervous-system" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Radiopaedia.org</a></li>
                            <li className="break-inside-avoid">Bühring, U., et al. (2001). MRI features of primary central nervous system lymphomas at presentation. *Neurology*, *57*(3), 393-396. (Implied source for ResearchGate 7815994)</li>
                            <li className="break-inside-avoid">Sailer, M., et al. (2021). MRI imaging features of HIV-related central nervous system diseases: diagnosis by pattern recognition in daily practice. *Clinical Neuroradiology*, *31*(4), 1145–1162. <a href="https://doi.org/10.1007/s00062-021-01053-9" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                            <li className="break-inside-avoid">Wang, S., et al. (2022). Differentiation Between Primary Central Nervous System Lymphoma and Atypical Glioblastoma Based on MRI. *Frontiers in Oncology*, *12*, 811197. <a href="https://doi.org/10.3389/fonc.2022.811197" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                            <li className="break-inside-avoid">Hu, L. S., et al. (2022). Differentiation of glioblastoma and primary central nervous system lymphomas using multiparametric diffusion and perfusion MRI. *Frontiers in Oncology*, *12*, 995804. <a href="https://doi.org/10.3389/fonc.2022.995804" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI</a></li>
                        </ul>
                    </CardContent>
                </Card>

            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key radiological characteristics of Primary CNS Lymphoma based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default PcnslInfographic;
