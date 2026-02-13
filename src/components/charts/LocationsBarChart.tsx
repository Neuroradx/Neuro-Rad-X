'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslation } from '@/hooks/use-translation';

export function LocationsBarChart() {
  const { t } = useTranslation();

  const locationsChartData = [
    { location: t('progressPage.locations.frontal'), percentage: 78.3, key: 'frontal' },
    { location: t('progressPage.locations.temporal'), percentage: 45.57, key: 'temporal' },
    { location: t('progressPage.locations.cerebellum'), percentage: 37.97, key: 'cerebellum' },
    { location: t('progressPage.locations.basalGanglia'), percentage: 27.85, key: 'basalGanglia' },
    { location: t('progressPage.locations.brainStem'), percentage: 18.99, key: 'brainStem' },
    { location: t('progressPage.locations.corpusCallosum'), percentage: 13.0, key: 'corpusCallosum' },
  ];

  const chartConfig = {
    percentage: {
      label: t('dashboard.stats.overallAccuracy'),
    },
    frontal: { color: 'hsl(var(--chart-1))' },
    temporal: { color: 'hsl(var(--chart-2))' },
    cerebellum: { color: 'hsl(var(--chart-3))' },
    basalGanglia: { color: 'hsl(var(--chart-4))' },
    brainStem: { color: 'hsl(var(--chart-5))' },
    corpusCallosum: { color: 'hsl(var(--chart-1))' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('progressPage.topicBreakdownTitle')}</CardTitle>
        <CardDescription>{t('progressPage.topicBreakdownDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={locationsChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="percentage" unit="%" />
              <YAxis type="category" dataKey="location" width={110} tick={{ fontSize: 12 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="percentage" radius={5}>
                {locationsChartData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}