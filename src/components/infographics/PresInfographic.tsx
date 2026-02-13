'use client';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LocationsBarChart } from '@/components/charts/LocationsBarChart';

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

const edemaPieChartData = [
  { name: 'Pure Vasogenic', value: 67.09, key: "vasogenic" },
  { name: 'Mixed (Vasogenic + Cytotoxic)', value: 32.91, key: "mixed" },
];

const edemaChartConfig = {
  vasogenic: {
    label: 'Vasogenic',
    color: 'hsl(var(--chart-1))',
  },
  mixed: {
    label: 'Mixed',
    color: 'hsl(var(--chart-2))',
  },
};


// --- Main Infographic Component ---

const PresInfographic = () => {
    return (
        <div className="space-y-6">

            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    Posterior Reversible Encephalopathy Syndrome <GradientText>(PRES)</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">A Guide to Clinicoradiological Findings</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* I. General MRI Characteristics & Edema Type */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.648l.21-1.05a2.25 2.25 0 00-1.58-2.618l-1.05-.21a2.25 2.25 0 00-2.618 1.58l-.21 1.05a2.25 2.25 0 001.58 2.618l1.05.21a2.25 2.25 0 002.618-1.58z" />
                            I. General MRI Characteristics & Edema Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground">Vasogenic Edema (Typical)</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>High ADC values</li>
                                    <li>Iso- or hypointense on DWI</li>
                                    <li>May show T2 shine-through effect on DWI</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Cytotoxic Edema (Less Common)</h3>
                                <ul className="list-disc list-inside text-base text-muted-foreground mt-1 space-y-1">
                                    <li>Bright signal on DWI</li>
                                    <li>Decreased ADC values</li>
                                    <li>Correlates with larger vasogenic edema areas</li>
                                </ul>
                            </div>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Edema Composition (Study of 79 Patients)</CardTitle>
                                <CardDescription>Percentage distribution of edema types.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={edemaChartConfig} className="min-h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={edemaPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {edemaPieChartData.map((entry) => (
                                                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>

                {/* II. Etiologies and Risk Factors */}
                <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            II. Etiologies & Risk Factors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Most Frequent Associations</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground space-y-2">
                                <li><span className="font-semibold text-foreground">Hypertension:</span> Present in 84-100% of patients at onset.</li>
                                <li><span className="font-semibold text-foreground">(Pre)eclampsia:</span> A significant risk factor, found in 44.3% of patients in one study.</li>
                                <li><span className="font-semibold text-foreground">Renal Disease/Failure:</span> Common cause, including chronic renal failure (31.6% in one study) and glomerulonephritis.</li>
                                <li><span className="font-semibold text-foreground">Autoimmune Disorders:</span> Systemic lupus erythematosus (SLE) found in 38% of patients in one study.</li>
                                <li><span className="font-semibold text-foreground">Cytotoxic/Immunosuppressive Meds:</span> Used in chemotherapy and post-transplant.</li>
                                <li><span className="font-semibold text-foreground">Sepsis:</span> Especially when associated with acute kidney injury.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary mb-2">Demographics & Other Causes</h3>
                            <ul className="list-disc list-inside text-base text-muted-foreground space-y-2">
                                <li><span className="font-semibold text-foreground">Gender:</span> Higher occurrence in females (ratio up to 1:5.57).</li>
                                <li><span className="font-semibold text-foreground">Age:</span> Can occur in any age group; mean age in pediatrics is ~10-11 years.</li>
                                <li><span className="font-semibold text-foreground">Other Causes:</span> Organ transplantation, sickle cell anemia, vasculitis, certain toxins, and metabolic disturbances like hypomagnesaemia.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* III. Lesion Location & Distribution */}
                <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                            III. Lesion Location & Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-primary">Typical Pattern: Posterior Dominance</h3>
                            <p className="text-base text-muted-foreground">Predominantly affects subcortical white matter of posterior lobes. Usually symmetrical and bilateral.</p>
                            <div className="flex flex-wrap gap-6 mt-2">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-foreground">~100%</p>
                                    <p className="text-base text-muted-foreground">Parietal Lobe</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-foreground">~85%</p>
                                    <p className="text-base text-muted-foreground">Occipital Lobe</p>
                                </div>
                            </div>
                        </div>
                        <LocationsBarChart />
                    </CardContent>
                </Card>

                {/* IV. Atypical Imaging Features */}
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            IV. Atypical Imaging Features
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <h3 className="font-semibold text-secondary">Contrast Enhancement</h3>
                            <p className="text-base mt-1 text-muted-foreground">Seen in <span className="text-foreground font-bold">21-50%</span> of patients. Does not correlate with functional outcome.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary">Hemorrhage</h3>
                            <p className="text-base mt-1 text-muted-foreground">Occurs in <span className="text-foreground font-bold">5-30%</span> of cases and doesn't exclude PRES. Can be intraparenchymal, microbleeds, or subarachnoid.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary">Restricted Diffusion</h3>
                            <p className="text-base mt-1 text-muted-foreground">Indicates cytotoxic edema. Found in <span className="text-foreground font-bold">17-33%</span> of cases. Can lead to permanent injury.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* V. Resolution and Prognosis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662v1.562a4.006 4.006 0 003.7 3.7c1.846.053 3.695.085 5.568 0a4.006 4.006 0 003.7-3.7v-1.562zM12 15.75a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            V. Resolution & Prognosis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4 text-base">While PRES is typically <span className="text-primary font-semibold">reversible</span>, it's not always complete. Follow-up imaging is crucial.</p>
                        <div className="bg-muted p-4 rounded-lg">
                            <h3 className="font-semibold text-foreground">Resolution Timeline</h3>
                            <p className="text-base text-muted-foreground">Median time for MRI lesion improvement/disappearance: <span className="text-foreground font-bold">9 days</span> (range 3-60 days).</p>
                            <p className="text-base text-muted-foreground mt-1"><span className="text-foreground font-bold">~40%</span> may have residual structural lesions on follow-up.</p>
                        </div>
                        <div className="mt-4 bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                            <h3 className="font-semibold text-destructive">Features Associated with Poor Outcomes</h3>
                            <ul className="list-disc list-inside text-base text-destructive/90 mt-2 space-y-1">
                                <li>Extensive or worsening edema</li>
                                <li>Intracranial / Subarachnoid hemorrhage</li>
                                <li>Restrictive diffusion (cytotoxic edema)</li>
                                <li>Corpus callosum involvement</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* VI. Diagnostic Considerations & Role of DSA */}
                <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            VI. Diagnostic Considerations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <h3 className="font-semibold text-foreground">MRI vs. CT</h3>
                            <p className="text-base text-muted-foreground">MRI is more sensitive/specific. CT is often the first test and may show hypodense areas (92.3% in one pediatric study).</p>
                            <h3 className="font-semibold text-foreground mt-4">Differential Diagnosis</h3>
                            <p className="text-base text-muted-foreground"><span className="font-bold text-primary">Acute Ischemic Stroke:</span> Typically shows cytotoxic edema (restricted diffusion) in a unilateral vascular territory.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Role of Digital Subtraction Angiography (DSA)</h3>
                            <p className="text-base text-muted-foreground">Not routine, but considered for suspected RCVS or other arteriopathies. Can reveal:</p>
                            <ul className="list-disc list-inside text-base text-muted-foreground/90 mt-1 pl-2 space-y-1">
                                <li>Diffuse vasoconstriction & vessel pruning.</li>
                                <li>Up to 87% of PRES cases show angiographic changes consistent with RCVS.</li>
                                <li>MRI remains the primary diagnostic tool.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>This infographic summarizes key clinicoradiological findings of PRES based on current literature.</p>
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="http://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on July 3, 2025. Generated with Gemini.
                </p>
            </footer>
        </div>
    );
};

export default PresInfographic;
