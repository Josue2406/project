import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { RiskProvider } from '@/context/risk-context';

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
  return (
    <html lang="es" suppressHydrationWarning>
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
          </RiskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}