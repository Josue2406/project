'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { useRiskContext } from '@/context/use-risk-context';
import { RiskEntry, getRiskColorClasses, getStatusLabel, getStatusColor, formatDate, getDaysUntilReview } from '@/lib/risk-utils';
import { formatCurrency } from '@/lib/risk-quantitative';
import { saveRiskRegister } from '@/lib/storage';
import { toast } from 'sonner';

export function RegisterTable() {
  const { state, dispatch } = useRiskContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<RiskEntry | null>(null);

  const filteredRisks = state.register.filter(risk => {
    const matchesSearch = risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.threatDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    const matchesType = typeFilter === 'all' || risk.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteRisk = (riskId: string) => {
    dispatch({ type: 'DELETE_REGISTER_ENTRY', payload: riskId });
    
    // Update localStorage
    const updatedRegister = state.register.filter(r => r.id !== riskId);
    saveRiskRegister(updatedRegister);
    
    toast.success('Riesgo eliminado del registro');
  };

  const handleUpdateStatus = (riskId: string, newStatus: string) => {
    dispatch({ 
      type: 'UPDATE_REGISTER_ENTRY', 
      payload: { 
        id: riskId, 
        entry: { status: newStatus as any } 
      } 
    });
    
    // Update localStorage  
    const updatedRegister = state.register.map(r => 
      r.id === riskId ? { ...r, status: newStatus as any, updatedAt: new Date() } : r
    );
    saveRiskRegister(updatedRegister);
    
    toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`);
  };

  const getRiskValue = (risk: RiskEntry): string => {
    if (risk.type === 'qualitative') {
      return risk.result.residualRisk.toFixed(1);
    } else {
      return formatCurrency((risk.result as any).residualALE);
    }
  };

  if (state.register.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="text-muted-foreground">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay riesgos registrados</h3>
            <p className="text-sm">
              Comienza evaluando riesgos en la sección de cálculo para verlos aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, activo o amenaza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="mitigated">Mitigado</SelectItem>
                <SelectItem value="accepted">Aceptado</SelectItem>
                <SelectItem value="transferred">Transferido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="qualitative">Cualitativo</SelectItem>
                <SelectItem value="quantitative">Cuantitativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredRisks.length} de {state.register.length} riesgos registrados
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Riesgos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Riesgo Residual</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Revisión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.map((risk) => {
                  const daysUntilReview = getDaysUntilReview(risk.reviewDate);
                  const isOverdue = daysUntilReview < 0;
                  
                  return (
                    <TableRow key={risk.id} className="group">
                      <TableCell className="font-medium">
                        {risk.name}
                        {risk.notes && (
                          <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {risk.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{risk.assetName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {risk.type === 'qualitative' ? 'Cualitativo' : 'Cuantitativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={risk.status}
                          onValueChange={(value) => handleUpdateStatus(risk.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <Badge className={getRiskColorClasses(getStatusColor(risk.status))}>
                              {getStatusLabel(risk.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="mitigated">Mitigado</SelectItem>
                            <SelectItem value="accepted">Aceptado</SelectItem>
                            <SelectItem value="transferred">Transferido</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-mono">
                        {getRiskValue(risk)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColorClasses(risk.result.residualColor)}>
                          {risk.result.residualRating}
                        </Badge>
                      </TableCell>
                      <TableCell>{risk.owner}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                            {formatDate(risk.reviewDate)}
                          </span>
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-600">
                            Vencida ({Math.abs(daysUntilReview)} días)
                          </div>
                        )}
                        {!isOverdue && daysUntilReview <= 30 && (
                          <div className="text-xs text-orange-600">
                            {daysUntilReview} días restantes
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedRisk(risk)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver detalles</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{risk.name}</DialogTitle>
                                <DialogDescription>
                                  Detalles completos de la evaluación de riesgo
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRisk && (
                                <RiskDetails risk={selectedRisk} />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar riesgo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El riesgo "{risk.name}" 
                                  será eliminado permanentemente del registro.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteRisk(risk.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskDetails({ risk }: { risk: RiskEntry }) {
  const isQualitative = risk.type === 'qualitative';
  
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Información General</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Activo:</span> {risk.assetName}</p>
            <p><span className="font-medium">Propietario:</span> {risk.owner}</p>
            <p><span className="font-medium">Tipo:</span> {isQualitative ? 'Cualitativo' : 'Cuantitativo'}</p>
            <p><span className="font-medium">Estado:</span> 
              <Badge className={`ml-2 ${getRiskColorClasses(getStatusColor(risk.status))}`}>
                {getStatusLabel(risk.status)}
              </Badge>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Fechas</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Creado:</span> {formatDate(risk.createdAt)}</p>
            <p><span className="font-medium">Actualizado:</span> {formatDate(risk.updatedAt)}</p>
            <p><span className="font-medium">Próxima Revisión:</span> {formatDate(risk.reviewDate)}</p>
          </div>
        </div>
      </div>

      {/* Threat Description */}
      <div>
        <h4 className="font-medium mb-2">Descripción de la Amenaza</h4>
        <p className="text-sm bg-muted/50 p-3 rounded">{risk.threatDescription}</p>
      </div>

      {/* Risk Assessment Results */}
      <div>
        <h4 className="font-medium mb-2">Resultados de la Evaluación</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-3 rounded">
            <h5 className="font-medium text-sm mb-2">Riesgo Inherente</h5>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {isQualitative ? 
                  risk.result.inherentRisk : 
                  formatCurrency((risk.result as any).inherentALE)
                }
              </span>
              <Badge className={getRiskColorClasses(risk.result.inherentColor)}>
                {risk.result.inherentRating}
              </Badge>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded">
            <h5 className="font-medium text-sm mb-2">Riesgo Residual</h5>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {isQualitative ? 
                  risk.result.residualRisk.toFixed(1) : 
                  formatCurrency((risk.result as any).residualALE)
                }
              </span>
              <Badge className={getRiskColorClasses(risk.result.residualColor)}>
                {risk.result.residualRating}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-green-50 dark:bg-green-950 p-3 rounded">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Reducción de Riesgo:</span>
            <span className="font-bold text-green-600">
              {risk.result.riskReduction.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-medium mb-2">Acciones Recomendadas</h4>
        <ul className="space-y-1 text-sm">
          {risk.result.recommendedActions.map((action, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Notes */}
      {risk.notes && (
        <div>
          <h4 className="font-medium mb-2">Notas</h4>
          <p className="text-sm bg-muted/50 p-3 rounded">{risk.notes}</p>
        </div>
      )}
    </div>
  );
}