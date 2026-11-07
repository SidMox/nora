# Aplicación auth backend

[Composición](../src/Application.ts) de las dependencias específicas de esta plataforma.
Publica GET /api/health y su especificación OpenAPI; consume el adaptador compartido @mox/backend.
Las reglas de autenticación están pendientes de definición.

Main valida PORT, NODE_ENV y LOG_LEVEL mediante EnvironmentAdapter antes de
iniciar. Construye LoggerAdapter y lo inyecta al servidor; production deriva de
NODE_ENV. Configuración y registros se describen en la documentación de
[Environment](../../../../packages/backend/documentation/Environment.md) y
[Logger](../../../../packages/backend/documentation/Logger.md).
