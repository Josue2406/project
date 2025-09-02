// app/faro-client.ts (use client)
'use client';

import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

if (typeof window !== 'undefined') {
  console.log('Initializing Faro...', process.env.NEXT_PUBLIC_FARO_URL);
  initializeFaro({
    url: process.env.NEXT_PUBLIC_FARO_URL!,  // URL del Beacon de Grafana
    app: {
      name: 'risk-calculator-next',  // Nombre de tu app
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',  // La versión de tu app
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'production',  // El ambiente (producción/desarrollo)
    },
    instrumentations: [
      ...getWebInstrumentations(),  // Instrumentación automática para métricas y logs
      new TracingInstrumentation(),  // Instrumentación para el seguimiento de trazas
    ],
  });
}
