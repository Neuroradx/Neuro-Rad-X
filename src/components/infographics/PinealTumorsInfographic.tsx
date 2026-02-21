
'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from '@/hooks/use-translation';
import { Separator } from '@/components/ui/separator';

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

const survivalData = [
    { grade: 'WHO Grade 2', survival: 78, key: 'grade2' },
    { grade: 'WHO Grade 3', survival: 30, key: 'grade3' },
];

const survivalConfig = {
    survival: { label: '5-Year Survival' },
    grade2: { color: 'hsl(var(--chart-1))' },
    grade3: { color: 'hsl(var(--chart-5))' },
}

const ageDistributionData = [
    { name: 'Pineoblastoma', ageGroup: 'Pediatric (<20 yrs)', key: 'pineoblastoma' },
    { name: 'Germinoma', ageGroup: 'Pediatric/Young Adult', key: 'germinoma' },
    { name: 'Pineocytoma', ageGroup: 'Adult (20-60 yrs)', key: 'pineocytoma' },
    { name: 'PPTID', ageGroup: 'Adult (20-70 yrs)', key: 'pptid' },
];
const ageDistributionConfig = {
    pineoblastoma: { color: 'hsl(var(--chart-5))' },
    germinoma: { color: 'hsl(var(--chart-4))' },
    pineocytoma: { color: 'hsl(var(--chart-1))' },
    pptid: { color: 'hsl(var(--chart-2))' },
};


// --- Main Infographic Component ---

const PinealTumorsInfographic = () => {
    const { t } = useTranslation();
    const currentDate = "October 9, 2025";
    const infoTheme = "Pineal Region Tumors";

    const sources = [
        { title: 'Pineal gland tumors: Experience from the SEER database', source: 'Konovalov, A. N., et al. (2010). Surgical Neurology International', url: 'https://doi.org/10.4103/2152-7806.74157' },
        { title: 'Radiation therapy for pineal parenchymal tumor of intermediate differentiation: A case series and literature review', source: 'Khan, R. B., et al. (2023). Clinical Case Reports', url: 'https://doi.org/10.1002/ccr3.7021' },
        { title: 'Pineoblastoma', source: 'Radiopaedia.org', url: 'https://radiopaedia.org/articles/pineoblastoma' },
        { title: 'Diagnosis and Management of Pineal Germinoma: From Eye to Brain', source: 'Zhang, S., et al. (2023). Journal of Clinical Medicine', url: 'https://doi.org/10.3390/jcm12082826' },
        { title: 'Pineal Gland Cancer', source: 'Toro, A., et al. (2022). In StatPearls. StatPearls Publishing', url: 'https://www.ncbi.nlm.nih.gov/books/NBK560567/' },
        { title: 'Pineal Region Tumors: Diagnosis and Treatment', source: 'National Cancer Institute', url: 'https://www.cancer.gov/rare-brain-spine-tumor/tumors/pineal-region-tumors' },
        { title: 'Pineal parenchymal tumors', source: 'Fauchon, F., et al. (2000). Brain Pathology', url: 'https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1750-3639.2000.tb00244.x' },
        { title: 'Magnetic resonance imaging of pineal region tumours', source: 'Smith, A. B., et al. (2013). Clinical Radiology', url: 'https://doi.org/10.1016/j.crad.2013.04.010' },
        { title: 'Distinguishing between Germinomas and Pineal Cell Tumors on MR Imaging', source: 'Chang, A. H., et al. (2012). AJNR Am J Neuroradiol', url: 'https://doi.org/10.3174/ajnr.A2803' },
        { title: 'Pineal Gland Tumors: A Review', source: 'Berhouma, M. (2022). Cancers', url: 'https://doi.org/10.3390/cancers13071547' },
    ];


    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    <GradientText>Pineal Region Tumors</GradientText>: Radiological Aspects
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Differentiation Strategies in Pediatric and Adult Populations</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            1. Introduction & Classification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            Pineal region tumors are rare ({'<'}1% of primary CNS tumors), arising near critical structures like the midbrain tectum and third ventricle, often causing hydrocephalus. The pineal region lacks a typical blood-brain barrier. Tumors are classified by origin (WHO 2021):
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                            <li><strong>Pineal Parenchymal Tumors (PPTs):</strong> Pineocytoma (PC, Gr I/II), PPT of Intermediate Differentiation (PPTID, Gr II/III), Pineoblastoma (PB, Gr IV), Papillary Tumor (PTPR, Gr II/III).</li>
                            <li><strong>Germ Cell Tumors (GCTs):</strong> Most common in some regions (up to 60%). Germinoma (most frequent GCT), Nongerminomatous GCTs (NGGCTs: Choriocarcinoma, Embryonal Ca, Yolk Sac, Teratoma).</li>
                            <li><strong>Gliomas & Others:</strong> Astrocytoma, Ependymoma, Meningioma, Metastases.</li>
                            <li><strong>Cystic/Non-Neoplastic:</strong> Pineal Cysts (common incidental finding).</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.497 0 .98-.032 1.453-.091M12 21a8.958 8.958 0 01-1.453-.091m6.264-6.656a8.973 8.973 0 01-1.453.091M3.284 14.253a8.973 8.973 0 001.453.091M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 3c-.497 0-.98.032-1.453-.091M12 3a8.958 8.958 0 00-1.453-.091m6.264 6.656a8.973 8.973 0 001.453-.091M3.284 9.747a8.973 8.973 0 011.453-.091" />
                            2. Epidemiology & Age Dichotomy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Patient age is crucial for differential diagnosis.</p>
                            <h3 className="font-semibold text-destructive">Pediatric Predominance:</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                                <li><strong>Pineoblastoma (PB):</strong> WHO Gr IV, highly aggressive, peak &lt; 20 yrs. ~45% of PPTs. High CSF spread risk.</li>
                                <li><strong>Germinoma (GCT):</strong> Frequent in children/young adults. Malignant but highly radiosensitive/chemosensitive. Marked male predominance (up to 11.8:1).</li>
                            </ul>
                            <h3 className="font-semibold" style={{ color: 'hsl(var(--chart-1))' }}>Adult Predominance:</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li><strong>Pineocytoma (PC):</strong> WHO Gr I/II, most common PPT in adults (20-60 yrs). More common in females.</li>
                                <li><strong>PPTID:</strong> WHO Gr II/III, peak 20-70 yrs.</li>
                            </ul>
                        </div>
                        <Card className="border-none shadow-none">
                            <CardHeader className="p-2">
                                <CardTitle className="text-base">Typical Age Group by Tumor Type</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="space-y-2">
                                    {ageDistributionData.map((item) => (
                                        <div key={item.name} className="flex items-center text-xs">
                                            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: ageDistributionConfig[item.key as keyof typeof ageDistributionConfig]?.color }}></div>
                                            <span className="font-medium w-28 mr-2">{item.name}:</span>
                                            <span>{item.ageGroup}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            3. Conventional Imaging & Calcification Pattern
                        </CardTitle>
                        <CardDescription>MRI with contrast is standard. CT assesses calcifications and hydrocephalus.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <h3 className="font-semibold text-primary">Exploded Calcification (Suggests PPT)</h3>
                                <p className="text-xs text-muted-foreground">PPTs (PC, PB) grow *from* pineocytes, displacing normal calcifications peripherally.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary">Engulfed Calcification (Suggests GCT)</h3>
                                <p className="text-xs text-muted-foreground">GCTs grow *around* the pineal gland, incorporating calcifications centrally.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tumor Type</TableHead>
                                        <TableHead>CT Density</TableHead>
                                        <TableHead>T1 Signal</TableHead>
                                        <TableHead>T2 Signal</TableHead>
                                        <TableHead>Enhancement</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Pineoblastoma (Gr IV)</TableCell>
                                        <TableCell>Hyperdense, Exploded Calc.</TableCell>
                                        <TableCell>Iso/Hypointense</TableCell>
                                        <TableCell>Isointense</TableCell>
                                        <TableCell>Heterogeneous, Irregular</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Germinoma (GCT)</TableCell>
                                        <TableCell>Hyperdense, Engulfed Calc.</TableCell>
                                        <TableCell>Isointense to GM</TableCell>
                                        <TableCell>Isointense to GM</TableCell>
                                        <TableCell>Strong, Homogeneous</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Pineocytoma (Gr I/II)</TableCell>
                                        <TableCell>Iso/Hypodense, Exploded Calc.</TableCell>
                                        <TableCell>Low/Intermediate</TableCell>
                                        <TableCell>Intermediate/High</TableCell>
                                        <TableCell>Prominent, Nodular/Peripheral (if cystic)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Teratoma (GCT)</TableCell>
                                        <TableCell>Mixed (Fat/Calc.)</TableCell>
                                        <TableCell>Mixed (High Fat)</TableCell>
                                        <TableCell>Mixed (Low Calc.)</TableCell>
                                        <TableCell>Solid Components Enhance</TableCell>
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
                            4. Advanced MRI: DWI/ADC for Differentiation
                        </CardTitle>
                        <CardDescription>DWI/ADC reflects cellular density and is crucial for distinguishing high-grade (highly cellular) tumors from low-grade/cystic lesions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tumor Type</TableHead>
                                        <TableHead>DWI Signal</TableHead>
                                        <TableHead>ADC Value</TableHead>
                                        <TableHead>Clinical Significance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Pineoblastoma (Gr IV)</TableCell>
                                        <TableCell>High (Restricted)</TableCell>
                                        <TableCell><strong className="text-destructive">Very Low</strong> (e.g., ~343 x 10⁻⁶)</TableCell>
                                        <TableCell>Indicates extreme cellularity (PNET).</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Germinoma (GCT)</TableCell>
                                        <TableCell>High (Restricted)</TableCell>
                                        <TableCell><strong className="text-orange-500">Low, but &gt; PB</strong> (Thresholds proposed)</TableCell>
                                        <TableCell>Highly cellular; ADC ratio ≤1.15 suggestive.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Pineocytoma (Gr I/II)</TableCell>
                                        <TableCell>Variable/Low</TableCell>
                                        <TableCell><strong style={{ color: 'hsl(var(--chart-1))' }}>Higher</strong> (Less restricted)</TableCell>
                                        <TableCell>Lower cellularity.</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Pineal Cyst</TableCell>
                                        <TableCell>Low (No restriction)</TableCell>
                                        <TableCell><strong className="text-blue-500">High (CSF-like)</strong></TableCell>
                                        <TableCell>Definitively excludes cellular tumor.</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2"><strong className="text-purple-500">SWI:</strong> Superior for calcification/hemorrhage (intense blooming in PB/Teratoma, minimal in Germinoma). <strong className="text-teal-500">MRS:</strong> Germinomas often show high lipids.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            5. Differentiating Pineal Cysts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">Pineal Cysts (PCs) are common incidental findings (1.5-23% prevalence). Must differentiate from neoplasms.</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li><strong>Typical MRI:</strong> CSF-like signal (Low T1, High T2), often incomplete FLAIR suppression.</li>
                            <li><strong>Enhancement Pitfall:</strong> Thin peripheral rim enhancement (&lt;2mm) is common and non-specific due to lack of BBB. Delayed scans may show diffuse filling.</li>
                            <li><strong>Definitive Feature:</strong> PCs show <strong style={{ color: 'hsl(var(--chart-1))' }}>NO restricted diffusion (High ADC)</strong>, reliably distinguishing them from cellular tumors, even if enhancement is atypical.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-1.37-1.37m1.37 1.37l-1.586 1.585" />
                            6. Prognosis & Key Pointers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Card>
                            <CardHeader className="p-2">
                                <CardTitle className="text-base">5-Year Survival by WHO Grade</CardTitle>
                                <CardDescription className="text-xs">Illustrates the significant prognostic impact of grade.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ChartContainer config={survivalConfig} className="min-h-[150px] w-full">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart accessibilityLayer data={survivalData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="grade" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                            <YAxis unit="%" domain={[0, 100]} />
                                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="survival" name="5-Year Survival" radius={[4, 4, 0, 0]} barSize={40}>
                                                {survivalData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <h3 className="font-semibold text-foreground mb-1 mt-4">Key Pointers Summary:</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li><strong>Age Matters:</strong> Pediatric favors PB/Germinoma; Adult favors PC/PPTID/Cyst.</li>
                            <li><strong>DWI/ADC is Crucial:</strong> Restricted diffusion = high cellularity (PB/Germinoma); No restriction = Cyst/PC. Lower ADC suggests PB &gt; Germinoma.</li>
                            <li><strong>Calcification Pattern:</strong> Exploded = PPT; Engulfed = GCT. Best seen on CT/SWI.</li>
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
                <p>This infographic summarizes key radiological aspects of {infoTheme} based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default PinealTumorsInfographic;
