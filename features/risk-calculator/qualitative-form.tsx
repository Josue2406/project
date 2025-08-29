'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Info } from 'lucide-react';
import { QualitativeRiskInput, assessQualitativeRisk, getLikelihoodDescription, getImpactDescription } from '@/lib/risk-qualitative';
import { useRiskContext } from '@/context/use-risk-context';
import { toast } from 'sonner';

const qualitativeSchema = z.object({
  assetName: z.string().min(1, 'El nombre del activo es obligatorio').max(100, 'Máximo 100 caracteres'),
  threatDescription: z.string().min(1, 'La descripción de la amenaza es obligatoria').max(500, 'Máximo 500 caracteres'),
  likelihood: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  impact: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  controlEffectiveness: z.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
  detectionCapability: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
});

type QualitativeFormData = z.infer<typeof qualitativeSchema>;

export function QualitativeForm() {
  const { dispatch } = useRiskContext();
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<QualitativeFormData>({
    resolver: zodResolver(qualitativeSchema),
    defaultValues: {
      assetName: '',
      threatDescription: '',
      likelihood: 3,
      impact: 3,
      controlEffectiveness: 50,
      detectionCapability: 3,
    },
  });

  const onSubmit = async (data: QualitativeFormData) => {
    setIsCalculating(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simulate calculation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const input: QualitativeRiskInput = data;
      const result = assessQualitativeRisk(input);

      dispatch({
        type: 'SET_RESULT',
        payload: {
          type: 'qualitative',
          input,
          ...result,
        },
      });

      toast.success('Evaluación cualitativa completada');
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Asset Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Activo *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ej. Servidor de Base de Datos"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Identifica el activo objeto de la evaluación
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="threatDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción de la Amenaza *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="ej. Ataque de malware dirigido"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe la amenaza específica a evaluar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Risk Factors */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Probabilidad
                <Badge variant="outline" className="text-xs">
                  {watchedValues.likelihood}/5
                </Badge>
              </CardTitle>
              <CardDescription>
                {getLikelihoodDescription(watchedValues.likelihood)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="likelihood"
                render={({ field }) => (
                  <FormItem>
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Muy Improbable</span>
                      <span>Muy Probable</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Impacto
                <Badge variant="outline" className="text-xs">
                  {watchedValues.impact}/5
                </Badge>
              </CardTitle>
              <CardDescription>
                {getImpactDescription(watchedValues.impact)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Insignificante</span>
                      <span>Catastrófico</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Control Effectiveness */}
        <div className="grid md:grid-cols-2 gap-6">
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
                  Porcentaje de reducción de riesgo por controles existentes
                </FormDescription>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Sin controles</span>
                  <span>Control total</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="detectionCapability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Capacidad de Detección
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
                  Capacidad de detectar y responder al incidente
                </FormDescription>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Muy limitada</span>
                  <span>Excelente</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preview */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              Vista Previa del Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Riesgo Inherente:</span>{' '}
                {watchedValues.likelihood} × {watchedValues.impact} = {watchedValues.likelihood * watchedValues.impact}
              </p>
              <p className="text-muted-foreground">
                El riesgo residual se calculará considerando la efectividad de controles ({watchedValues.controlEffectiveness}%) 
                y capacidad de detección ({watchedValues.detectionCapability}/5)
              </p>
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
              Calcular Riesgo Cualitativo
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}