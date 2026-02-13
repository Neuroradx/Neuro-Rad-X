'use client';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
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

const trialCriteriaData = [
  { name: 'DEFUSE 3 Core', value: 70, unit: '≤ mL' },
  { name: 'DEFUSE 3 Mismatch Ratio', value: 1.8, unit: '≥' },
  { name: 'DAWN Core (NIHSS≥10)', value: 30, unit: '< mL' },
];

const trialCriteriaConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
};


// --- Main Infographic Component ---

const AcuteIschemicStrokeInfographic = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Acute Ischemic Stroke: <GradientText>Perfusion Imaging</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Guide to CTP, MRP, and Clinical Applications</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Introduction */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            Introduction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            Acute ischemic stroke is a leading cause of morbidity and mortality. Rapid and accurate diagnosis using advanced imaging like CT Perfusion (CTP) and MR Perfusion (MRP) is crucial for identifying salvageable brain tissue (penumbra) and guiding reperfusion therapies.
                        </p>
                    </CardContent>
                </Card>

                {/* Understanding Stroke: Core & Penumbra */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            1. Understanding Acute Ischemic Stroke: Infarction & Penumbra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-destructive">Ischemic Core (Infarction)</h3>
                            <p className="text-base text-muted-foreground mt-1">Brain tissue with irreversible damage due to severe ischemia. On imaging, it shows severely reduced Cerebral Blood Flow (CBF) and Cerebral Blood Volume (CBV). It is generally not salvageable.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-600 dark:text-green-400">Ischemic Penumbra</h3>
                            <p className="text-base text-muted-foreground mt-1">Critically hypoperfused but still viable tissue surrounding the core. It is the primary target for reperfusion therapies. On imaging, it has reduced CBF but relatively preserved CBV.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Perfusion Imaging Techniques */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                             <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            2. Imaging Techniques to Assess Perfusion
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-primary text-lg">CT Perfusion (CTP)</h3>
                            <p className="text-base text-muted-foreground">Involves acquiring multiple brain scans over time after an IV contrast injection. It results in a higher radiation dose than multiphase CTA.</p>
                            <div>
                                <h4 className="font-semibold text-secondary">Key CTP Parameters:</h4>
                                 <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-2">
                                    <li><strong>CBV (Cerebral Blood Volume):</strong> Total blood volume in a brain region. A decrease suggests infarcted tissue (core).</li>
                                    <li><strong>CBF (Cerebral Blood Flow):</strong> Blood volume flow per minute. A relative CBF of {'<'}30% of normal is a validated marker for the ischemic core.</li>
                                    <li><strong>MTT (Mean Transit Time):</strong> Average time for contrast to pass through capillaries. Prolonged MTT can be protective.</li>
                                    <li><strong>Tmax (Time to Maximum):</strong> Contrast bolus delay. Tmax {'>='} 6 seconds is considered to define the ischemic penumbra.</li>
                                </ul>
                            </div>
                        </div>
                         <div className="space-y-4">
                            <h3 className="font-semibold text-primary text-lg">MR Perfusion (MRP)</h3>
                             <div>
                                <h4 className="font-semibold text-secondary">Dynamic Susceptibility Contrast (DSC-MRI):</h4>
                                <p className="text-base text-muted-foreground mt-1">Measures T2* signal drop during contrast passage. Does not provide reliable absolute quantification of CBF and CBV.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-secondary">Arterial Spin Labeling (ASL):</h4>
                                <p className="text-base text-muted-foreground mt-1">Provides quantitative information without exogenous contrast. Allows for repeated measurements but has a lower signal-to-noise ratio.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-secondary">DWI-PWI Mismatch:</h4>
                                <p className="text-base text-muted-foreground mt-1">The mismatch between the DWI lesion (core) and the larger perfusion defect on PWI approximates the penumbra. A large mismatch suggests a favorable response to reperfusion.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-secondary">DWI-FLAIR Mismatch:</h4>
                                <p className="text-base text-muted-foreground mt-1">For wake-up strokes, a visible DWI lesion without a corresponding FLAIR signal suggests the stroke occurred within a treatable window (approx. 4.5 hours).</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            3. Defining Infarct & Penumbra
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-foreground">Mismatch Concept:</h3>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                            <li><strong>Ischemic Core:</strong> Defined by critically low CBF ({'<'}30% of normal) on CTP or the DWI lesion on MRP.</li>
                            <li><strong>Penumbra:</strong> Defined by prolonged transit times (Tmax {'>'} 6s) but relatively preserved CBV.</li>
                            <li><strong>Mismatch:</strong> The goal is to find a small core and a large penumbra (Mismatch = Total Hypoperfused Volume - Core Volume).</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            Key Thresholds & Landmark Trials
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground mb-4">Recent clinical trials like DAWN and DEFUSE 3 have established the benefit of mechanical thrombectomy in extended time windows (up to 24 hours) for patients selected based on perfusion mismatch criteria. These trials have shifted stroke care from a "time-based" to a "tissue-based" approach.</p>
                         <Card>
                            <CardHeader>
                                <CardTitle>Patient Selection Criteria (DAWN & DEFUSE 3)</CardTitle>
                                <CardDescription>Key volumetric and ratio thresholds for thrombectomy.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={trialCriteriaConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart accessibilityLayer data={trialCriteriaData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                            <YAxis />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
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
                      <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                           <li className="break-inside-avoid">1. Astrup, J., et al. (1981). *Stroke*. <a href="https://doi.org/10.1161/01.str.12.6.723" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/01.str.12.6.723</a></li>
                           <li className="break-inside-avoid">2. Campbell, B. C., et al. (2012). *J Cereb Blood Flow Metab*. <a href="https://doi.org/10.1038/jcbfm.2011.102" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1038/jcbfm.2011.102</a></li>
                           <li className="break-inside-avoid">3. Olivot, J. M., et al. (2014). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.113.003857" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.113.003857</a></li>
                           <li className="break-inside-avoid">4. d’Esterre, C. D., et al. (2015). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.115.009250" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.115.009250</a></li>
                           <li className="break-inside-avoid">5. Campbell, B. C. V., et al. (2019). *Lancet Neurology*. <a href="https://doi.org/10.1016/s1474-4422(18)30314-4" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/s1474-4422(18)30314-4</a></li>
                           <li className="break-inside-avoid">6. Demeestere, J., et al. (2020). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.119.032924" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.119.032924</a></li>
                           <li className="break-inside-avoid">7. Saver, J. L., et al. (2020). *Stroke*. <a href="https://doi.org/10.1161/STROKEAHA.120.030332" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STROKEAHA.120.030332</a></li>
                           <li className="break-inside-avoid">8. Turc, G., et al. (2023). *J NeuroInterventional Surg*. <a href="https://doi.org/10.1136/neurintsurg-2018-014569" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1136/neurintsurg-2018-014569</a></li>
                           <li className="break-inside-avoid">9. Bivard, A., et al. (2013). *Radiology*. <a href="https://doi.org/10.1148/radiol.12120971" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1148/radiol.12120971</a></li>
                           <li className="break-inside-avoid">10. Powers, W. J., et al. (2019). *Stroke*. <a href="https://doi.org/10.1161/STR.0000000000000211" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/STR.0000000000000211</a></li>
                        </ul>
                    </CardContent>
                </Card>
                
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key concepts in Perfusion Imaging for Acute Ischemic Stroke based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 3, 2025. Generated with Gemini.
                </p>
            </footer>
        </div>
    );
};

export default AcuteIschemicStrokeInfographic;
