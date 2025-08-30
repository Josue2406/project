'use client';

import { QualitativeRiskOutput } from './risk-qualitative';
import { QuantitativeRiskOutput } from './risk-quantitative';
import { RiskEntry } from './risk-utils';


export function exportToCSV(risks: RiskEntry[]): string {
  const headers = [
    'ID',
    'Nombre',
    'Descripción',
    'Activo',
    'Amenaza',
    'Tipo',
    'Estado',
    'Propietario',
    'Riesgo Inherente',
    'Riesgo Residual',
    'Calificación Inherente',
    'Calificación Residual',
    'Reducción %',
    'Fecha Creación',
    'Fecha Revisión',
    'Notas'
  ];

  const rows = risks.map(risk => {
    const inherentValue = getInherentValue(risk);
    const residualValue = getResidualValue(risk);
    const inherentRating = getInherentRating(risk);
    const residualRating = getResidualRating(risk);
    const reduction = getReductionPercentage(risk);

    return [
      risk.id,
      risk.name,
      risk.description,
      risk.assetName,
      risk.threatDescription,
      risk.type === 'qualitative' ? 'Cualitativo' : 'Cuantitativo',
      getSpanishStatus(risk.status),
      risk.owner,
      inherentValue,
      residualValue,
      inherentRating,
      residualRating,
      `${reduction}%`,
      risk.createdAt.toLocaleDateString('es-ES'),
      risk.reviewDate.toLocaleDateString('es-ES'),
      risk.notes || ''
    ];
  });

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}


export function exportToJSON(risks: RiskEntry[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalRisks: risks.length,
    risks: risks.map(risk => ({
      ...risk,
      createdAt: risk.createdAt.toISOString(),
      updatedAt: risk.updatedAt.toISOString(),
      reviewDate: risk.reviewDate.toISOString(),
    }))
  };

  return JSON.stringify(exportData, null, 2);
}


export function importFromJSON(jsonString: string): RiskEntry[] {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.risks || !Array.isArray(data.risks)) {
      throw new Error('Formato JSON inválido: se esperaba un array de riesgos');
    }

    return data.risks.map((risk: any) => ({
      ...risk,
      createdAt: new Date(risk.createdAt),
      updatedAt: new Date(risk.updatedAt),
      reviewDate: new Date(risk.reviewDate),
    }));
  } catch (error) {
    throw new Error(`Error al importar JSON: ${error instanceof Error ? error.message : 'Formato inválido'}`);
  }
}


export function downloadFile(content: string, filename: string, contentType: string = 'text/plain'): void {
  // Only run in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('downloadFile called in non-browser environment');
    return;
  }

  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}


function getInherentValue(risk: RiskEntry): string {
  if (risk.type === 'qualitative') {
    const result = risk.result as QualitativeRiskOutput;
    return result.inherentRisk.toString();
  } else {
    const result = risk.result as QuantitativeRiskOutput;
    return formatCurrency(result.inherentALE);
  }
}

function getResidualValue(risk: RiskEntry): string {
  if (risk.type === 'qualitative') {
    const result = risk.result as QualitativeRiskOutput;
    return result.residualRisk.toString();
  } else {
    const result = risk.result as QuantitativeRiskOutput;
    return formatCurrency(result.residualALE);
  }
}

function getInherentRating(risk: RiskEntry): string {
  const result = risk.result as QualitativeRiskOutput | QuantitativeRiskOutput;
  return result.inherentRating;
}

function getResidualRating(risk: RiskEntry): string {
  const result = risk.result as QualitativeRiskOutput | QuantitativeRiskOutput;
  return result.residualRating;
}

function getReductionPercentage(risk: RiskEntry): string {
  const result = risk.result as QualitativeRiskOutput | QuantitativeRiskOutput;
  return result.riskReduction.toFixed(1);
}

function getSpanishStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'active': 'Activo',
    'mitigated': 'Mitigado',
    'accepted': 'Aceptado',
    'transferred': 'Transferido'
  };
  return statusMap[status] || status;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}