'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRiskContext } from '@/context/use-risk-context';
import { downloadFile, exportToCSV, exportToJSON, importFromJSON } from '@/lib/exporters';
import { clearRiskRegister, createSampleRiskData, saveRiskRegister } from '@/lib/storage';
import { Database, Download, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function RegisterActions() {
  const { state, dispatch } = useRiskContext();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    if (state.register.length === 0) {
      toast.error('No hay riesgos para exportar');
      return;
    }

    const csvContent = exportToCSV(state.register);
    const filename = `registro_riesgos_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
    toast.success(`${state.register.length} riesgos exportados en CSV`);
    setIsExportDialogOpen(false);
  };

  const handleExportJSON = () => {
    if (state.register.length === 0) {
      toast.error('No hay riesgos para exportar');
      return;
    }

    const jsonContent = exportToJSON(state.register);
    const filename = `registro_riesgos_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
    toast.success(`${state.register.length} riesgos exportados en JSON`);
    setIsExportDialogOpen(false);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedRisks = importFromJSON(content);
        
        // Add imported risks to the register
        importedRisks.forEach(risk => {
          dispatch({ type: 'ADD_TO_REGISTER', payload: risk });
        });

        // Update localStorage
        const updatedRegister = [...state.register, ...importedRisks];
        saveRiskRegister(updatedRegister);

        toast.success(`${importedRisks.length} riesgos importados correctamente`);
        setIsImportDialogOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al importar archivo');
      }
    };
    reader.readAsText(file);
  };

  const handleClearRegister = () => {
    dispatch({ type: 'CLEAR_REGISTER' });
    clearRiskRegister();
    toast.success('Registro de riesgos limpiado');
  };

  const handleLoadSampleData = () => {
    const sampleRisks = createSampleRiskData();
    
    // Add sample risks to register
    sampleRisks.forEach(risk => {
      dispatch({ type: 'ADD_TO_REGISTER', payload: risk });
    });

    // Update localStorage
    const updatedRegister = [...state.register, ...sampleRisks];
    saveRiskRegister(updatedRegister);

    toast.success('Datos de demostración cargados');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Registro de Riesgos</DialogTitle>
            <DialogDescription>
              Descarga tu registro completo de riesgos en diferentes formatos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{state.register.length} Riesgos Registrados</p>
              <p className="text-sm text-muted-foreground">Listos para exportar</p>
            </div>

            <div className="grid gap-3">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleExportCSV}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Formato CSV
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Compatible con Excel, Google Sheets y otras herramientas de análisis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleExportJSON}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Formato JSON
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Incluye todos los datos estructurados para reimportación completa
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Riesgos</DialogTitle>
            <DialogDescription>
              Importa riesgos desde un archivo JSON previamente exportado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-import">Seleccionar Archivo JSON</Label>
              <Input
                ref={fileInputRef}
                id="file-import"
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Solo archivos JSON exportados desde esta aplicación
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded border">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Nota:</strong> Los riesgos importados se agregarán al registro actual. 
                No se eliminarán los riesgos existentes.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar registro completo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todos los {state.register.length} riesgos 
              del registro. Esta acción no se puede deshacer.
              <br /><br />
              <strong>Recomendación:</strong> Exporta tu registro antes de limpiarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearRegister}
              className="bg-red-600 hover:bg-red-700"
            >
              Limpiar Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {state.register.length === 0 && (
        <Button variant="outline" onClick={handleLoadSampleData}>
          <Database className="mr-2 h-4 w-4" />
          Datos Demo
        </Button>
      )}
    </div>
  );
}