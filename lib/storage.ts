/**
 * Local storage utilities for risk data persistence
 */

import { RiskEntry } from './risk-utils';

const STORAGE_KEYS = {
  RISK_REGISTER: 'risk-register:v1',
  USER_PREFERENCES: 'risk-calculator-preferences:v1',
} as const;

/**
 * Save risk register to localStorage
 */
export function saveRiskRegister(risks: RiskEntry[]): void {
  try {
    const serializedRisks = risks.map(risk => ({
      ...risk,
      createdAt: risk.createdAt.toISOString(),
      updatedAt: risk.updatedAt.toISOString(),
      reviewDate: risk.reviewDate.toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEYS.RISK_REGISTER, JSON.stringify(serializedRisks));
  } catch (error) {
    console.error('Error saving risk register to localStorage:', error);
    throw new Error('No se pudo guardar el registro de riesgos');
  }
}

/**
 * Load risk register from localStorage
 */
export function loadRiskRegister(): RiskEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RISK_REGISTER);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((risk: any) => ({
      ...risk,
      createdAt: new Date(risk.createdAt),
      updatedAt: new Date(risk.updatedAt),
      reviewDate: new Date(risk.reviewDate),
    }));
  } catch (error) {
    console.error('Error loading risk register from localStorage:', error);
    return [];
  }
}

/**
 * Clear risk register from localStorage
 */
export function clearRiskRegister(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RISK_REGISTER);
  } catch (error) {
    console.error('Error clearing risk register from localStorage:', error);
    throw new Error('No se pudo limpiar el registro de riesgos');
  }
}

/**
 * Save user preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultRiskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  exportFormat: 'csv' | 'json';
  autoSave: boolean;
}

export function saveUserPreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

export function loadUserPreferences(): UserPreferences | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
}

/**
 * Check localStorage availability
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { used: number; total: number; available: number } {
  if (!isStorageAvailable()) {
    return { used: 0, total: 0, available: 0 };
  }

  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Most browsers limit localStorage to 5MB
  const total = 5 * 1024 * 1024;
  const available = total - used;

  return { used, total, available };
}

/**
 * Create sample/demo risk data
 */
export function createSampleRiskData(): RiskEntry[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  return [
    {
      id: 'demo_001',
      name: 'Ataque de Phishing a Empleados',
      description: 'Riesgo de compromiso de credenciales mediante correos maliciosos',
      assetName: 'Sistema de Correo Corporativo',
      threatDescription: 'Atacantes externos enviando correos de phishing dirigidos',
      type: 'qualitative' as const,
      result: {
        inherentRisk: 12,
        residualRisk: 6,
        inherentRating: 'Alto',
        residualRating: 'Medio',
        inherentColor: 'orange',
        residualColor: 'yellow',
        riskReduction: 50,
        recommendedActions: ['Capacitación en seguridad', 'Filtros de correo avanzados']
      },
      input: {
        assetName: 'Sistema de Correo Corporativo',
        threatDescription: 'Atacantes externos enviando correos de phishing dirigidos',
        likelihood: 4,
        impact: 3,
        controlEffectiveness: 60,
        detectionCapability: 3
      },
      status: 'active' as const,
      owner: 'Equipo de Seguridad IT',
      reviewDate: futureDate,
      createdAt: now,
      updatedAt: now,
      notes: 'Riesgo identificado en auditoría de seguridad - Requiere capacitación urgente'
    },
    {
      id: 'demo_002', 
      name: 'Fallo del Sistema de Backup',
      description: 'Pérdida de datos por fallo en el sistema de respaldo',
      assetName: 'Base de Datos de Clientes',
      threatDescription: 'Fallo técnico en infraestructura de backup',
      type: 'quantitative' as const,
      result: {
        inherentSLE: 150000,
        inherentALE: 45000,
        residualSLE: 75000,
        residualALE: 22500,
        controlROI: 125,
        costBenefit: 12500,
        riskReduction: 50,
        recommendedActions: ['Implementar backup redundante', 'Monitoreo proactivo'],
        inherentRating: 'Medio',
        residualRating: 'Bajo',
        inherentColor: 'yellow',
        residualColor: 'green'
      },
      input: {
        assetName: 'Base de Datos de Clientes',
        assetValue: 500000,
        threatDescription: 'Fallo técnico en infraestructura de backup',
        exposureFactor: 30,
        annualizedRateOfOccurrence: 0.3,
        controlCost: 10000,
        controlEffectiveness: 70,
        detectionCapability: 4
      },
      status: 'mitigated' as const,
      owner: 'Administrador de Sistemas',
      reviewDate: futureDate,
      createdAt: now,
      updatedAt: now,
      notes: 'Controles implementados - Sistema de backup redundante operativo'
    }
  ];
}