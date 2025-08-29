/**
 * Quantitative risk assessment utilities
 * Implements SLE, ALE, and other quantitative methodologies
 */

export interface QuantitativeRiskInput {
  assetName: string;
  assetValue: number; // Monetary value
  threatDescription: string;
  exposureFactor: number; // 0-100 percentage of asset value at risk
  annualizedRateOfOccurrence: number; // Expected occurrences per year
  controlCost: number; // Annual cost of controls
  controlEffectiveness: number; // 0-100 percentage
  detectionCapability: number; // 1-5 scale
}

export interface QuantitativeRiskOutput {
  inherentSLE: number; // Single Loss Expectancy
  inherentALE: number; // Annualized Loss Expectancy  
  residualSLE: number;
  residualALE: number;
  controlROI: number; // Return on Investment
  costBenefit: number; // Net benefit of controls
  riskReduction: number; // Percentage reduction in ALE
  recommendedActions: string[];
  inherentRating: string;
  residualRating: string;
  inherentColor: string;
  residualColor: string;
}

/**
 * Calculate Single Loss Expectancy (SLE)
 * SLE = Asset Value × Exposure Factor
 */
export function calculateSLE(assetValue: number, exposureFactor: number): number {
  return assetValue * (exposureFactor / 100);
}

/**
 * Calculate Annualized Loss Expectancy (ALE)
 * ALE = SLE × Annual Rate of Occurrence
 */
export function calculateALE(sle: number, aro: number): number {
  return sle * aro;
}

/**
 * Calculate residual risk after controls
 */
export function calculateResidualQuantitativeRisk(
  inherentALE: number,
  controlEffectiveness: number,
  detectionCapability: number
): number {
  // Control effectiveness reduces ALE
  const controlReduction = controlEffectiveness / 100;
  
  // Detection capability provides additional reduction
  const detectionReduction = (detectionCapability - 1) / 4 * 0.15; // Max 15% additional
  
  // Combined reduction
  const totalReduction = Math.min(controlReduction + detectionReduction, 0.95);
  
  return inherentALE * (1 - totalReduction);
}

/**
 * Calculate Return on Investment for controls
 * ROI = (Risk Reduction - Control Cost) / Control Cost
 */
export function calculateControlROI(
  inherentALE: number,
  residualALE: number,
  controlCost: number
): number {
  const riskReduction = inherentALE - residualALE;
  const netBenefit = riskReduction - controlCost;
  
  if (controlCost === 0) return 0;
  return (netBenefit / controlCost) * 100;
}

/**
 * Complete quantitative risk assessment
 */
export function assessQuantitativeRisk(input: QuantitativeRiskInput): QuantitativeRiskOutput {
  // Calculate inherent risk
  const inherentSLE = calculateSLE(input.assetValue, input.exposureFactor);
  const inherentALE = calculateALE(inherentSLE, input.annualizedRateOfOccurrence);
  
  // Calculate residual risk
  const residualALE = calculateResidualQuantitativeRisk(
    inherentALE,
    input.controlEffectiveness,
    input.detectionCapability
  );
  const residualSLE = residualALE / Math.max(input.annualizedRateOfOccurrence, 0.01);
  
  // Calculate metrics
  const controlROI = calculateControlROI(inherentALE, residualALE, input.controlCost);
  const costBenefit = (inherentALE - residualALE) - input.controlCost;
  const riskReduction = ((inherentALE - residualALE) / inherentALE) * 100;
  
  // Get ratings and colors
  const inherentRating = getQuantitativeRiskRating(inherentALE);
  const residualRating = getQuantitativeRiskRating(residualALE);
  const inherentColor = getRiskColor(inherentRating);
  const residualColor = getRiskColor(residualRating);
  
  // Get recommendations
  const recommendedActions = getQuantitativeRecommendations(
    residualRating,
    controlROI,
    costBenefit
  );

  return {
    inherentSLE,
    inherentALE,
    residualSLE,
    residualALE,
    controlROI,
    costBenefit,
    riskReduction,
    recommendedActions,
    inherentRating,
    residualRating,
    inherentColor,
    residualColor,
  };
}

/**
 * Map ALE to risk rating based on organizational thresholds
 * These thresholds can be customized based on organization size and risk appetite
 */
function getQuantitativeRiskRating(ale: number): string {
  if (ale < 10000) return 'Bajo';
  if (ale < 50000) return 'Medio';  
  if (ale < 200000) return 'Alto';
  return 'Crítico';
}

/**
 * Map risk rating to color
 */
function getRiskColor(rating: string): string {
  switch (rating) {
    case 'Bajo': return 'green';
    case 'Medio': return 'yellow';
    case 'Alto': return 'orange';
    case 'Crítico': return 'red';
    default: return 'gray';
  }
}

/**
 * Generate recommendations based on quantitative analysis
 */
function getQuantitativeRecommendations(
  rating: string,
  controlROI: number,
  costBenefit: number
): string[] {
  const recommendations: string[] = [];
  
  // Risk level based recommendations
  switch (rating) {
    case 'Bajo':
      recommendations.push('Aceptar riesgo con monitoreo básico');
      recommendations.push('Revisar anualmente los controles actuales');
      break;
    case 'Medio':
      recommendations.push('Evaluar controles adicionales costo-efectivos');
      recommendations.push('Considerar transferencia mediante seguros');
      break;
    case 'Alto':
      recommendations.push('Implementar controles de mitigación prioritarios');
      recommendations.push('Evaluar urgentemente opciones de transferencia');
      break;
    case 'Crítico':
      recommendations.push('Acción inmediata requerida - riesgo inaceptable');
      recommendations.push('Implementar controles de emergencia');
      break;
  }
  
  // ROI based recommendations
  if (controlROI > 100) {
    recommendations.push('ROI excelente - implementar controles inmediatamente');
  } else if (controlROI > 50) {
    recommendations.push('ROI positivo - controles recomendados');
  } else if (controlROI > 0) {
    recommendations.push('ROI marginal - evaluar alternativas');
  } else {
    recommendations.push('ROI negativo - buscar opciones más costo-efectivas');
  }
  
  // Cost-benefit recommendations
  if (costBenefit > 0) {
    recommendations.push(`Beneficio neto positivo: $${costBenefit.toLocaleString()}`);
  } else {
    recommendations.push('Costo de controles excede beneficio esperado');
  }
  
  return recommendations;
}

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}