# Templates

scripts/src/templates contiene formatos de referencia usados por los comandos.
feature conserva la estructura original de Example y su resumen de negocio en
documentation.md.template. CrearCaracteristica copia sus fuentes y sustituye el
nombre sin depender de una característica instalada en packages/features.

Los imports de estas fuentes corresponden al destino generado; las plantillas
quedan excluidas del tipado de scripts y se verifican al generar una característica.
Los casos de pruebas anteriores se conservan en feature/test como referencia;
no se copian a src ni constituyen una suite Jest activa.
