# Disponibilidad

[Health](../src/health/Health.ts) recibe el nombre del servicio y devuelve
`Respuesta` exitosa con `{ service, status: 'ok' }`. Cada aplicación elige su
ruta: `Execute: () => Health('auth')`, por ejemplo en GET /api/health.
Confirma que el proceso responde; no comprueba bases de datos ni servicios externos.
