'use client';

import React from 'react';
import { GradientText, SectionIcon, InfographicSection } from './infographic-shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cell, Pie, PieChart, ResponsiveContainer, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';

/**
 * DATA CONSTANTS
 */
const epidemiologicData = [
  { group: 'Primary CNS Tumors', value: 36, id: 'cns' },
  { group: 'Benign Brain Tumors', value: 53, id: 'benign' },
  { group: 'Other Neoplasms', value: 11, id: 'other' },
];

const molecularData = [
  { name: 'NF2 Mutant (22q loss)', value: 50, id: 'nf2' },
  { name: 'TRAF7/KLF4/AKT1/SMO', value: 40, id: 'non_nf2' },
  { name: 'Other (POLR2A/PIK3CA)', value: 10, id: 'rare' },
];

const survivalData = [
  { grade: 'WHO Grade 1', survival: 85, id: 'g1' },
  { grade: 'WHO Grade 2', survival: 55, id: 'g2' },
  { grade: 'WHO Grade 3', survival: 19, id: 'g3' },
];

/**
 * CHART CONFIGURATIONS
 */
const epidemiologicConfig = {
  cns: { label: 'Primary CNS', color: 'hsl(var(--chart-1))' },
  benign: { label: 'Benign CNS', color: 'hsl(var(--chart-2))' },
  other: { label: 'Other', color: 'hsl(var(--chart-3))' },
};

const molecularConfig = {
  nf2: { label: 'NF2 Mutant', color: 'hsl(var(--chart-1))' },
  non_nf2: { label: 'Wild-Type Pathway', color: 'hsl(var(--chart-4))' },
  rare: { label: 'Rare Mutations', color: 'hsl(var(--chart-5))' },
};

const survivalConfig = {
  g1: { label: 'Grade 1', color: 'hsl(var(--chart-2))' },
  g2: { label: 'Grade 2', color: 'hsl(var(--chart-3))' },
  g3: { label: 'Grade 3', color: 'hsl(var(--chart-5))' },
};

const sources = [
  { title: "Simpson's Grading Scale for WHO Grade I Meningioma Resection in the Modern Neurosurgical Era", source: 'Journal of Neurological Surgery Part B: Skull Base', url: 'https://doi.org/10.1055/a-2021-8852' },
  { title: 'Molecular biomarkers in meningioma (Review)', source: 'Biomedical Reports', url: 'https://doi.org/10.3892/br.2025.1934' },
  { title: 'Benchmarking the efficacy of salvage systemic therapies for recurrent meningioma: A RANO group systematic review and meta-analysis', source: 'Neuro-Oncology', url: 'https://doi.org/10.1093/neuonc/noaf009' },
  { title: 'Consensus core clinical data elements for meningiomas (v2021.1)', source: 'Neuro-Oncology', url: 'https://doi.org/10.1093/neuonc/noab259' },
  { title: 'A Prospective Registry Study of 68Ga-DOTATATE PET/CT Incorporation Into Treatment Planning of Intracranial Meningiomas', source: 'International Journal of Radiation Oncology Biology Physics', url: 'https://doi.org/10.1016/j.ijrobp.2023.10.014' },
  { title: 'Grading meningioma resections: The Simpson classification and beyond', source: 'Acta Neurochirurgica', url: 'https://doi.org/10.1007/s00701-024-05910-9' },
  { title: 'Advancements in the application of MRI radiomics in meningioma', source: 'Radiation Oncology', url: 'https://doi.org/10.1186/s13014-025-02679-8' },
  { title: 'Advanced Imaging of Intracranial Meningiomas', source: 'Neurosurgery Clinics of North America', url: 'https://doi.org/10.1016/j.nec.2015.11.004' },
  { title: 'Grade-stratified meningioma risk among individuals who are non-Hispanic Black and interactions with male sex', source: 'Journal of the National Cancer Institute', url: 'https://doi.org/10.1093/jnci/djae253' },
  { title: 'Intracranial meningiomas: An update of the 2021 World Health Organization classifications and review of management with a focus on radiation therapy', source: 'Frontiers in Oncology', url: 'https://doi.org/10.3389/fonc.2023.1137849' },
];

export default function MeningiomaInfographic() {
  return (
    <div className="infographic-layout space-y-8">
      <header className="infographic-header">
        <h1 className="infographic-title">
          Advanced Neuro-oncology: <GradientText>Meningioma Precision Profiling</GradientText>
        </h1>
        <p className="infographic-subtitle">
          An integrated analysis of the most frequent primary CNS tumor, spanning from genomic drivers to advanced theranostic imaging and clinical prognosis.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Epidemiology & Demographics */}
        <Card className="infographic-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              Epidemiology & Burden
            </CardTitle>
            <CardDescription>Incidence and demographic disparities</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={epidemiologicConfig} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={epidemiologicData}
                    dataKey="value"
                    nameKey="group"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={2.5}
                    stroke="hsl(var(--background))"
                  >
                    {epidemiologicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.id})`} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary">Key Metric:</span> Female-to-male ratio is approximately 3:1 in middle age, while Black populations show higher rates of aggressive high-grade variants.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Molecular Drivers */}
        <Card className="infographic-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M4.745 3A23.933 23.933 0 0112 4.125c2.443 0 4.79-.364 7-1.031M4.745 3L3.036 6.09c-.366.666-.087 1.491.568 1.792l1.635.75M19 3l1.708 3.09c.366.666.087 1.491-.567 1.792l-1.635.75M6.75 6.75l.75-2.25M17.25 6.75l-.75-2.25M6.75 21l.75-2.25M17.25 21l-.75-2.25M3 18.75a23.933 23.933 0 0018 0M3 18.75l1.708-3.09c.366-.666.087-1.491.568-1.792l1.635-.75M21 18.75l-1.708-3.09c-.366-.666-.087-1.491-.567-1.792l-1.635-.75M6.75 14.25l.75 2.25M17.25 14.25l-.75 2.25" />
              Genomic Architecture
            </CardTitle>
            <CardDescription>WHO 2021 Integrated Molecular Classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={molecularConfig} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={molecularData} layout="vertical" margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {molecularData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--color-${entry.id})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>NF2 Pathway:</strong> Convexity/Posterior fossa locations; higher recurrence risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Non-NF2:</strong> Skull base predilection (SMO, AKT1); secretory phenotype (KLF4/TRAF7).</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3: Neuroimaging & Diagnostics */}
        <InfographicSection
          iconPath="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          title="Diagnostic Innovation & Radiomics"
          span={2}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="infographic-card-inner">
              <CardContent className="pt-6">
                <h4 className="font-bold text-primary mb-2">Multiparametric MRI</h4>
                <p className="text-sm">Classic dural tail sign; DSC/DCE perfusion reveals markedly elevated rCBV/rCBF.</p>
              </CardContent>
            </Card>
            <Card className="infographic-card-inner">
              <CardContent className="pt-6">
                <h4 className="font-bold text-primary mb-2">PET 68Ga-DOTATATE</h4>
                <p className="text-sm">Targeting SSTR2 receptors; differentiates viable tumor from radiation necrosis.</p>
              </CardContent>
            </Card>
            <Card className="infographic-card-inner">
              <CardContent className="pt-6">
                <h4 className="font-bold text-primary mb-2">MR Spectroscopy</h4>
                <p className="text-sm">Signature alanine peak (1.47 ppm) and absence of N-acetylaspartate.</p>
              </CardContent>
            </Card>
          </div>
        </InfographicSection>

        {/* Section 4: Clinical Outcomes & Survival */}
        <Card className="infographic-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              Integrated Prognosis: 10-Year Overall Survival
            </CardTitle>
            <CardDescription>Comparison by WHO grading and molecular stability</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <ChartContainer config={survivalConfig} className="infographic-chart">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={survivalData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="grade" fontSize={12} />
                    <YAxis unit="%" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="survival" radius={[4, 4, 0, 0]}>
                      {survivalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.id})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="w-full md:w-1/2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WHO Grade</TableHead>
                    <TableHead>Molecular Markers</TableHead>
                    <TableHead className="text-right">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Grade 1</TableCell>
                    <TableCell>SMO, AKT1, TRAF7</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">Low</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Grade 2</TableCell>
                    <TableCell>NF2, genomic instability</TableCell>
                    <TableCell className="text-right text-yellow-600 dark:text-yellow-400">Intermediate</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Grade 3</TableCell>
                    <TableCell>TERT prom, CDKN2A/B</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">High</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Sources Card */}
        <Card className="infographic-card md:col-span-2">
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
                  {source.url && (
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

      <footer className="infographic-footer">
        <p>This infographic summarizes key findings on Meningioma Precision Profiling based on current literature.</p>
        <p>For educational purposes only. Not a substitute for professional medical advice.</p>
        <p className="mt-2">
          Created by <a href="https://www.neuroradx.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 9, 2025. Generated with Gemini.
        </p>
      </footer>
    </div>
  );
}
