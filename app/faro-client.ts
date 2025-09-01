import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

  initializeFaro({
    url: 'https://faro-collector-prod-us-east-2.grafana.net/collect/586d6d0b0e0ee75a99dba92a41709227',
    app: {
      name: 'Calculadora de riesgos',
      version: '1.0.0',
      environment: 'production'
    },
    
    instrumentations: [
      // Mandatory, omits default instrumentations otherwise.
      ...getWebInstrumentations(),

      // Tracing package to get end-to-end visibility for HTTP requests.
      new TracingInstrumentation(),
    ],
  });