'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useRiskContext } from '@/context/use-risk-context';
import { QuantitativeRiskInput, assessQuantitativeRisk, formatCurrency } from '@/lib/risk-quantitative';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Euro, Info } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const quantitativeSchema = z.object({
  assetName: z.string().min(1, 'El nombre del activo es obligatorio'),
  assetValue: z.number().min(1, 'El valor del activo debe ser mayor a 0'),
  threatDescription: z.string().min(1, 'La descripción de la amenaza es obligatoria'),
  exposureFactor: z.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
  annualizedRateOfOccurrence: z.number().min(0.01, 'Mínimo 0.01').max(10, 'Máximo 10 ocurrencias/año'),
  controlCost: z.number().min(0, 'El costo no puede ser negativo'),
  controlEffectiveness: z.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
  detectionCapability: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
});

type QuantitativeFormData = z.infer<typeof quantitativeSchema>;

export function QuantitativeForm() {
  const { dispatch } = useRiskContext();
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<QuantitativeFormData>({
    resolver: zodResolver(quantitativeSchema),
    defaultValues: {
      assetName: '',
      assetValue: 100000,
      threatDescription: '',
      exposureFactor: 30,
      annualizedRateOfOccurrence: 0.5,
      controlCost: 5000,
      controlEffectiveness: 60,
      detectionCapability: 3,
    },
  });

  const onSubmit = async (data: QuantitativeFormData) => {
    setIsCalculating(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const input: QuantitativeRiskInput = data;
      const result = assessQuantitativeRisk(input);

      dispatch({
        type: 'SET_RESULT',
        payload: {
          type: 'quantitative',
          input,
          ...result,
        },
      });

      toast.success('Evaluación cuantitativa completada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en la evaluación';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(`Error: ${message}`);
    } finally {
      setIsCalculating(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const watchedValues = form.watch();
  const previewSLE = watchedValues.assetValue * (watchedValues.exposureFactor / 100);
  const previewALE = previewSLE * watchedValues.annualizedRateOfOccurrence;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Activo *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ej. Sistema de Facturación"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assetValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor del Activo (€) *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="100000"
                      className="pl-9"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Valor monetario del activo (reemplazo, ingresos, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="threatDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción de la Amenaza *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="ej. Ransomware que cifra datos críticos del sistema"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="exposureFactor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Factor de Exposición
                  <Badge variant="outline" className="text-xs">
                    {field.value}%
                  </Badge>
                </FormLabel>
                <FormControl>
                  <div className="px-2">
                    <Slider
                      min={1}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Porcentaje del valor del activo que se perdería en un incidente
                </FormDescription>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Pérdida mínima</span>
                  <span>Pérdida total</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="annualizedRateOfOccurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frecuencia Anual (ARO)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Número esperado de ocurrencias por año (ej. 0.5 = cada 2 años)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="controlCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo Anual de Controles (€)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="5000"
                      className="pl-9"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Costo anual de implementar y mantener controles
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="controlEffectiveness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Efectividad de Controles
                  <Badge variant="outline" className="text-xs">
                    {field.value}%
                  </Badge>
                </FormLabel>
                <FormControl>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Porcentaje de reducción del riesgo por los controles
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="detectionCapability"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Capacidad de Detección y Respuesta
                <Badge variant="outline" className="text-xs">
                  {field.value}/5
                </Badge>
              </FormLabel>
              <FormControl>
                <div className="px-2">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Capacidad organizacional para detectar y responder a incidentes
              </FormDescription>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Muy limitada</span>
                <span>Excelente</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              Vista Previa del Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>SLE (Pérdida por Incidente):</span>
                <span className="font-medium">{formatCurrency(previewSLE)}</span>
              </div>
              <div className="flex justify-between">
                <span>ALE Inherente (Pérdida Anual):</span>
                <span className="font-medium">{formatCurrency(previewALE)}</span>
              </div>
              <div className="text-muted-foreground pt-2 border-t">
                <p>
                  Los valores residuales y métricas de ROI se calcularán considerando
                  la efectividad de controles y capacidad de detección.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isCalculating}
          size="lg"
        >
          {isCalculating ? (
            <>Calculando...</>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Riesgo Cuantitativo
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}