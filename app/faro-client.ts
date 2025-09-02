// app/faro-client.ts (use client)
'use client';

import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

if (typeof window !== 'undefined') {
  const FARO_URL = process.env.NEXT_PUBLIC_FARO_URL;
  const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
  const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'production';

  if (!FARO_URL) {
    console.warn('⚠️ NEXT_PUBLIC_FARO_URL no está definida. Faro no se inicializará.');
  } else {
    try {
      console.log('🌐 Inicializando Faro Web SDK...');
      console.log('Faro URL:', FARO_URL);
      console.log('App version:', APP_VERSION, '| Environment:', APP_ENV);

      initializeFaro({
        url: FARO_URL,
        app: {
          name: 'risk-calculator-next',
          version: APP_VERSION,
          environment: APP_ENV,
        },
        instrumentations: [
          ...getWebInstrumentations(),
          new TracingInstrumentation(),
        ],
      });

      console.log('✅ Faro inicializado correctamente');
    } catch (err) {
      console.error('❌ Error al inicializar Faro:', err);
    }
  }
}
