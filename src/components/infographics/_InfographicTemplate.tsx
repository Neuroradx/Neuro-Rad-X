'use client';

/**
 * PLANTILLA BASE PARA NUEVAS INFOGRAFÍAS
 * --------------------------------------
 * Pasos para usar:
 * 1. Copiar este archivo y renombrar a [Tema]Infographic.tsx
 * 2. Reemplazar título, subtítulo y contenido de cada sección
 * 3. Definir datos y configs para gráficos (usar siempre hsl(var(--chart-N)))
 * 4. Registrar en src/lib/infographic-registry.ts (COMPONENT_INFOGRAPHICS + COMPONENT_MAP)
 * 5. Si un admin entra en /infographics, Firestore se sincroniza automáticamente
 *
 * Estructura obligatoria:
 * - div.infographic-layout > header.infographic-header > main (grid) > footer.infographic-footer
 * - Secciones: InfographicSection o Card con SectionIcon en CardTitle
 * - Gráficos: ChartContainer + config con colores theme (--chart-1 a --chart-5)
 */

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GradientText, SectionIcon, InfographicSection } from './infographic-shared';

// --- Datos y config para gráficos (siempre theme vars para dark mode) ---

const examplePieData = [
    { name: 'Option A', value: 60, key: 'a' },
    { name: 'Option B', value: 40, key: 'b' },
];

const exampleChartConfig = {
    a: { label: 'Option A', color: 'hsl(var(--chart-1))' },
    b: { label: 'Option B', color: 'hsl(var(--chart-2))' },
};

// --- Componente ---

const InfographicTemplate = () => {
    return (
        <div className="infographic-layout space-y-8">
            <header className="infographic-header">
                <h1 className="infographic-title">
                    Título principal con <GradientText>palabras destacadas</GradientText>
                </h1>
                <p className="infographic-subtitle">Subtítulo breve que describe el contenido de la infografía.</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ejemplo: sección con InfographicSection (span 2 = ancho completo en md+) */}
                <InfographicSection
                    iconPath="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    title="1. Introducción"
                    span={2}
                >
                    <p className="text-base text-muted-foreground">
                        Texto de la sección. Usar <strong className="text-primary">text-primary</strong> para resaltes,
                        listas con <code className="text-sm bg-muted px-1 rounded">list-disc list-inside</code> cuando convenga.
                    </p>
                </InfographicSection>

                {/* Ejemplo: sección con gráfico (Card manual para layout más flexible) */}
                <Card className="infographic-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <SectionIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            2. Ejemplo de gráfico (PieChart)
                        </CardTitle>
                        <CardDescription>Descripción opcional del gráfico.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={exampleChartConfig} className="infographic-chart">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={examplePieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={105}
                                        paddingAngle={4}
                                        strokeWidth={2.5}
                                        stroke="hsl(var(--background))"
                                        label
                                    >
                                        {examplePieData.map((entry) => (
                                            <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Ejemplo: sección con tabla */}
                <InfographicSection
                    iconPath="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                    title="3. Ejemplo de tabla"
                    span={2}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Item 1</TableCell>
                                <TableCell>Dato</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Item 2</TableCell>
                                <TableCell>Dato</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </InfographicSection>
            </main>

            <footer className="infographic-footer">
                <p>Resumen o disclaimer de la infografía.</p>
                <p>Solo fines educativos. No sustituye consejo médico profesional.</p>
            </footer>
        </div>
    );
};

export default InfographicTemplate;
