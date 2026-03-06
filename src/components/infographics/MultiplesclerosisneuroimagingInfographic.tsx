'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Line, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GradientText, SectionIcon, InfographicSection } from './infographic-shared';

/**
 * DATA CONSTANTS
 */
const PHENOTYPE_DATA = [
  { name: 'RRMS (Relapsing-Remitting)', value: 85, key: 'rrms' },
  { name: 'PPMS (Primary Progressive)', value: 15, key: 'ppms' },
];

const ATROPHY_DATA = [
  { name: 'Healthy Controls', rate: 0.15, key: 'healthy' },
  { name: 'MS Patients', rate: 0.65, key: 'ms' },
  { name: 'Critical Threshold', rate: 0.94, key: 'risk' },
];

const LESION_EVOLUTION = [
  { stage: 'Acute Gd+', percentage: 100, label: 'Inflammation' },
  { stage: 'T2 Residual', percentage: 95, label: 'Chronic Plaque' },
  { stage: 'Black Hole', percentage: 30, label: 'Axonal Loss' },
];

const CHART_CONFIG = {
  rrms: { label: 'RRMS', color: 'hsl(var(--chart-1))' },
  ppms: { label: 'PPMS', color: 'hsl(var(--chart-2))' },
  healthy: { label: 'Healthy', color: 'hsl(var(--chart-3))' },
  ms: { label: 'MS', color: 'hsl(var(--chart-1))' },
  risk: { label: 'Critical', color: 'hsl(var(--chart-5))' },
  lesion: { label: 'Lesion %', color: 'hsl(var(--chart-1))' },
};

/**
 * MAIN COMPONENT
 */
export default function MultiplesclerosisneuroimagingInfographic() {
  return (
    <div className="infographic-layout space-y-8">
      {/* HEADER */}
      <header className="infographic-header">
        <h1 className="infographic-title">
          Quantitative <GradientText>Neuroimaging Paradigms</GradientText> in MS
        </h1>
        <p className="infographic-subtitle">
          Deep analytics on 2017 McDonald Criteria, volumetric atrophy metrics, and the subclinical burden of CNS demyelination.
        </p>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 1: PHENOTYPES */}
        <Card className="infographic-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              Clinical Phenotypes at Onset
            </CardTitle>
            <CardDescription>Frequency of MS types in new diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={PHENOTYPE_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    strokeWidth={2.5}
                    stroke="hsl(var(--background))"
                    label
                  >
                    {PHENOTYPE_DATA.map((entry) => (
                      <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* SECTION 2: THE "ICEBERG" EFFECT */}
        <Card className="infographic-card md:col-span-1 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M2.25 18L9 11.25l4.5 4.5L21.75 7.5" />
              The Subclinical Iceberg
            </CardTitle>
            <CardDescription>Radiological Activity vs. Clinical Symptoms</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center py-6">
              <span className="text-7xl font-black text-primary">10x</span>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">More Lesions</p>
            </div>
            <p className="text-sm text-center text-muted-foreground leading-relaxed px-4">
              Serial MRI studies demonstrate that new subclinical T2 lesions appear with a frequency <span className="text-foreground font-semibold">5 to 10 times higher</span> than clinically apparent relapses.
            </p>
          </CardContent>
        </Card>

        {/* SECTION 3: MCDONALD CRITERIA (FULL WIDTH) */}
        <Card className="infographic-card md:col-span-2 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M9 12h3.75M9 15h3.75M9 18h3.75m.75 3H6a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0111.548 0c1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H9.75M9 7.5h.75m-1.5 0H7.5" />
              2017 McDonald Criteria: Diagnostic Matrix
            </CardTitle>
            <CardDescription>Requirements for Dissemination in Space (DIS) on MRI</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold">Anatomical Region</TableHead>
                  <TableHead className="font-bold">MRI Threshold</TableHead>
                  <TableHead className="font-bold">Clinical Insight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Periventricular</TableCell>
                  <TableCell>≥ 1 T2-Lesion</TableCell>
                  <TableCell className="text-muted-foreground text-sm">Classic demyelinating hallmark.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Cortical / Juxtacortical</TableCell>
                  <TableCell>≥ 1 T2-Lesion</TableCell>
                  <TableCell className="text-muted-foreground text-sm">Involves gray matter or subcortical U-fibers.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Infratentorial</TableCell>
                  <TableCell>≥ 1 T2-Lesion</TableCell>
                  <TableCell className="text-muted-foreground text-sm">Brainstem and cerebellum focus.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Spinal Cord</TableCell>
                  <TableCell>≥ 1 T2-Lesion</TableCell>
                  <TableCell className="text-muted-foreground text-sm">High specificity for chronic disability.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h4 className="font-bold text-sm text-primary flex items-center mb-1">
                <SectionIcon path="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                The OCB Substitute
              </h4>
              <p className="text-xs text-muted-foreground">
                CSF-specific oligoclonal bands (OCBs) now formally substitute for the requirement of Dissemination in Time (DIT) in patients with a typical CIS.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: ATROPHY */}
        <Card className="infographic-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              Accelerated Atrophy (aPBVC)
            </CardTitle>
            <CardDescription>Percentage Brain Volume Change per Year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ATROPHY_DATA} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={10} axisLine={false} tickLine={false} />
                  <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={30}>
                    {ATROPHY_DATA.map((entry) => (
                      <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-[10px] text-center text-muted-foreground italic">
              Loss rates ≥ 0.4% are considered clinically significant in MS cohorts.
            </p>
          </CardContent>
        </Card>

        {/* SECTION 5: BLACK HOLES */}
        <Card className="infographic-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              Lesion Evolution
            </CardTitle>
            <CardDescription>From Acute Inflammation to Tissue Loss</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={LESION_EVOLUTION}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="stage" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 110]} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="var(--color-lesion)"
                    strokeWidth={4}
                    dot={{ r: 6, fill: 'var(--color-lesion)', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="text-center mt-2 px-6">
              <p className="text-xs text-muted-foreground italic">
                Up to <span className="font-bold text-foreground">40%</span> of Gd+ lesions evolve into permanent "Black Holes" (T1 hypointensities).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 6: SMOLDERING MS */}
        <InfographicSection 
          iconPath="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" 
          title="The Smoldering Disease: Advanced Biomarkers" 
          span={2}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="infographic-card-inner">
              <CardContent className="pt-4 space-y-2">
                <h5 className="font-bold text-sm text-primary uppercase tracking-tighter">SELs</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Slowly Expanding Lesions (Smoldering Plaques) reflect chronic microglia-mediated inflammation independent of relapses.
                </p>
              </CardContent>
            </Card>
            <Card className="infographic-card-inner">
              <CardContent className="pt-4 space-y-2">
                <h5 className="font-bold text-sm text-primary uppercase tracking-tighter">OCT Analytics</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Retinal Layer thinning (RNFL & GCIP) serves as a sensitive surrogate for global CNS neuroaxonal loss.
                </p>
              </CardContent>
            </Card>
            <Card className="infographic-card-inner">
              <CardContent className="pt-4 space-y-2">
                <h5 className="font-bold text-sm text-primary uppercase tracking-tighter">PIRA</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Progression Independent of Relapse Activity: The "hidden" driver of disability in both RRMS and PPMS phenotypes.
                </p>
              </CardContent>
            </Card>
          </div>
        </InfographicSection>

      </main>

      {/* FOOTER & REFERENCES */}
      <footer className="infographic-footer text-left">
        <div className="space-y-6 text-left">
          <p className="text-sm">This infographic summarizes key neuroimaging paradigms and diagnostic criteria in multiple sclerosis based on current literature.</p>
          <p className="text-sm">For educational purposes only. Not a substitute for professional medical advice.</p>
          <h3 className="text-xl font-bold text-foreground">Scientific Bibliography (APA 7th Edition)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
            <ol className="text-[10px] text-muted-foreground space-y-2 list-decimal pl-5 leading-relaxed">
              <li>Caldwell, D. M. (2014). An overview of conducting systematic reviews with network meta-analysis. <i>Systematic Reviews, 3</i>, 109. https://doi.org/10.1186/2046-4053-3-109</li>
              <li>Cohen, J. A., Reingold, S. C., Polman, C. H., & Wolinsky, J. S. (2012). Disability outcome measures in multiple sclerosis clinical trials. <i>Lancet Neurology, 11</i>(5), 467-476.</li>
              <li>Espín, J., Oliva, J., & Rodríguez-Barrios, J. M. (2010). Esquemas innovadores de mejora del acceso al mercado: acuerdos de riesgo compartido. <i>Gaceta Sanitaria, 24</i>(6), 491-497.</li>
              <li>Giovannoni, G., Comi, G., Cook, S., et al. (2010). A placebo-controlled trial of oral cladribine for relapsing multiple sclerosis. <i>NEJM, 362</i>(5), 416-426.</li>
              <li>Kurtzke, J. F. (2005). Epidemiology of etiology of multiple sclerosis. <i>Physical Medicine and Rehabilitation Clinics, 16</i>, 327-349.</li>
            </ol>
            <ol className="text-[10px] text-muted-foreground space-y-2 list-decimal pl-5 leading-relaxed" start={6}>
              <li>Modrego, P. J., & Pina, M. A. (2003). Trends in prevalence and incidence of multiple sclerosis in Bajo Aragón, Spain. <i>Journal of Neurological Sciences, 216</i>(1), 89-93.</li>
              <li>Reich, D. S., Lucchinetti, C. F., & Calabresi, P. A. (2018). Multiple sclerosis. <i>The New England Journal of Medicine, 378</i>(2), 169-180.</li>
              <li>Saidha, S., Al-Louzi, O., Ratchford, J. N., et al. (2015). Optical coherence tomography reflects brain atrophy in MS. <i>Annals of Neurology, 78</i>(5), 801-813.</li>
              <li>Thompson, A. J., Banwell, B. L., Barkhof, F., et al. (2018). Diagnosis of multiple sclerosis: 2017 revisions of the McDonald criteria. <i>Lancet Neurology, 17</i>(2), 162-173.</li>
              <li>Tonin, F. S., Rotta, I., Mendes, A. M., & Pontarolo, R. (2017). Network meta-analysis: gathering evidence from direct comparisons. <i>Pharmacy Practice, 15</i>(1), 943.</li>
            </ol>
          </div>
          <p className="text-[9px] text-muted-foreground/50 italic mt-8 pt-4">
            Educational resource for clinicians. All radiological parameters should be interpreted within the context of the individual patient's longitudinal history.
          </p>
          <p className="mt-2">
            Created by <a href="https://www.neuroradx.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a>. Generated with Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}