'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingDown, TrendingUp, Save, Download, Euro } from 'lucide-react';
import { useRiskContext } from '@/context/use-risk-context';
import { getRiskColorClasses, generateId, formatDate } from '@/lib/risk-utils';
import { formatCurrency, formatPercentage } from '@/lib/risk-quantitative';
import { saveRiskRegister, loadRiskRegister } from '@/lib/storage';
import { exportToCSV, exportToJSON, downloadFile } from '@/lib/exporters';
import { toast } from 'sonner';

export function ResultsPanel() {
  const { state, dispatch } = useRiskContext();
  const { currentResult } = state;

  if (!currentResult) return null;

  const handleSaveToRegister = () => {
    if (!currentResult) return;

    const newEntry = {
      id: generateId(),
      name: `Evaluación ${currentResult.type === 'qualitative' ? 'Cualitativa' : 'Cuantitativa'}`,
      description: currentResult.input.threatDescription,
      assetName: currentResult.input.assetName,
      threatDescription: currentResult.input.threatDescription,
      type: currentResult.type,
      result: currentResult,
      input: currentResult.input,
      status: 'active' as const,
      owner: 'Usuario Actual',
      reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to context
    dispatch({ type: 'ADD_TO_REGISTER', payload: newEntry });

    // Save to localStorage
    const currentRegister = loadRiskRegister();
    const updatedRegister = [...currentRegister, newEntry];
    saveRiskRegister(updatedRegister);

    toast.success('Riesgo guardado en el registro');
  };

  const handleExportCSV = () => {
    if (!currentResult) return;
    
    const tempEntry = {
      id: 'temp_export',
      name: 'Evaluación Actual',
      description: currentResult.input.threatDescription,
      assetName: currentResult.input.assetName,
      threatDescription: currentResult.input.threatDescription,
      type: currentResult.type,
      result: currentResult,
      input: currentResult.input,
      status: 'active' as const,
      owner: 'Usuario Actual',
      reviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const csvContent = exportToCSV([tempEntry]);
    const filename = `riesgo_${currentResult.input.assetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
    toast.success('Evaluación exportada en CSV');
  };

  const handleExportJSON = () => {
    if (!currentResult) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      type: currentResult.type,
      input: currentResult.input,
      result: currentResult,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = `riesgo_${currentResult.input.assetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
    toast.success('Evaluación exportada en JSON');
  };

  const isQualitative = currentResult.type === 'qualitative';

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Resultados de la Evaluación
          </CardTitle>
          <CardDescription>
            Análisis {isQualitative ? 'cualitativo' : 'cuantitativo'} de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Asset Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información del Activo</h4>
            <p className="text-sm"><span className="font-medium">Activo:</span> {currentResult.input.assetName}</p>
            <p className="text-sm"><span className="font-medium">Amenaza:</span> {currentResult.input.threatDescription}</p>
          </div>

          {/* Risk Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  Riesgo Inherente
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {isQualitative ? 
                        currentResult.inherentRisk : 
                        formatCurrency(currentResult.inherentALE)
                      }
                    </span>
                    <Badge className={getRiskColorClasses(currentResult.inherentColor)}>
                      {currentResult.inherentRating}
                    </Badge>
                  </div>
                  
                  {!isQualitative && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>SLE: {formatCurrency((currentResult as any).inherentSLE)}</p>
                      <p>ALE: {formatCurrency((currentResult as any).inherentALE)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  Riesgo Residual
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {isQualitative ? 
                        currentResult.residualRisk.toFixed(1) : 
                        formatCurrency(currentResult.residualALE)
                      }
                    </span>
                    <Badge className={getRiskColorClasses(currentResult.residualColor)}>
                      {currentResult.residualRating}
                    </Badge>
                  </div>
                  
                  {!isQualitative && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>SLE: {formatCurrency((currentResult as any).residualSLE)}</p>
                      <p>ALE: {formatCurrency((currentResult as any).residualALE)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Reduction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Reducción de Riesgo</span>
              <span className="text-lg font-bold text-green-600">
                {formatPercentage(currentResult.riskReduction)}
              </span>
            </div>
            <Progress value={currentResult.riskReduction} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Los controles implementados reducen el riesgo en un {formatPercentage(currentResult.riskReduction)}
            </p>
          </div>

          {/* Quantitative specific metrics */}
          {!isQualitative && (
            <>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    <span className="font-medium">ROI de Controles</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage((currentResult as any).controlROI)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Retorno sobre la inversión en controles
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Beneficio Neto</span>
                  </div>
                  <p className={`text-2xl font-bold ${(currentResult as any).costBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency((currentResult as any).costBenefit)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Beneficio anual neto de los controles
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Recomendadas</CardTitle>
          <CardDescription>
            Basadas en el nivel de riesgo residual y mejores prácticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {currentResult.recommendedActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSaveToRegister} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Guardar en Registro
        </Button>
        
        <div className="flex gap-2 flex-1">
          <Button variant="outline" onClick={handleExportCSV} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>
    </div>
  );
}