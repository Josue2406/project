'use client';

import React, { createContext, useReducer, ReactNode } from 'react';
import { RiskEntry, RiskResult } from '@/lib/risk-utils';

export interface RiskState {
  register: RiskEntry[];
  currentResult: RiskResult | null;
  isLoading: boolean;
  error: string | null;
}

export type RiskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULT'; payload: RiskResult }
  | { type: 'CLEAR_RESULT' }
  | { type: 'ADD_TO_REGISTER'; payload: RiskEntry }
  | { type: 'UPDATE_REGISTER_ENTRY'; payload: { id: string; entry: Partial<RiskEntry> } }
  | { type: 'DELETE_REGISTER_ENTRY'; payload: string }
  | { type: 'LOAD_REGISTER'; payload: RiskEntry[] }
  | { type: 'CLEAR_REGISTER' };

const initialState: RiskState = {
  register: [],
  currentResult: null,
  isLoading: false,
  error: null,
};

function riskReducer(state: RiskState, action: RiskAction): RiskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'SET_RESULT':
      return { ...state, currentResult: action.payload, error: null };
      
    case 'CLEAR_RESULT':
      return { ...state, currentResult: null };
      
    case 'ADD_TO_REGISTER':
      return {
        ...state,
        register: [...state.register, action.payload]
      };
      
    case 'UPDATE_REGISTER_ENTRY':
      return {
        ...state,
        register: state.register.map(entry =>
          entry.id === action.payload.id
            ? { ...entry, ...action.payload.entry, updatedAt: new Date() }
            : entry
        )
      };
      
    case 'DELETE_REGISTER_ENTRY':
      return {
        ...state,
        register: state.register.filter(entry => entry.id !== action.payload)
      };
      
    case 'LOAD_REGISTER':
      return { ...state, register: action.payload };
      
    case 'CLEAR_REGISTER':
      return { ...state, register: [] };
      
    default:
      return state;
  }
}

export const RiskContext = createContext<{
  state: RiskState;
  dispatch: React.Dispatch<RiskAction>;
} | null>(null);

export function RiskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(riskReducer, initialState);

  return (
    <RiskContext.Provider value={{ state, dispatch }}>
      {children}
    </RiskContext.Provider>
  );
}