'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRiskContext } from '@/context/use-risk-context';
import { generateHeatmapData, getRiskColorClasses } from '@/lib/risk-utils';
import { QualitativeRiskInput } from '@/lib/risk-qualitative';

const impactLabels = ['Insignif.', 'Menor', 'Moderado', 'Mayor', 'Catastr.'];
const likelihoodLabels = ['Muy Prob.', 'Probable', 'Posible', 'Improb.', 'Muy Impr.'];

export function Heatmap() {
  const { state } = useRiskContext();
  const { currentResult } = state;

  if (!currentResult || currentResult.type !== 'qualitative') {
    return null;
  }

  const input = currentResult.input as QualitativeRiskInput;
  const heatmapData = generateHeatmapData(state.register);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor de Riesgo (5×5)</CardTitle>
        <CardDescription>
          Matriz de Probabilidad × Impacto - Tu evaluación actual marcada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Bajo (1-5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs">Medio (6-10)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-xs">Alto (11-15)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Crítico (16-25)</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Header with Impact labels */}
              <div className="grid grid-cols-6 gap-1 mb-2">
                <div></div>
                {impactLabels.map((label, index) => (
                  <div key={index} className="text-xs text-center font-medium p-2">
                    {label}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {heatmapData.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-6 gap-1 mb-1">
                  {/* Likelihood label */}
                  <div className="text-xs text-right font-medium p-2 flex items-center justify-end">
                    {likelihoodLabels[rowIndex]}
                  </div>
                  
                  {/* Risk cells */}
                  {row.map((cell, cellIndex) => {
                    const isCurrentRisk = cell.likelihood === input.likelihood && cell.impact === input.impact;
                    const bgColor = getCellBackgroundColor(cell.color);
                    
                    return (
                      <TooltipProvider key={cellIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`
                                relative aspect-square border-2 rounded cursor-pointer transition-all duration-200
                                ${bgColor}
                                ${isCurrentRisk ? 
                                  'border-primary border-4 shadow-lg ring-2 ring-primary/50' : 
                                  'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }
                              `}
                              role="gridcell"
                              aria-label={`Probabilidad ${cell.likelihood}, Impacto ${cell.impact}, Riesgo ${cell.rating}`}
                              tabIndex={0}
                            >
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                                <span className="text-xs font-bold text-white drop-shadow-sm">
                                  {cell.riskScore}
                                </span>
                                {cell.count && (
                                  <Badge variant="secondary" className="text-xs scale-75">
                                    {cell.count}
                                  </Badge>
                                )}
                              </div>
                              
                              {isCurrentRisk && (
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p><strong>Probabilidad:</strong> {cell.likelihood}/5</p>
                              <p><strong>Impacto:</strong> {cell.impact}/5</p>
                              <p><strong>Riesgo:</strong> {cell.riskScore} ({cell.rating})</p>
                              {cell.count && <p><strong>Riesgos registrados:</strong> {cell.count}</p>}
                              {isCurrentRisk && <p className="text-primary font-medium">★ Tu evaluación actual</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}

              {/* Axis labels */}
              <div className="grid grid-cols-6 gap-1 mt-4">
                <div></div>
                <div className="col-span-5 text-center text-sm font-medium text-muted-foreground">
                  Impacto →
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 -rotate-90 text-sm font-medium text-muted-foreground">
                Probabilidad →
              </div>
            </div>
          </div>

          {/* Current Risk Summary */}
          <div className="bg-muted/50 p-4 rounded-lg mt-6">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              Tu Evaluación Actual
              <Badge className={getRiskColorClasses(currentResult.residualColor)}>
                {currentResult.residualRating}
              </Badge>
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">Probabilidad:</span> {input.likelihood}/5</p>
                <p><span className="font-medium">Impacto:</span> {input.impact}/5</p>
              </div>
              <div>
                <p><span className="font-medium">Riesgo Inherente:</span> {currentResult.inherentRisk}</p>
                <p><span className="font-medium">Riesgo Residual:</span> {currentResult.residualRisk.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getCellBackgroundColor(color: string): string {
  switch (color) {
    case 'green':
      return 'bg-green-500 hover:bg-green-600';
    case 'yellow':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'orange':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'red':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}