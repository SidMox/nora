# @mox/backend

Servidor HTTP, respuestas basadas en Respuesta y función Health compartidos en TypeScript. Requiere Node 24.22.0 y pnpm 10.34.7.

Node 24 se gestiona con nvm. Desde la raíz del repositorio ejecutar `nvm install`
y `nvm use` para usar la versión fijada en `.nvmrc`.

Desde la raíz: `pnpm --filter @mox/backend build` y `pnpm --filter @mox/backend typecheck`.
Pruebas: `pnpm --filter @mox/backend test`.

Incluye adaptadores de [configuración](documentation/Environment.md),
[logs](documentation/Logger.md) y [HTTP con Helmet](documentation/HttpServer.md).
Los tipos de Express se instalan con las dependencias de desarrollo del paquete.
