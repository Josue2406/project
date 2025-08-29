/**
 * Qualitative risk assessment utilities
 * Implements likelihood x impact methodology aligned with ISO 27005
 */

export interface QualitativeRiskInput {
  assetName: string;
  threatDescription: string;
  likelihood: number; // 1-5 scale
  impact: number; // 1-5 scale
  controlEffectiveness: number; // 0-100 percentage
  detectionCapability: number; // 1-5 scale
}

export interface QualitativeRiskOutput {
  inherentRisk: number;
  residualRisk: number;
  inherentRating: string;
  residualRating: string;
  inherentColor: string;
  residualColor: string;
  riskReduction: number;
  recommendedActions: string[];
}

/**
 * Calculate inherent risk score (before controls)
 */
export function calculateInherentRisk(likelihood: number, impact: number): number {
  return likelihood * impact;
}

/**
 * Calculate residual risk score (after controls)
 * Considers control effectiveness and detection capability
 */
export function calculateResidualRisk(
  inherentRisk: number,
  controlEffectiveness: number,
  detectionCapability: number
): number {
  // Control effectiveness reduces risk (0-100%)
  const controlReduction = controlEffectiveness / 100;
  
  // Detection capability provides additional reduction (1-5 scale normalized)
  const detectionReduction = (detectionCapability - 1) / 4 * 0.2; // Max 20% additional reduction
  
  // Combined reduction factor
  const totalReduction = Math.min(controlReduction + detectionReduction, 0.95); // Max 95% reduction
  
  return Math.max(inherentRisk * (1 - totalReduction), 1); // Minimum risk score of 1
}

/**
 * Complete qualitative risk assessment
 */
export function assessQualitativeRisk(input: QualitativeRiskInput): QualitativeRiskOutput {
  const inherentRisk = calculateInherentRisk(input.likelihood, input.impact);
  const residualRisk = calculateResidualRisk(
    inherentRisk,
    input.controlEffectiveness,
    input.detectionCapability
  );

  const inherentRating = getRiskRating(inherentRisk);
  const residualRating = getRiskRating(residualRisk);
  
  const inherentColor = getRiskColor(inherentRating);
  const residualColor = getRiskColor(residualRating);
  
  const riskReduction = ((inherentRisk - residualRisk) / inherentRisk) * 100;
  
  const recommendedActions = getRecommendedActions(residualRating, residualRisk);

  return {
    inherentRisk,
    residualRisk,
    inherentRating,
    residualRating,
    inherentColor,
    residualColor,
    riskReduction,
    recommendedActions,
  };
}

/**
 * Map numeric risk score to rating
 */
function getRiskRating(riskScore: number): string {
  if (riskScore <= 5) return 'Bajo';
  if (riskScore <= 10) return 'Medio';
  if (riskScore <= 15) return 'Alto';
  return 'Crítico';
}

/**
 * Map risk rating to color class
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
 * Generate recommended actions based on risk level
 * Aligned with ISO 27005 risk treatment options
 */
function getRecommendedActions(rating: string, score: number): string[] {
  switch (rating) {
    case 'Bajo':
      return [
        'Aceptar el riesgo con monitoreo periódico',
        'Mantener controles actuales',
        'Revisar anualmente'
      ];
    case 'Medio':
      return [
        'Mitigar mediante controles adicionales',
        'Evaluar costo-beneficio de tratamiento',
        'Monitorear trimestralmente',
        'Considerar transferencia si es aplicable'
      ];
    case 'Alto':
      return [
        'Mitigar urgentemente',
        'Implementar controles compensatorios',
        'Evaluar transferencia del riesgo',
        'Monitorear mensualmente',
        'Revisar efectividad de controles'
      ];
    case 'Crítico':
      return [
        'Acción inmediata requerida',
        'Implementar controles de emergencia',
        'Considerar evitar la actividad',
        'Transferir el riesgo si es posible',
        'Monitoreo continuo hasta mitigación',
        'Escalamiento a alta dirección'
      ];
    default:
      return ['Evaluar riesgo apropiadamente'];
  }
}

/**
 * Get likelihood description
 */
export function getLikelihoodDescription(level: number): string {
  const descriptions = [
    '', // 0 is not used
    'Muy Improbable',
    'Improbable', 
    'Posible',
    'Probable',
    'Muy Probable'
  ];
  return descriptions[level] || 'No definido';
}

/**
 * Get impact description  
 */
export function getImpactDescription(level: number): string {
  const descriptions = [
    '', // 0 is not used
    'Insignificante',
    'Menor',
    'Moderado', 
    'Mayor',
    'Catastrófico'
  ];
  return descriptions[level] || 'No definido';
}