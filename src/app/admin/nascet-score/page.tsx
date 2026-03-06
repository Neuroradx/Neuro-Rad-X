"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calculator, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { NascetResultDetails } from "@/components/common/NascetResultDetails";

const getNascetSchema = (t: (key: string) => string) => z.object({
  narrowestDiameter: z.number({ invalid_type_error: t('admin.nascetCalculator.validation.numberRequired') }).positive({ message: t('admin.nascetCalculator.validation.positiveRequired') }),
  normalDiameter: z.number({ invalid_type_error: t('admin.nascetCalculator.validation.numberRequired') }).positive({ message: t('admin.nascetCalculator.validation.positiveRequired') }).refine(val => val !== 0, { message: t('admin.nascetCalculator.validation.notZero') }),
});

type NascetFormValues = z.infer<ReturnType<typeof getNascetSchema>>;

export default function NascetScoreCalculatorPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stenosisResult, setStenosisResult] = useState<number | null>(null);

  const nascetSchema = getNascetSchema(t);

  const form = useForm<NascetFormValues>({
    resolver: zodResolver(nascetSchema),
    defaultValues: {
      narrowestDiameter: undefined,
      normalDiameter: undefined,
    },
  });

  function onSubmit(data: NascetFormValues) {
    const { narrowestDiameter, normalDiameter } = data;
    const result = (1 - (narrowestDiameter / normalDiameter)) * 100;
    setStenosisResult(result);
  }
  
  function handleReset() {
      form.reset({
        narrowestDiameter: undefined,
        normalDiameter: undefined,
      });
      setStenosisResult(null);
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.nascetCalculator.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.nascetCalculator.context')}</p>
        </div>
      </div>

      <Card className="rounded-xl border-border/80 overflow-hidden shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{t('admin.nascetCalculator.formTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="narrowestDiameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.nascetCalculator.narrowestDiameterLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2.5"
                        {...field}
                        value={field.value ?? ""}
                        onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                        step="0.1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="normalDiameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.nascetCalculator.normalDiameterLabel')}</FormLabel>
                    <FormControl>
                       <Input
                        type="number"
                        placeholder="e.g., 7.0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                        step="0.1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleReset}>{t('questionFilters.resetButton')}</Button>
                <Button type="submit">{t('admin.nascetCalculator.calculateButton')}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {stenosisResult !== null && (
        <div className="mt-8">
            <Card className="shadow-lg border-primary">
                <CardHeader>
                    <CardTitle>{t('admin.nascetCalculator.resultTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-center text-primary">{stenosisResult.toFixed(2)}%</p>
                    <p className="text-center text-muted-foreground mt-2">{t('admin.nascetCalculator.stenosisLabel')}</p>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground italic">{t('admin.nascetCalculator.example')}</p>
                </CardFooter>
            </Card>
            <NascetResultDetails stenosisResult={stenosisResult} />
        </div>
      )}

    </div>
  );
}
