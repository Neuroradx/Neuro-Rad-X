'use client';
import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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

const outcomeData = [
    { name: 'Endovascular Therapy (PTAS + AMM)', value: 14.7, key: 'ptas' },
    { name: 'Medical Management (AMM)', value: 5.8, key: 'amm' },
];

const outcomeConfig = {
  ptas: { label: 'PTAS Arm', color: 'hsl(var(--chart-2))' },
  amm: { label: 'Medical Arm', color: 'hsl(var(--chart-1))' },
};

const strokeTypeData = [
  { name: 'Ischemic Stroke (10.2%)', value: 23, key: 'ischemic' },
  { name: 'Hemorrhagic Stroke (4.5%)', value: 10, key: 'hemorrhagic' },
];

const strokeTypeConfig = {
    ischemic: { label: 'Ischemic Stroke', color: 'hsl(var(--chart-1))' },
    hemorrhagic: { label: 'Hemorrhagic Stroke', color: 'hsl(var(--chart-2))' },
};

const perforatorStrokeData = [
    { name: 'Perforator Strokes (52%)', value: 12, key: 'perforator' },
    { name: 'Other Ischemic Infarcts (48%)', value: 11, key: 'other' },
];

const perforatorStrokeConfig = {
    perforator: { label: 'Perforator Strokes', color: 'hsl(var(--chart-4))' },
    other: { label: 'Other Ischemic', color: 'hsl(var(--chart-5))' },
};

const ichRiskData = [
    { name: 'Diameter < 0.6 mm', value: 10, key: 'smallDiameter' },
    { name: 'Diameter > 0.6 mm', value: 0, key: 'largeDiameter' },
];

const ichRiskConfig = {
    smallDiameter: { label: '<0.6mm', color: 'hsl(var(--chart-2))' },
    largeDiameter: { label: '>0.6mm', color: 'hsl(var(--chart-1))' },
};


// --- Main Infographic Component ---

const SammpisTrialInfographic = () => {
    return (
        <div className="space-y-6">
            <header className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
                    A Critical Analysis of the <GradientText>SAMMPRIS Trial</GradientText>
                </h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-4xl mx-auto">An interactive deconstruction of the study that redefined treatment for symptomatic intracranial stenosis, exploring its methodological and technological critiques.</p>
            </header>

            <main className="grid grid-cols-1 gap-6">

                <Card>
                    <CardHeader className="items-center">
                        <CardTitle className="text-xl">The Unexpected Outcome: Intervention vs. Medication</CardTitle>
                         <CardDescription className="text-center">The SAMMPRIS trial was stopped prematurely as endovascular therapy (PTAS) performed significantly worse than Aggressive Medical Management (AMM) alone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={outcomeConfig} className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart accessibilityLayer data={outcomeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid horizontal={false} />
                                    <XAxis type="number" unit="%" />
                                    <YAxis dataKey="name" type="category" width={220} tick={{ fontSize: 12 }} />
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="value" name="Primary Endpoint (Stroke or Death at 30 days)" radius={5}>
                                         {outcomeData.map((entry) => (
                                            <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-2xl font-bold text-foreground text-center mb-6 mt-4">Deconstructing the Result: Key Criticisms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-primary">1. Excessive Periprocedural Risk</CardTitle>
                                <CardDescription>The central critique is the high complication rate of the PTAS procedure, suggesting acute, procedure-related failures.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <p className="text-4xl font-extrabold text-destructive">75%</p>
                                    <p className="text-sm text-muted-foreground">of primary endpoint events in the PTAS arm occurred within 24 hours.</p>
                                </div>
                                <Card>
                                    <CardHeader className="items-center p-2">
                                        <CardTitle className="text-base">Composition of 30-Day Events (PTAS Arm)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ChartContainer config={strokeTypeConfig} className="h-[180px] w-full">
                                             <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                                    <Pie data={strokeTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                                                        {strokeTypeData.map((entry) => <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />)}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-primary">2. Selection Bias & Delayed Randomization</CardTitle>
                                <CardDescription>A central review before randomization led to an average delay of 7 days, likely filtering out high-risk patients who failed medical therapy early, skewing results in favor of the medical arm.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col justify-center items-center h-full">
                               <div className="w-full space-y-3 p-2 border border-border/50 rounded-lg bg-muted/30">
                                    <div className="bg-card p-2 rounded-lg text-center shadow-sm">
                                        <p className="font-semibold text-foreground text-sm">Qualifying Ischemic Event</p>
                                    </div>
                                    <div className="text-xl font-bold text-muted-foreground text-center">▼</div>
                                    <div className="bg-card p-2 rounded-lg text-center shadow-sm">
                                        <p className="font-semibold text-foreground text-sm">Central Angiography Review</p>
                                        <p className="text-xs text-muted-foreground">(Average 7 Day Delay)</p>
                                    </div>
                                    <div className="text-sm font-semibold text-destructive my-1 text-center p-2 border-2 border-dashed border-destructive/50 rounded-md">→ Patients with Early Medical Failure Excluded</div>
                                    <div className="text-xl font-bold text-muted-foreground text-center">▼</div>
                                    <div className="bg-green-500/10 p-2 rounded-lg text-center shadow-sm">
                                        <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Randomization</p>
                                        <p className="text-xs text-muted-foreground">(Cohort of more stable patients)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-primary">3. The Perforator Stroke Problem</CardTitle>
                                <CardDescription>A high proportion of procedural strokes were lacunar (perforating) infarcts, likely caused by plaque displacement—a risk without a corresponding benefit.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Card>
                                     <CardHeader className="items-center p-2">
                                        <CardTitle className="text-base">Type of Procedural Ischemic Strokes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ChartContainer config={perforatorStrokeConfig} className="h-[180px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                                    <Pie data={perforatorStrokeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                                        {perforatorStrokeData.map((entry) => <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />)}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                        
                        <Card>
                           <CardHeader>
                                <CardTitle className="text-lg text-primary">4. Technical & Device-Related Flaws</CardTitle>
                                <CardDescription>Issues with sizing methodology may have led to vessel 'oversizing,' contributing to a high rate of Intracranial Hemorrhage (ICH), especially in smaller vessels.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Card>
                                    <CardHeader className="items-center p-2">
                                        <CardTitle className="text-base">ICH Risk by Pre-Stent Vessel Diameter</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ChartContainer config={ichRiskConfig} className="h-[180px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={ichRiskData}>
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                                    <YAxis unit="%" domain={[0, 12]}/>
                                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                                                     <Bar dataKey="value" name="ICH Risk" radius={5}>
                                                        {ichRiskData.map((entry) => (
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
                    </div>
                </div>
                
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="text-xl">Conclusion: Reinterpreting the Evidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground max-w-4xl mx-auto">The SAMMPRIS outcome is now widely interpreted not as a definitive failure of endovascular revascularization, but as a failure of a specific, early-generation technology combined with flawed patient selection. The trial's legacy is driving research toward identifying high-risk subgroups and developing safer technologies.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                           <SectionIcon path="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                           References
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <ul className="space-y-3 text-xs text-muted-foreground">
                           <li className="break-inside-avoid">Chimowitz, M. I., et al. (2011). Stenting versus aggressive medical therapy for intracranial arterial stenosis. *New England Journal of Medicine*, *365*(11), 993–1003.</li>
                           <li className="break-inside-avoid">Abou-Chebl, A., & Steinmetz, H. (2012). Critique of “Stenting versus Aggressive Medical Therapy for Intracranial Arterial Stenosis” by Chimowitz et al. *Stroke*, *43*(2), 616–620.</li>
                        </ul>
                    </CardContent>
                </Card>
            </main>

            <footer className="text-center mt-10 text-xs text-muted-foreground">
                <p>For educational purposes only. Not a substitute for professional medical advice.</p>
                <p className="mt-2">
                    Created by <a href="https://www.neuroradx.de/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 2, 2025. Generated with Gemini.
                </p>
            </footer>

            </div>
    );
};

export default SammpisTrialInfographic;
