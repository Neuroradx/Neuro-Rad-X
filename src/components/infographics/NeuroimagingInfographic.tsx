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

const diagnosticAccuracyData = [
  { name: 'MRI (AD vs Healthy)', accuracy: 85, type: 'sensitivity' },
  { name: 'SPECT (AD vs Healthy)', accuracy: 89, type: 'sensitivity' },
  { name: 'MRI (Epilepsy Lesions)', accuracy: 64, type: 'sensitivity' },
  { name: 'CT (Epilepsy Lesions)', accuracy: 31, type: 'sensitivity' },
];

const diagnosticAccuracyConfig = {
  accuracy: {
    label: 'Sensitivity',
    color: 'hsl(var(--chart-1))',
  },
};


// --- Main Infographic Component ---

const NeuroimagingInfographic = () => {
    return (
        <div className="space-y-6">

            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Neuroimaging Modalities and <GradientText>Intracerebral Hemorrhage</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Guide to Key Diagnostic Applications</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Introduction */}
                <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        Overview of Neuroimaging
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground">
                            Neuroimaging is fundamental for diagnosing and managing a wide range of brain conditions, from acute events like stroke and hemorrhage to chronic diseases such as Alzheimer's and epilepsy. Advanced imaging modalities like Computed Tomography (CT) and Magnetic Resonance Imaging (MRI), including specialized sequences, provide critical insights into brain pathology, guiding immediate treatment and long-term patient care.
                        </p>
                    </CardContent>
                </Card>

                {/* Intracerebral Hemorrhage (ICH) */}
                <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <SectionIcon path="M10.5 6h9.75M10.5 6a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        Intracerebral Hemorrhage (ICH)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground">Accounts for 10-20% of annual strokes in the US, with a 40% mortality rate within one month. Non-contrast CT (NCCT) is the first-line modality for acute diagnosis.</p>
                            <div>
                                <h3 className="font-semibold text-foreground">MRI's Pivotal Role:</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>Nearly 100% sensitivity and specificity for diagnosing ICH.</li>
                                    <li>Crucial for detailed assessment and determining hemorrhage age.</li>
                                    <li>**SWI/GRE:** Highly sensitive for microbleeds.</li>
                                    <li>**DWI:** Remote lesions increase risk of subsequent ischemic stroke 2.5x.</li>
                                    <li>**FLAIR:** Used to quantify perihematomal edema (PHE).</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary">Hemorrhage Staging by MRI Signal:</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**Hyperacute ({'<'}24h):** T1 iso, T2 hyperintense, DWI high, ADC low.</li>
                                <li>**Acute (1-3d):** T1 iso, T2 low, DWI low, ADC low.</li>
                                <li>**Early Subacute (3-7d):** T1 high, T2 low.</li>
                                <li>**Late Subacute (7-28d):** T1 high, T2 high.</li>
                                <li>**Chronic ({'>'}1mo):** T1 low, T2 high (center) with low signal rim.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Subarachnoid Hemorrhage (SAH) & DAI */}
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                          SAH & Diffuse Axonal Injury (DAI)
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <h3 className="font-semibold text-primary">Subarachnoid Hemorrhage (SAH)</h3>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                            <li>**NCCT:** Standard for acute diagnosis, but can have false negatives.</li>
                            <li>**MRI (FLAIR & T2*):** More useful than CT for detecting SAH, with sensitivity up to 94-100% depending on timing.</li>
                        </ul>
                    
                     <div className="mt-4">
                        <h3 className="font-semibold text-primary">Diffuse Axonal Injury (DAI)</h3>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                            <li>**MRI:** Recommended and more sensitive than CT for detecting small hemorrhagic foci.</li>
                            <li>**SWI:** Significantly outperforms T2* for DAI detection; lesion count correlates with prognosis.</li>
                        </ul>
                    </div>
                    </CardContent>
                </Card>

                {/* Acute Cerebral Infarction */}
                <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <SectionIcon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                        Acute Cerebral Infarction & Reperfusion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground mb-4">Imaging is essential for determining indication for reperfusion therapy while minimizing delay.</p>
                        <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                            <li>**NCCT:** Recommended to exclude hemorrhage and evaluate early ischemic changes (ASPECTS).</li>
                            <li>**MRI (DWI):** Highly sensitive for early changes. DWI-ASPECTS is a superior predictor of outcomes compared to CT-ASPECTS.</li>
                            <li>**Perfusion Imaging (CT/MR):** Useful for evaluating perfusion-core mismatch in patients 6-24 hours after onset.</li>
                            <li>**CTA/MRA:** Necessary if endovascular therapy is considered, but should not delay IV rt-PA.</li>
                        </ul>
                    </CardContent>
                </Card>
                
                {/* Chronic Diseases & Lesions */}
                <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                         <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        Chronic Diseases & Space-Occupying Lesions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-primary">Temporal Lobe Epilepsy</h3>
                                <p className="text-base text-muted-foreground mt-1">MRI is the first-choice modality. CT sensitivity is much lower (31% vs. 64% for MRI).</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary">Alzheimer's Disease (AD)</h3>
                                <p className="text-base text-muted-foreground mt-1">MRI detects medial temporal lobe atrophy. SPECT and PET assess blood flow and metabolism.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary">Metastatic Brain Tumors</h3>
                                <p className="text-base text-muted-foreground mt-1">Contrast-enhanced MRI is superior to CT. 3T MRI improves detection of small lesions ({'<'}5mm).</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary">Primary Headache</h3>
                                <p className="text-base text-muted-foreground mt-1">Imaging is not routinely recommended unless headache is atypical (e.g., thunderclap).</p>
                            </div>
                        </div>
                         <Card>
                            <CardHeader>
                                <CardTitle>Diagnostic Sensitivity</CardTitle>
                                <CardDescription>In selected chronic conditions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={diagnosticAccuracyConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart accessibilityLayer data={diagnosticAccuracyData} layout="vertical">
                                            <CartesianGrid horizontal={false} />
                                            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={150} tick={{ fontSize: 14 }}/>
                                            <XAxis dataKey="accuracy" type="number" unit="%" />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* ARIA */}
                 <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                         <SectionIcon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        Amyloid-Related Imaging Abnormalities (ARIA)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-foreground">Overview:</h3>
                            <p className="text-base text-muted-foreground mt-1">Imaging findings associated with amyloid-modifying therapies, classified as ARIA-E (edema/effusions) and ARIA-H (hemorrhages).</p>
                            <h3 className="font-semibold text-foreground mt-4">Prevalence & Risk Factors:</h3>
                             <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>ARIA-E occurred in 9.7% to 35.2% of patients in clinical trials.</li>
                                <li>Risk factors include higher drug doses and APOE4 carrier status.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary">Imaging Features:</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                <li>**ARIA-E (Edema):** Best visualized on FLAIR MRI. Typically shows an absence of diffusion restriction.</li>
                                <li>**ARIA-H (Hemorrhage):** Microhemorrhages are best detected with T2*-GRE and SWI sequences.</li>
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
                        <ul className="space-y-3 text-sm text-muted-foreground columns-1 md:columns-2">
                       <li className="break-inside-avoid">Babi, M. A., et al. (2025). *Frontiers in Neuroscience*. <a href="https://doi.org/10.3389/fnins.2025.1593225" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3389/fnins.2025.1593225</a></li>
                       <li className="break-inside-avoid">Heit, J. J., et al. (2017). *Journal of Stroke*. <a href="https://doi.org/10.5853/jos.2016.00563" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.5853/jos.2016.00563</a></li>
                       <li className="break-inside-avoid">American Heart Association. (2025). *Circulation Research*. (No DOI provided)</li>
                       <li className="break-inside-avoid">Linfante, I., et al. (1999). *Stroke*. <a href="https://doi.org/10.1161/01.STR.30.11.2263" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1161/01.STR.30.11.2263</a></li>
                       <li className="break-inside-avoid">[Anonymous]. (n.d.). *1 Neuroradiology (Excerpts)*. (No DOI provided)</li>
                       <li className="break-inside-avoid">Penckofer, M., et al. (2024). *Frontiers in Neuroscience*. <a href="https://doi.org/10.3389/fnins.2024.1408288" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.3389/fnins.2024.1408288</a></li>
                       <li className="break-inside-avoid">Shen, Y., et al. (2022). *Magnetic Resonance Imaging*. <a href="https://doi.org/10.1016/j.mri.2022.08.009" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1016/j.mri.2022.08.009</a></li>
                       <li className="break-inside-avoid">Vukmir, R. B. (2024). *Annals of Clinical and Translational Neurology*. <a href="https://doi.org/10.1002/acn3.52042" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1002/acn3.52042</a></li>
                       <li className="break-inside-avoid">Weerink, L. B. M., et al. (2023). *British Journal of Radiology*. <a href="https://doi.org/10.1259/bjr.20220304" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DOI: 10.1259/bjr.20220304</a></li>
                    </ul>
                </CardContent>
            </Card>

            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key findings on Neuroimaging Modalities and Intracerebral Hemorrhage based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="http://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 3, 2025. Generated with Gemini.
                </p>
            </footer>

        </div>
    );
};

export default NeuroimagingInfographic;
