# Configuración de arranque

[EnvironmentControl](../src/libraries/Environment/EnvironmentControl.ts) recibe
variables como Readonly<Record<string, string | undefined>> y devuelve
Respuesta<BackendConfiguration>.
[EnvironmentAdapter](../src/libraries/Environment/EnvironmentAdapter.ts) adapta
Zod sin exponer esquemas del proveedor en el contrato público.

| Variable | Valores | Predeterminado |
| --- | --- | --- |
| PORT | Texto de dígitos, entero entre 0 y 65535; 0 solicita puerto automático | 3001 |
| NODE_ENV | development, test, production | development |
| LOG_LEVEL | debug, info, warn, error | info |

Una variable ausente usa su valor predeterminado; una vacía es inválida. Se
acumulan observaciones por campo sin incluir los valores recibidos. Las variables
adicionales se ignoran. No se modifica process.env ni se cargan archivos .env.
Auth consume el resultado antes de arrancar; ante configuración inválida termina
con código 1. Esta validación técnica no reemplaza las validaciones del negocio.

Referencia: [Zod](https://zod.dev/basics).
