# Auth

Proyecto compuesto por backend (Express, API REST y Swagger) y web (React y MUI).
Cada aplicación tiene package.json, dependencias y comandos propios; pnpm administra sus node_modules con un lockfile común. No contiene reglas de registro, sesiones ni persistencia todavía.

Requiere Node 24.22.0 y pnpm 10.34.7. Desde la raíz:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm dev --filter=@mox/auth-backend --filter=@mox/auth-web
```

Web: http://localhost:5173. API: http://localhost:3001/api/health.
Swagger: http://localhost:3001/docs. OpenAPI: /openapi.json.
PORT configura el backend; si cambia, ajustar el proxy de desarrollo en web/src/ViteConfig.ts.
En producción servir web/dist y configurar el proxy /api y /docs hacia el backend.
