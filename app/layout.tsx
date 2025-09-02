import TestErrorButton from '@/components/TestErrorButton';
import { Toaster } from '@/components/ui/sonner';
import { RiskProvider } from '@/context/risk-context';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import './faro-client'; // Asegúrate de importar para inicializar Faro en el cliente
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Calculadora de Riesgos - Evaluación de Seguridad',
  description: 'Herramienta profesional para evaluación cualitativa y cuantitativa de riesgos de ciberseguridad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //lang="es" suppressHydrationWarning
  return (
    <html >
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RiskProvider>
            {children}
            <Toaster />
             <TestErrorButton /> {/* Botón de prueba */}
          </RiskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}