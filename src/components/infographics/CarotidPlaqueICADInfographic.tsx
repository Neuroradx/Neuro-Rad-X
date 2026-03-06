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
const burdenData = [
  { name: 'Western Populations', value: 12.5, key: 'western' },
  { name: 'Asian/Black/Hispanic', value: 40, key: 'minority' },
];

const trialData = [
  { name: 'SAMMPRIS', medical: 5.8, stenting: 14.7, key: 'sammpris' },
  { name: 'VISSIT', medical: 9.4, stenting: 24.1, key: 'vissit' },
  { name: 'CASSISS', medical: 14.3, stenting: 14.8, key: 'cassiss' },
  { name: 'WEAVE (On-label)', medical: 0, stenting: 2.6, key: 'weave' },
];

const chartConfig = {
  western: { label: 'Western (10-15%)', color: 'hsl(var(--chart-1))' },
  minority: { label: 'Asian/Black/Hispanic (30-50%)', color: 'hsl(var(--chart-2))' },
  medical: { label: 'Medical Therapy (%)', color: 'hsl(var(--chart-3))' },
  stenting: { label: 'Stenting/PTA (%)', color: 'hsl(var(--chart-4))' },
};

const sources = [
  { title: 'WEAVE trial: Final results in 152 on-label patients', source: 'Stroke', url: 'https://doi.org/10.1161/STROKEAHA.118.023996' },
  { title: 'Diagnostic performance of vessel wall magnetic resonance imaging (VW-MRI) for intracranial vasculopathies', source: 'Cureus', url: 'https://doi.org/10.7759/cureus.97296' },
  { title: 'Surgical management of intracranial atherosclerotic disease: Current evidence and future directions', source: 'Journal of Vascular Diseases', url: '#' },
  { title: 'The past, present, and future of intracranial atherosclerosis treatment', source: 'Stroke', url: 'https://doi.org/10.1161/STROKEAHA.123.045000' },
  { title: 'Stenting versus medical therapy for symptomatic intracranial artery stenosis: Long-term follow-up', source: 'Stroke', url: '#' },
  { title: 'Imaging and hemodynamic characteristics of vulnerable carotid plaques and AI applications', source: 'Brain Sciences', url: 'https://doi.org/10.3390/brainsci13010143' },
  { title: 'Intracranial vessel wall MRI: Principles and expert consensus recommendations', source: 'American Journal of Neuroradiology', url: 'https://doi.org/10.3174/ajnr.A4893' },
  { title: 'Incidence and risk factors of in-stent restenosis for symptomatic intracranial atherosclerotic stenosis', source: 'American Journal of Neuroradiology', url: 'https://doi.org/10.3174/ajnr.A6661' },
  { title: 'Intracranial stenting with the Neuroform Atlas Stent for symptomatic ICAD', source: 'Frontiers in Neurology', url: 'https://doi.org/10.3389/fneur.2025.1507339' },
  { title: 'Optional or optimal? Off-label stenting for intracranial atherosclerotic stenosis', source: 'Interventional Neuroradiology', url: 'https://doi.org/10.1177/15910199231182245' },
];

/**
 * MAIN COMPONENT
 */
export default function CarotidPlaqueICADInfographic() {
  return (
    <div className="infographic-layout space-y-8">
      {/* HEADER SECTION */}
      <header className="infographic-header">
        <h1 className="infographic-title">
          Vulnerable <GradientText>Carotid Plaque</GradientText> & ICAD Management
        </h1>
        <p className="infographic-subtitle">
          A New Era of Precision Medicine in Neurovascular Intervention
        </p>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECTION 1: GLOBAL BURDEN (PIE CHART) */}
        <Card className="infographic-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              Global Burden of ICAD
            </CardTitle>
            <CardDescription>Prevalence of ICAD as a mechanism for Acute Ischemic Stroke (AIS)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={burdenData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="hsl(var(--background))"
                    strokeWidth={2.5}
                    label
                  >
                    {burdenData.map((entry) => (
                      <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-muted-foreground">
              <strong className="text-foreground">Key Insight:</strong> 1-year stroke recurrence remains high at ≈15% under optimal medical management.
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: VW-HRMRI BIOMARKERS */}
        <InfographicSection
          iconPath="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          title="Plaque Vulnerability (VW-HRMRI)"
          span={1}
        >
          <div className="space-y-4">
            <Card className="infographic-card-inner">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold text-primary">Lipid-Rich Necrotic Core (LRNC)</p>
                <p className="text-xs text-muted-foreground">Volume &gt;40% and thin fibrous cap (&lt;165 μm) indicate rupture-prone status.</p>
              </CardContent>
            </Card>
            <Card className="infographic-card-inner">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold text-primary">Intraplaque Hemorrhage (IPH)</p>
                <p className="text-xs text-muted-foreground">T1 hyperintensity (&gt;150% signal) is the strongest predictor of future events (AUC 0.825).</p>
              </CardContent>
            </Card>
            <Card className="infographic-card-inner">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold text-primary">Contrast Enhancement</p>
                <p className="text-xs text-muted-foreground">Ratios ≥53 indicate active neovascularization and high inflammation.</p>
              </CardContent>
            </Card>
          </div>
        </InfographicSection>

        {/* SECTION 3: CLINICAL TRIALS (BAR CHART) */}
        <Card className="infographic-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.791.425 1.077m2.73 0c.263-.286.425-.662.425-1.077 0-.231-.035-.454-.1-.664m-5.801 0A2.251 2.251 0 0111.25 2.25h2.25a2.251 2.251 0 012.285 1.242M7.5 5.512c0-.856.66-1.551 1.487-1.602 1.423-.088 2.854-.131 4.288-.13c1.434 0 2.865.042 4.288.13a1.596 1.596 0 011.487 1.602V19.5A2.25 2.25 0 0119.5 21.75h-15a2.25 2.25 0 01-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.467 48.467 0 011.123-.08A1.597 1.597 0 017.5 5.512z" />
              Clinical Trial Evolution: Medical vs. Stenting
            </CardTitle>
            <CardDescription>30-Day Stroke/Death outcomes across major randomized controlled trials (RCTs)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="infographic-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="medical" fill="var(--color-medical)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stenting" fill="var(--color-stenting)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="text-sm">
                <p className="font-bold border-l-4 border-primary pl-2 mb-2">Historical Failures</p>
                <p className="text-muted-foreground italic">SAMMPRIS & VISSIT showed unacceptable perioperative risks with routine stenting (up to 24.1%).</p>
              </div>
              <div className="text-sm">
                <p className="font-bold border-l-4 border-primary pl-2 mb-2">Modern Successes</p>
                <p className="text-muted-foreground italic">WEAVE Trial achieved 2.6% complication rates by following strict &quot;on-label&quot; criteria.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: AI AND HEMODYNAMICS */}
        <InfographicSection
          iconPath="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          title="AI & Hemodynamic Prediction"
          span={2}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Deep Learning</h4>
              <p className="text-xs text-muted-foreground">U-Net/Transformers achieve 90% accuracy in automated segmentation of lipids and hemorrhage.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Radiomics</h4>
              <p className="text-xs text-muted-foreground">Quantitative models distinguish stable vs. vulnerable plaques with AUC scores up to 0.989.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Hemodynamics</h4>
              <p className="text-xs text-muted-foreground">Low WSS promotes endothelial proliferation (up to 18-fold) and lipid retention.</p>
            </div>
          </div>
        </InfographicSection>

        {/* SECTION 5: ISR RISKS TABLE */}
        <Card className="infographic-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <SectionIcon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              In-Stent Restenosis (ISR) & Risk Prediction
            </CardTitle>
            <CardDescription>Key factors and mechanisms for ISR prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Risk Factor</TableHead>
                  <TableHead>Mechanism</TableHead>
                  <TableHead className="text-right">Prediction Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Plaque Eccentricity</TableCell>
                  <TableCell className="text-muted-foreground">Asymmetric stress distribution post-stenting</TableCell>
                  <TableCell className="text-right">&gt;80% (AI Nomograms)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Enhancement Ratio</TableCell>
                  <TableCell className="text-muted-foreground">Ongoing vascular wall inflammation</TableCell>
                  <TableCell className="text-right">High Correlation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Submaximal Angioplasty</TableCell>
                  <TableCell className="text-muted-foreground">Reduced endothelial trauma (BASIS Trial)</TableCell>
                  <TableCell className="text-right">Superior to Medical</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SOURCES CARD */}
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
                  {source.url && source.url !== '#' && (
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

      {/* FOOTER */}
      <footer className="infographic-footer">
        <p>This infographic summarizes key findings on Vulnerable Carotid Plaque and ICAD Management based on current literature.</p>
        <p>For educational purposes only. Not a substitute for professional medical advice.</p>
        <p className="mt-2">
          Created by <a href="https://www.neuroradx.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NeuroRadX</a> on October 9, 2025. Generated with Gemini.
        </p>
      </footer>
    </div>
  );
}
