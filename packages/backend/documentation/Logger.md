# Registro de eventos

[LoggerControl](../src/libraries/Logger/LoggerControl.ts) define Write con nivel,
mensaje y contexto tipado; devuelve Respuesta<boolean>. Los niveles admitidos
son debug, info, warn y error.
[LoggerAdapter](../src/libraries/Logger/LoggerAdapter.ts) adapta Pino, escribe JSON
y permite elegir nivel mínimo y una salida Writable. SUCCESS confirma la entrega
al logger, incluso si el filtro omite el evento; no garantiza persistencia ni
captura errores asíncronos del destino. La salida predeterminada es stdout.

HttpServer acepta un logger inyectado y registra método, ruta sin query, estado y
duración al completar la respuesta. No captura cuerpos ni cabeceras. Los errores
internos se registran únicamente en servidor; evitar incluir secretos en mensajes,
rutas o errores. Si falla Write, el servidor informa el fallo por consola.

Referencia: [Pino](https://github.com/pinojs/pino/blob/main/docs/api.md).
