'use client';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from '@/hooks/use-translation';

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

const incidenceData = [
  { name: 'General Population (Annual)', value: 0.12, key: 'riskLow' },
  { name: 'HIV+ Individuals (Prevalence)', value: 4, key: 'riskHigh' }, 
];
const incidenceConfig = {
    riskLow: { label: 'General Population', color: 'hsl(var(--chart-1))' },
    riskHigh: { label: 'HIV+ Individuals', color: 'hsl(var(--chart-2))' },
};

const natalizumabRiskData = [
    { name: 'JCV- (Seroconverting)', risk: 0.09, key: 'risk1' },
    { name: 'JCV+ Naive (1-24 Mo)', risk: 0.6, key: 'risk2' },
    { name: 'JCV+ Naive (25-48 Mo)', risk: 5.2, key: 'risk3' },
    { name: 'JCV+ Prior IS (25-48 Mo)', risk: 11.0, key: 'risk4' },
];
const natalizumabRiskConfig = {
    risk1: { label: 'JCV-', color: 'hsl(var(--chart-1))' },
    risk2: { label: 'JCV+ (1-24 Mo)', color: 'hsl(var(--chart-2))' },
    risk3: { label: 'JCV+ (25-48 Mo)', color: 'hsl(var(--chart-3))' },
    risk4: { label: 'JCV+ (Prior IS)', color: 'hsl(var(--chart-5))' },
};

const survivalData = [
    { cohort: 'Natalizumab-Associated', survival: 75, key: 'survival1' },
    { cohort: 'Hematologic Malignancy', survival: 15.4, key: 'survival2' },
];
const survivalDataConfig = {
    survival1: { label: 'Natalizumab-Associated', color: 'hsl(var(--chart-1))' },
    survival2: { label: 'Hematologic Malignancy', color: 'hsl(var(--chart-5))' },
};

// --- Main Infographic Component ---

const PmlInfographic = () => {
    const { t } = useTranslation();
    const currentDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Progressive Multifocal <GradientText>Leukoencephalopathy (PML)</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">Epidemiology and Advanced Neuroimaging Characteristics</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            1. Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            PML is a severe CNS demyelinating disease caused by JC virus (JCV) reactivation in immunosuppressed individuals. Historically linked to HIV/AIDS, its modern epidemiology includes a significant cohort related to immunomodulatory therapies like natalizumab. Diagnosis combines clinical signs, JCV DNA detection in CSF, and characteristic MRI findings. While classic PML lacks enhancement, the inflammatory variant (PML-IRIS) necessitates careful MRI interpretation. Early diagnosis and immune reconstitution are key to prognosis.
                        </p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.654 5.654a2.652 2.652 0 01-3.752-3.752l5.654-4.654M3 3l3.59 3.59m0 0A2.652 2.652 0 019 9m7.5-3A2.652 2.652 0 0013.5 3m-3 0a2.652 2.652 0 00-3 3.59" />
                            2. Pathogenesis & Virology
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                         <p className="text-sm text-muted-foreground">
                            Caused by the ubiquitous JC virus (JCV), affecting up to <strong className="text-primary">85%</strong> of adults asymptomatically. PML occurs when suppressed immunity allows JCV reactivation, leading to lytic infection and destruction of oligodendrocytes (myelin-producing cells) in the CNS white matter. The resulting multifocal demyelination causes progressive neurological deficits.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.497 0 .98-.032 1.453-.091M12 21a8.958 8.958 0 01-1.453-.091m6.264-6.656a8.973 8.973 0 01-1.453.091M3.284 14.253a8.973 8.973 0 001.453.091M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 3c-.497 0-.98.032-1.453-.091M12 3a8.958 8.958 0 00-1.453-.091m6.264 6.656a8.973 8.973 0 001.453-.091M3.284 9.747a8.973 8.973 0 011.453-.091" />
                            3. Global Incidence & Prevalence
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={incidenceConfig} className="min-h-[150px] w-full">
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart accessibilityLayer data={incidenceData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis unit="%" />
                                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value, name, entry) => entry.payload.name.includes('General') ? `${value} per 100k` : `${value}%`} />} />
                                    <Bar dataKey="value" name="Rate" radius={4}>
                                        {incidenceData.map((entry) => (
                                             <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <p className="text-xs text-muted-foreground mt-1">*General population rate is incidence per 100k person-years. HIV+ rate is prevalence.</p>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                             <SectionIcon path="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662v1.562a4.006 4.006 0 003.7 3.7c1.846.053 3.695.085 5.568 0a4.006 4.006 0 003.7-3.7v-1.562z" />
                            4. Iatrogenic PML Risk: Natalizumab Example
                        </CardTitle>
                         <CardDescription>Risk stratification is crucial, depending on JCV antibody status, duration of exposure, and prior immunosuppressant (IS) use.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={natalizumabRiskConfig} className="min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart accessibilityLayer data={natalizumabRiskData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={70} interval={0}/>
                                    <YAxis />
                                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => `${value}/1000`} />} />
                                    <Bar dataKey="risk" name="Incidence" radius={4}>
                                        {natalizumabRiskData.map((entry) => (
                                            <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M15.042 21.002a2.25 2.25 0 01-3.084 0 2.25 2.25 0 01-3.084 0M12 6.002v9.75m-3.111 2.553a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.06 1.06 4.765-4.764a.75.75 0 111.06 1.06l-5.25 5.25-1.591 1.591z" />
                            5. Clinical Presentation & Diagnosis
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <h3 className="font-semibold text-foreground mb-1">Clinical Signs:</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                           <li>Progressive, multifocal neurological deficits (subacute onset).</li>
                           <li>Common: Cognitive impairment (most common in natalizumab-PML), motor weakness (common in HIV-PML), gait issues, visual field deficits, speech problems.</li>
                           <li>Less common: Sensory loss, seizures, headache. Optic nerve/spinal cord usually spared.</li>
                        </ul>
                         <h3 className="font-semibold text-foreground mb-1">Diagnostic Confirmation:</h3>
                         <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
   <li>Combines clinical presentation, MRI findings, and virological evidence.</li>
   <li><strong className="text-primary">CSF PCR for JCV DNA:</strong> Standard non-invasive method (Sensitivity &gt;90%).</li>
   <li><strong className="text-amber-600">Caution:</strong> CSF PCR can be falsely negative in PML-IRIS due to immune clearance.</li>
   <li>Brain biopsy (histopathology) is rarely needed.</li>
</ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                             <SectionIcon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            6. MRI Findings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-foreground mb-1">Classic PML (Severe Immunosuppression):</h3>
                         <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                            <li><strong className="text-primary">T1WI:</strong> Hypointense lesions (tissue destruction).</li>
                            <li><strong className="text-primary">T2WI/FLAIR:</strong> Intensely hyperintense lesions (edema, demyelination). May show "Milky Way" or "barbell" signs.</li>
                             <li><strong className="text-destructive">Location:</strong> Juxtacortical WM (OR 3.6 for PML vs MS), Cortical GM (OR 14.8), Cerebellum. Often bilateral but asymmetric. Periventricular WM & corpus callosum typically spared (unlike MS).</li>
                             <li><strong className="text-destructive">Key Features:</strong> No contrast enhancement, no mass effect/edema.</li>
                         </ul>
                         <h3 className="font-semibold text-amber-600 mb-1">PML-IRIS / Iatrogenic PML:</h3>
                          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                            <li><strong className="text-amber-600">Key Features:</strong> Contrast enhancement (ring or patchy) present in most (e.g., 87%), often with edema and mass effect due to inflammation.</li>
                          </ul>
                          <h3 className="font-semibold text-purple-600 mb-1">Advanced MRI:</h3>
                          <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                           <li><strong className="text-purple-600">DWI:</strong> Peripheral patchy restriction at the "leading edge".</li>
                           <li><strong className="text-purple-600">MRS:</strong> Reduced NAA, increased Cho & Lipids, lactate present (axonal injury, membrane breakdown).</li>
                          </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                       <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            7. MRI Differentiation: PML vs. MS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature</TableHead>
                                        <TableHead>Classic PML</TableHead>
                                        <TableHead>PML-IRIS / Iatrogenic PML</TableHead>
                                        <TableHead>New MS Lesion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Contrast Enhancement</TableCell>
                                        <TableCell>Absent</TableCell>
                                        <TableCell>Often Present (Patchy/Ring)</TableCell>
                                        <TableCell>Present (Nodular/Open-Ring)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Mass Effect / Edema</TableCell>
                                        <TableCell>Absent</TableCell>
                                        <TableCell>Often Present</TableCell>
                                        <TableCell>Absent</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="font-medium">Location Preference</TableCell>
                                        <TableCell>Juxtacortical WM, Cortical GM</TableCell>
                                        <TableCell>Juxtacortical WM, Cortical GM</TableCell>
                                        <TableCell>Periventricular WM, Corpus Callosum</TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell className="font-medium">Lesion Morphology</TableCell>
                                        <TableCell>Large, Confluent, Infiltrative</TableCell>
                                        <TableCell>Large, often with edema</TableCell>
                                        <TableCell>Focal, Ovoid, Well-demarcated</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-1.37-1.37m1.37 1.37l-1.586 1.585" />
                            8. Prognosis & Therapy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Therapeutic Mainstay: Immune Reconstitution</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>No effective direct antivirals exist.</li>
                                <li><strong className="text-primary">HIV-PML:</strong> Initiate ART immediately.</li>
                                <li><strong className="text-primary">Iatrogenic PML:</strong> Withdraw offending immunosuppressant (e.g., natalizumab).</li>
                                <li><strong className="text-amber-600">PML-IRIS Management:</strong> High-dose corticosteroids if severe inflammation occurs.</li>
                                <li><strong className="text-purple-600">Investigative:</strong> Immune Checkpoint Inhibitors (Pembrolizumab), Adoptive T-Cell Transfer.</li>
                            </ul>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>1-Year Survival Rates</CardTitle>
                                <CardDescription>Survival heavily depends on the potential for immune reconstitution.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={survivalDataConfig} className="min-h-[150px] w-full">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <BarChart accessibilityLayer data={survivalData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="cohort" tick={{ fontSize: 9 }} />
                                            <YAxis unit="%" />
                                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="survival" name="Survival (%)" radius={4}>
                                                {survivalData.map((entry) => (
                                                    <Cell key={entry.cohort} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                     </CardContent>
                      <CardFooter>
                         <p className="text-xs text-muted-foreground mt-4">Untreated PML is often fatal within 2-6 months. Prognosis is poor if immune reconstitution is not possible (e.g., certain malignancies).</p>
                      </CardFooter>
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
                           <li className="break-inside-avoid">Khalili, K., et al. (2011). Molecular Biology, Epidemiology, and Pathogenesis of Progressive Multifocal Leukoencephalopathy... *Clinical Microbiology Reviews*. <a href="https://doi.org/10.1128/cmr.05031-11" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1128/cmr.05031-11</a></li>
                           <li className="break-inside-avoid">Radswiki, T. C. C. by. (n.d.). Progressive multifocal leukoencephalopathy | Radiology Reference Article | Radiopaedia.org. Retrieved October 27, 2025, from <a href="https://radiopaedia.org/articles/progressive-multifocal-leukoencephalopathy?lang=us" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Radiopaedia.org</a></li>
                           <li className="break-inside-avoid">Cortese, I., et al. (2021). Progressive multifocal leukoencephalopathy: current treatment strategies and future perspectives. *Therapeutic Advances in Neurological Disorders*. <a href="https://doi.org/10.1177/1756286420967938" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1177/1756286420967938</a></li>
                           <li className="break-inside-avoid">Bloomgren, G., et al. (2012). Risk of Natalizumab-Associated Progressive Multifocal Leukoencephalopathy. *New England Journal of Medicine*. <a href="https://doi.org/10.1056/NEJMoa1107829" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1056/NEJMoa1107829</a></li>
                           <li className="break-inside-avoid">Aksamit, A. J. (2011). Progressive multifocal leukoencephalopathy: A review of the pathology and pathogenesis. *Cleveland Clinic Journal of Medicine*.</li>
                           <li className="break-inside-avoid">Berger, J. R., et al. (2013). PML diagnostic criteria: Consensus statement from the AAN Neuroinfectious Disease Section. *Neurology*. <a href="https://doi.org/10.1212/WNL.0b013e31828c2fa1" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1212/WNL.0b013e31828c2fa1</a></li>
                           <li className="break-inside-avoid">Wijburg, M. T., et al. (2016). MRI criteria differentiating asymptomatic PML from new MS lesions during natalizumab pharmacovigilance. *Journal of Neurology, Neurosurgery & Psychiatry*. <a href="https://doi.org/10.1136/jnnp-2015-311474" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1136/jnnp-2015-311474</a></li>
                           <li className="break-inside-avoid">Pavlovic, D., et al. (2015). Progressive multifocal leukoencephalopathy: current treatment options and future perspectives. *Therapeutic Advances in Neurological Disorders*. <a href="https://doi.org/10.1177/1756285615617590" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1177/1756285615617590</a></li>
                           <li className="break-inside-avoid">Grebenciucova, E., et al. (2022). Progressive multifocal leukoencephalopathy: epidemiology and spectrum of predisposing conditions. *Journal of Neurology, Neurosurgery & Psychiatry*. <a href="https://doi.org/10.1136/jnnp-2022-329107" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1136/jnnp-2022-329107</a></li>
                           <li className="break-inside-avoid">Tan, C. S., & Koralnik, I. J. (2010). Progressive multifocal leukoencephalopathy and other disorders caused by JC virus: clinical features and pathogenesis. *The Lancet Neurology*. <a href="https://doi.org/10.1016/S1474-4422(10)70094-9" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/S1474-4422(10)70094-9</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key aspects of Progressive Multifocal Leukoencephalopathy (PML) based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="http://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on {currentDate}. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default PmlInfographic;
