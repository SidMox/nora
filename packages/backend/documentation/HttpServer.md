# Servidor HTTP

[HttpServerControl](../src/libraries/HttpServer/HttpServerControl.ts) define inicio, cierre y rutas GET que devuelven Respuesta.
[HttpServerAdapter](../src/libraries/HttpServer/HttpServerAdapter.ts) adapta Express y Swagger, publica /docs y /openapi.json, limita JSON a 100 KB y controla rutas inexistentes y errores sin enviar detalles internos al cliente.
Start admite puerto 0 para pruebas. No implementa autenticación ni autorización.

Las rutas admiten resultados síncronos o promesas. Una `Respuesta` se convierte
automáticamente mediante [HttpResponse](../src/responses/HttpResponse.ts).
Se utiliza `codigo` cuando es un estado HTTP entre 200 y 599; para códigos de
negocio se usa 500 en ERROR y 200 en los demás tipos. Para elegir otro estado,
la ruta devuelve `HttpResponse(respuesta, 201)`, por ejemplo al crear un recurso.
El estado HTTP explícito no modifica el código de negocio de la respuesta.
El cuerpo conserva codigo, tipoRespuesta, descripcion, data y obs; excluye
error y error_desc. Usar SetDescripcion para mensajes públicos seguros.
Las excepciones de rutas, incluidas promesas rechazadas, generan HTTP 500.

Helmet se integra dentro de HttpServerAdapter, que mantiene encapsulados los
middleware de Express. Aplica sus cabeceras predeterminadas; production activa
HSTS y upgrade-insecure-requests. Fuera de producción se desactivan esas dos
políticas para permitir documentación local por HTTP. Swagger conserva su CSP
predeterminada, con scripts del mismo origen. Referencia: [Helmet](https://helmet.js.org/).

Los handlers declaran cuerpo de entrada y respuesta, parámetros, query y locals
explícitos; los datos sin validar usan unknown. Las rutas públicas no exponen
tipos de Express. Se responde 400 a JSON mal formado, 413 si supera 100 KB y 500
a errores de aplicación, incluido SyntaxError ajeno al parser JSON.
