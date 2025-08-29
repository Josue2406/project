'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function RegisterForm() {
  const [isOpen, setIsOpen] = useState(false);

  // For now, this is a placeholder for manual risk entry
  // In a full implementation, this would contain a form similar to the calculator forms
  // but for directly adding risks to the register without calculation

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Riesgo Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Riesgo Manualmente</DialogTitle>
          <DialogDescription>
            Agrega un riesgo directamente al registro sin usar la calculadora
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">
                Esta funcionalidad permitirá agregar riesgos manualmente al registro.
              </p>
              <p className="text-sm">
                Por el momento, utiliza la Calculadora de Riesgos para evaluar y 
                guardar riesgos en el registro.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="mt-4"
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}