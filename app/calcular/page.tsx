'use client';

import { Navbar } from '@/components/nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRiskContext } from '@/context/use-risk-context';
import { Heatmap, QualitativeForm, QuantitativeForm, ResultsPanel } from '@/features/risk-calculator';
import { useState } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CalculatePage() {
  const { state } = useRiskContext();
  const [activeTab, setActiveTab] = useState<'cualitativo' | 'cuantitativo'>('cualitativo');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calculadora de Riesgos</h1>
          <p className="text-muted-foreground">
            Evalúa riesgos utilizando metodologías cualitativas y cuantitativas
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'cualitativo' | 'cuantitativo')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cualitativo">Análisis Cualitativo</TabsTrigger>
                <TabsTrigger value="cuantitativo">Análisis Cuantitativo</TabsTrigger>
              </TabsList>

              <TabsContent value="cualitativo">
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluación Cualitativa</CardTitle>
                    <CardDescription>
                      Evalúa el riesgo basado en escalas de probabilidad e impacto (1-5)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QualitativeForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cuantitativo">
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluación Cuantitativa</CardTitle>
                    <CardDescription>
                      Calcula el riesgo en términos monetarios usando SLE, ALE y otras métricas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuantitativeForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {state.currentResult && (
              <>
                <ResultsPanel />
                {activeTab === 'cualitativo' && state.currentResult.type === 'qualitative' && (
                  <Heatmap />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
