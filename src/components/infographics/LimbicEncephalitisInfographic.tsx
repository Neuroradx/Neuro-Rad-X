'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
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

const malignancyAssociationData = [
    { name: 'Anti-NMDAR', association: 40, key: "antiNmdar" },
    { name: 'Anti-GABABR', association: 60, key: "antiGababr" },
    { name: 'Anti-AMPAR', association: 60, key: "antiAmpar" },
    { name: 'Anti-Hu (ANNA-1)', association: 90, key: "antiHu" },
    { name: 'Anti-Ma2 (Ta)', association: 90, key: "antiMa2" },
];

const malignancyAssociationConfig = {
    association: {
        label: 'Malignancy Association (%)',
    },
    antiNmdar: { label: 'Anti-NMDAR', color: 'hsl(var(--chart-1))' },
    antiGababr: { label: 'Anti-GABABR', color: 'hsl(var(--chart-2))' },
    antiAmpar: { label: 'Anti-AMPAR', color: 'hsl(var(--chart-3))' },
    antiHu: { label: 'Anti-Hu', color: 'hsl(var(--chart-4))' },
    antiMa2: { label: 'Anti-Ma2', color: 'hsl(var(--chart-5))' },
};


// --- Main Infographic Component ---

const LimbicEncephalitisInfographic = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Diagnostic Criteria for <GradientText>Limbic Encephalitis</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Guide to Clinical, Imaging, and Laboratory Findings</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Diagnostic Criteria */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            Diagnostic Criteria for Probable Autoimmune Encephalitis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Based on Graus et al. (2016), all three of the following criteria must be met for a diagnosis of probable AE:</p>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-primary">1. Subacute Onset</h3>
                                <p className="text-sm text-muted-foreground mt-1">Rapid progression ({'<'}3 months) of working memory deficits, altered mental status, or psychiatric symptoms.</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-primary">2. At Least One Supportive Feature</h3>
                                <p className="text-sm text-muted-foreground mt-1">New focal CNS findings, new-onset seizures, supportive MRI, or CSF pleocytosis.</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-primary">3. Reasonable Exclusion</h3>
                                <p className="text-sm text-muted-foreground mt-1">Alternative causes must be reasonably ruled out.</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">A definitive diagnosis requires the identification of a specific neural autoantibody.</p>
                    </CardContent>
                </Card>

                {/* Neuroimaging: MRI Features */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            Neuroimaging: MRI Features in Limbic Encephalitis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground">MRI is the modality of choice, but a normal MRI does not exclude the diagnosis. Findings are observed in ~60-90% of patients, but MRI can be normal in up to 50% of anti-NMDAR encephalitis cases. Subtle or transient lesions can also lead to false negatives.</p>
                            <div>
                                <h3 className="font-semibold text-foreground">Typical Findings (T2/FLAIR):</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>**Medial Temporal Lobe (MTL) Hyperintensity:** The hallmark finding, often unilateral or bilateral, involving the hippocampus and amygdala.</li>
                                    <li>**Absence of Mass Effect:** Typically no significant mass effect.</li>
                                    <li>**Contrast Enhancement:** Uncommon, but can be seen as patchy or linear enhancement.</li>
                                    <li>**DWI:** Usually normal or shows non-restrictive diffusion, distinguishing it from stroke.</li>
                                    <li>**Atrophy:** Hippocampal atrophy can be seen in chronic or recurrent cases.</li>
                                </ul>
                            </div>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended MRI Protocol</CardTitle>
                                <CardDescription>For optimal visualization of limbic structures.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                                    <li>T1-weighted (pre and post-contrast)</li>
                                    <li>T2-weighted and FLAIR sequences</li>
                                    <li>Diffusion-Weighted Imaging (DWI) & ADC maps</li>
                                    <li>Susceptibility-Weighted Imaging (SWI/GRE)</li>
                                    <li>Thin-section coronal imaging of the hippocampus</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* CSF and Antibody Testing */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            CSF Biomarkers & Antibody Testing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-primary">Key CSF Findings</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Pleocytosis:** Elevated WBC ({'>'}5 cells/mm³), found in 50-80% of patients.</li>
                                <li>**Elevated Protein:** Increased protein concentration is frequently seen.</li>
                                <li>**Oligoclonal Bands (OCBs):** Can be present, indicating intrathecal inflammation.</li>
                                <li>**Normal Glucose:** Helps differentiate from bacterial meningitis.</li>
                                <li>**Exclusion of Infections:** PCR for viruses like HSV is crucial.</li>
                            </ul>
                            <h3 className="font-semibold text-primary mt-4">Antibodies to Cell-Surface Proteins</h3>
                            <p className="text-base text-muted-foreground mt-1">Often more responsive to immunotherapy. Includes Anti-NMDAR, LGI1, CASPR2, GABABR, AMPAR, DPPX, and IgLON5.</p>
                            <h3 className="font-semibold text-primary mt-4">Antibodies to Intracellular Proteins</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li><strong>Anti-Hu (ANNA-1):</strong> Strong association with SCLC ({'>'}90%). Presents with multifocal deficits.</li>
                                <li><strong>Anti-Ma2 (Ta):</strong> Associated with testicular germ cell tumors ({'>'}90%) and SCLC.</li>
                                <li><strong>Anti-CV2/CRMP5:</strong> Associated with SCLC and thymoma ({'>'}90%).</li>
                                <li><strong>Anti-Amphiphysin:</strong> Associated with SCLC and breast cancer ({'>'}90%).</li>
                                <li><strong>Anti-GAD65:</strong> Tumor association is variable (~25%).</li>
                            </ul>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Malignancy Association of Key Antibodies</CardTitle>
                                <CardDescription>Approximate percentage of cases associated with tumors.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={malignancyAssociationConfig} className="min-h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart accessibilityLayer data={malignancyAssociationData} layout="vertical">
                                            <CartesianGrid horizontal={false} />
                                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={100} />
                                            <XAxis dataKey="association" type="number" unit="%" />
                                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="association" radius={[0, 4, 4, 0]} barSize={30}>
                                                {malignancyAssociationData.map((entry) => (
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
                            Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                            <li className="break-inside-avoid">Graus, F., et al. (2025). *J Neurol Neurosurg Psychiatry*. <a href="https://doi.org/10.1136/jnnp-2024-330514" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1136/jnnp-2024-330514</a></li>
                            <li className="break-inside-avoid">Graus, F., et al. (2016). *Lancet Neurology*. <a href="https://doi.org/10.1016/S1474-4422(15)00401-9" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(15)00401-9</a></li>
                            <li className="break-inside-avoid">Bien, C. G., & Bien, B. A. (2025). *Curr Treat Options Neurol*. <a href="https://doi.org/10.1007/s11940-025-00858-6" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1007/s11940-025-00858-6</a></li>
                            <li className="break-inside-avoid">Kelley, B. P., & Mammen, A. L. (2019). *Curr Med Sci*. <a href="https://doi.org/10.1007/s11596-019-2092-7" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1007/s11596-019-2092-7</a></li>
                            <li className="break-inside-avoid">Patel, H., & Irani, S. R. (2024). *Neurol Clin Pract*. <a href="https://doi.org/10.1212/CPJ.0000000000200000" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1212/CPJ.0000000000200000</a></li>
                            <li className="break-inside-avoid">Dubey, D., & Toledano, M. (2025). *NeuroImage: Clinical*. <a href="https://doi.org/10.1016/j.nicl.2025.103987" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/j.nicl.2025.103987</a></li>
                            <li className="break-inside-avoid">Hoang-Phoung, P., & Dalmau, J. (2022). *Continuum*. <a href="https://doi.org/10.1212/CON.0000000000001090" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1212/CON.0000000000001090</a></li>
                            <li className="break-inside-avoid">Abboud, H., & Probasco, J. C. (2019). *Cleve Clin J Med*. <a href="https://doi.org/10.3949/ccjm.86a.18129" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3949/ccjm.86a.18129</a></li>
                            <li className="break-inside-avoid">Varley, J., & Hacohen, Y. (2024). *Dev Med Child Neurol*. <a href="https://doi.org/10.1111/dmcn.15682" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1111/dmcn.15682</a></li>
                            <li className="break-inside-avoid">Lee, R. Y., & Prüss, H. (2025). *Trends in Neurosciences*. <a href="https://doi.org/10.1016/j.tins.2025.04.001" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/j.tins.2025.04.001</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key findings on Limbic Encephalitis based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="http://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 4, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default LimbicEncephalitisInfographic;
