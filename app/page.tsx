import Link from 'next/link';
import { Calculator, FileText, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/nav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Calculadora de
            <span className="text-primary block">Riesgos</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Herramienta profesional para evaluación cualitativa y cuantitativa de riesgos 
            de ciberseguridad, alineada con ISO 27005 y NIST SP 800-30.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4 mx-auto group-hover:bg-blue-500/20 transition-colors">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Calcular Riesgo</CardTitle>
              <CardDescription>
                Evalúa riesgos usando métodos cualitativos y cuantitativos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>• Análisis cualitativo (Probabilidad × Impacto)</li>
                <li>• Cálculo cuantitativo (SLE, ALE)</li>
                <li>• Comparación riesgo inherente vs residual</li>
                <li>• Mapa de calor 5×5 interactivo</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/calcular">
                  Comenzar Evaluación
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4 mx-auto group-hover:bg-green-500/20 transition-colors">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registro de Riesgos</CardTitle>
              <CardDescription>
                Gestiona y monitorea tu inventario completo de riesgos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>• Gestión CRUD de riesgos identificados</li>
                <li>• Filtrado y búsqueda avanzada</li>
                <li>• Exportación CSV/JSON</li>
                <li>• Seguimiento de acciones correctivas</li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/registro">
                  Ver Registro
                  <FileText className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Desarrollado siguiendo estándares internacionales de gestión de riesgos
          </p>
        </div>
      </main>
    </div>
  );
}