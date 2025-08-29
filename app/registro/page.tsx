'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


import { Navbar } from '@/components/nav';
import { useRiskContext } from '@/context/use-risk-context';
import {
  RegisterActions,
  RegisterForm,
  RegisterTable
} from '@/features/risk-register';
import { loadRiskRegister } from '@/lib/storage';
import { useEffect } from 'react';

export default function RegistroPage() {
  const { dispatch } = useRiskContext();

  useEffect(() => {
    // Load saved risk register on component mount
    const savedRegister = loadRiskRegister();
    if (savedRegister.length > 0) {
      dispatch({
        type: 'LOAD_REGISTER',
        payload: savedRegister
      });
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Registro de Riesgos</h1>
            <p className="text-muted-foreground">
              Gestiona tu inventario completo de riesgos identificados
            </p>
          </div>
          <RegisterActions />
        </div>

        <div className="space-y-6">
          <RegisterForm />
          <RegisterTable />
        </div>
      </main>
    </div>
  );
}