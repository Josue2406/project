

import { QualitativeRiskInput, QualitativeRiskOutput } from './risk-qualitative';
import { QuantitativeRiskInput, QuantitativeRiskOutput } from './risk-quantitative';

export type RiskResult = 
  | (QualitativeRiskOutput & { type: 'qualitative'; input: QualitativeRiskInput })
  | (QuantitativeRiskOutput & { type: 'quantitative'; input: QuantitativeRiskInput });

export interface RiskEntry {
  id: string;
  name: string;
  description: string;
  assetName: string;
  threatDescription: string;
  type: 'qualitative' | 'quantitative';
  result: QualitativeRiskOutput | QuantitativeRiskOutput;
  input: QualitativeRiskInput | QuantitativeRiskInput;
  status: 'active' | 'mitigated' | 'accepted' | 'transferred';
  owner: string;
  reviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}


export interface CVSSMapping {
  score: number;
  severity: string;
  description: string;
  impactMultiplier: number;
}

export const CVSSMappings: CVSSMapping[] = [
  {
    score: 0.1,
    severity: 'Informativo',
    description: 'Sin impacto directo en seguridad',
    impactMultiplier: 0.2,
  },
  {
    score: 3.9,
    severity: 'Baja',
    description: 'Impacto mínimo en operaciones',
    impactMultiplier: 0.6,
  },
  {
    score: 6.9,
    severity: 'Media', 
    description: 'Impacto moderado en operaciones',
    impactMultiplier: 1.0,
  },
  {
    score: 8.9,
    severity: 'Alta',
    description: 'Impacto significativo en operaciones',
    impactMultiplier: 1.5,
  },
  {
    score: 10.0,
    severity: 'Crítica',
    description: 'Impacto severo o completo',
    impactMultiplier: 2.0,
  },
];


export function getCVSSMapping(score: number): CVSSMapping {
  const mapping = CVSSMappings.find(m => score <= m.score);
  return mapping || CVSSMappings[CVSSMappings.length - 1];
}

export interface HeatmapCell {
  likelihood: number;
  impact: number;
  riskScore: number;
  rating: string;
  color: string;
  count?: number; // For displaying multiple risks in same cell
}


export function generateHeatmapData(risks: RiskEntry[] = []): HeatmapCell[][] {
  const matrix: HeatmapCell[][] = [];
  
  // Initialize 5x5 matrix (likelihood x impact)
  for (let likelihood = 5; likelihood >= 1; likelihood--) {
    const row: HeatmapCell[] = [];
    for (let impact = 1; impact <= 5; impact++) {
      const riskScore = likelihood * impact;
      const rating = getRiskRating(riskScore);
      const color = getRiskColor(rating);
      
      // Count risks in this cell
      const count = risks.filter(risk => {
        if (risk.type === 'qualitative') {
          const input = risk.input as QualitativeRiskInput;
          return input.likelihood === likelihood && input.impact === impact;
        }
        return false;
      }).length;
      
      row.push({
        likelihood,
        impact,
        riskScore,
        rating,
        color,
        count: count > 0 ? count : undefined,
      });
    }
    matrix.push(row);
  }
  
  return matrix;
}


export function getRiskRating(riskScore: number): string {
  if (riskScore <= 5) return 'Bajo';
  if (riskScore <= 10) return 'Medio';
  if (riskScore <= 15) return 'Alto';
  return 'Crítico';
}


export function getRiskColor(rating: string): string {
  switch (rating) {
    case 'Bajo': return 'green';
    case 'Medio': return 'yellow';
    case 'Alto': return 'orange';
    case 'Crítico': return 'red';
    default: return 'gray';
  }
}


export function getRiskColorClasses(color: string, variant: 'badge' | 'bg' | 'border' | 'text' = 'badge') {
  const colorMap = {
    green: {
      badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
      bg: 'bg-green-500',
      border: 'border-green-500',
      text: 'text-green-600',
    },
    yellow: {
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
      bg: 'bg-yellow-500',
      border: 'border-yellow-500', 
      text: 'text-yellow-600',
    },
    orange: {
      badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200',
      bg: 'bg-orange-500',
      border: 'border-orange-500',
      text: 'text-orange-600',
    },
    red: {
      badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
      bg: 'bg-red-500',
      border: 'border-red-500',
      text: 'text-red-600',
    },
    gray: {
      badge: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200',
      bg: 'bg-gray-500',
      border: 'border-gray-500',
      text: 'text-gray-600',
    },
  };
  
  return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.gray[variant];
}

export function generateId(): string {
  return `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
  }).format(date);
}


export function getDaysUntilReview(reviewDate: Date): number {
  const today = new Date();
  const diffTime = reviewDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'red';
    case 'mitigated': return 'green';
    case 'accepted': return 'yellow';
    case 'transferred': return 'blue';
    default: return 'gray';
  }
}


export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Activo';
    case 'mitigated': return 'Mitigado';
    case 'accepted': return 'Aceptado';
    case 'transferred': return 'Transferido';
    default: return 'Desconocido';
  }
}