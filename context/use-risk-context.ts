'use client'

import { useContext } from 'react';
import { RiskContext } from './risk-context';

export function useRiskContext() {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRiskContext must be used within a RiskProvider');
  }
  return context;
}