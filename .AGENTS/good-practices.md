# 1. Errores
    - Todos los errores deben ser leidos

# 2. Comentarios
    - Todas las funciones deben ser comentadas con frases concretas y descriptivas
    - Los comentarios de cualquier funcion deben usar formato JsDoc

# 3. Sintaxis
    - Funciones, métodos, clases, interfaces y tipos deben usar PascalCase o UpperCamelCase Ejemplo: class ClienteModelo, function CrearCliente
    - Cualquier variable y parametro siempre deben estar en camelCase o lowerCamelCase Ejemplo: const patosLocos, var cliente: Cliente, function CrearCliente(cliente:ClienteParam)
    - Toda constante y tipos genericos que se use de forma global debe usar UPPER_SNAKE_CASE
    - Todas los tipos genericos deben comenzar con T

# 4. Formateo
    - Aplicar la configuración compartida de Biome según [environment.md](./environment.md).
    - Usar Biome cuando se configure el proyecto. Durante la definición arquitectónica, mantener formato consistente sin instalar herramientas ni declarar que sus verificaciones se han ejecutado.

# 5. Lenguaje
    - Todo código propio, incluidas pruebas y scripts, usa TypeScript según environment.md. No crear JavaScript ni sus variantes. Usar tipado estricto y respetar las reglas de Biome.
    - Todas las funciones, parametros, interfaces, tipos, clases, componentes, deben tener un nombre autodescriptivo, no valen acronimos ni tampocos denominaciones de una sola letra.

# 6. Testeo

    - Usar Jest y escribir las pruebas en TypeScript. Cada proyecto/paquete tiene una única carpeta test en su raíz.
    - test refleja la estructura del proyecto excluyendo el propio test, node_modules, dist, .test-dist y demás artefactos generados. Ejemplo: packages/libraries/src/Dates/DateAdapter.ts se prueba en packages/libraries/test/Dates/DateAdapter.test.ts. Omitir el contenedor src en el espejo: src/<ruta> corresponde a test/<ruta>.
    - No crear carpetas test dentro de cada característica o librería interna: pertenecen al proyecto padre. Los contratos de tipos se comprueban mediante TypeScript; las clases y funciones con comportamiento se prueban con Jest.
    - Cubrir casos válidos, errores, límites, inmutabilidad y dependencias externas relevantes. Registrar los casos especiales en datos de prueba o mocks según corresponda; no simular date-fns para comprobar su adaptador real.
    - Usar relojes inyectables y fechas explícitas para evitar pruebas dependientes del día de ejecución. Las pruebas de fechas locales no deben depender de un único huso horario del equipo.
    - Excluir test y los artefactos de pruebas de compilación y distribución productivas. Compilar las pruebas por separado y comprobar también sus tipos; los .js emitidos son artefactos, no fuentes mantenidas.
    - Turborepo ejecuta la tarea test de cada proyecto que tenga pruebas; sus dependencias deben estar construidas. No añadir tareas ficticias ni passWithNoTests para aparentar cobertura.
    - Los archivos .mjs provisionales anteriores siguen pendientes de migración. Todo caso nuevo usa TypeScript, Jest y la estructura espejo definida aquí.

# 7. Arquitectura
    - Aplicar las reglas de arquitectura en ./architecture.md

# 8. Sobre librerias de terceros
    - Cualquier libreria debe tener su adaptador

# 9. Validaciones

    - Organizar las validaciones en tres etapas explícitas.
    - Etapa elemental: funciones reutilizables en packages/features/src/core/validations, independientes de entidades. Cumplen SimpleValidation, con tipos concretos para el dato y la configuración, sin any. Devuelven string si no se cumple la condición y undefined si se cumple.
    - Etapa de campo: cada campo tiene su propia función dentro de la clase de validación de la entidad. Cumple EntityValidation y devuelve string[] con todas las observaciones aplicables, o [] si cumple. Los mensajes identifican el campo. No detenerse en el primer problema; omitir únicamente comprobaciones cuyos requisitos no se cumplan, como comprobar longitud de un valor que no es texto.
    - Etapa maestra: MasterValidation cumple Validation, selecciona explícitamente los campos según operacion y acumula todas sus observaciones. Sin observaciones devuelve Respuesta.FromSuccess(true); con observaciones devuelve Respuesta.FromError con false y agrega los mensajes mediante AddMultiObs.
    - La clase implementa ValidationControl. Su API pública solo expone operacion (readonly), MasterValidation y métodos de campo compatibles con EntityValidation. El constructor configura la instancia. No añadir contenedores reglas, Record, firmas de índice ni tipos recursivos para imponer esta restricción; se verifica durante la revisión del código.
    - ValidationControl exige mediante TypeScript operacion y MasterValidation. La restricción sobre los demás miembros públicos es una convención obligatoria de este documento, no una garantía de implements.
    - Las funciones de campo y el maestro de una entidad permanecen en la misma clase. Se permiten clases específicas cuando las entradas, operaciones o necesidades de la entidad lo justifiquen.
    - Entorno significa datos adicionales que afectan la validación (por ejemplo permisos, límites o valores de otros campos), no plataforma web, móvil ni entorno de ejecución. Modelar sus necesidades concretas por entidad, sin inventar abstracciones generales ni exigirlo a quien no lo necesita.
    - Fijar la operación al construir el validador. Las operaciones sin validaciones definidas deben devolver un error explícito; nunca éxito sin comprobar nada.
    - En actualización parcial, los campos omitidos no se validan; los presentes sí. No inventar límites de longitud ni otras reglas de negocio que no estén definidos.
    - Respuesta permanece genérica: no importa tipos ni añade propiedades o fábricas específicas de validación. Solo el maestro convierte las observaciones en error o éxito.
    - Solo el maestro está obligado a devolver Respuesta dentro de estas tres etapas. Las consultas externas se coordinan desde los casos de uso mediante contratos de repositorio.


# 10. Documentación por proyecto

    - Cada proyecto usa src para fuentes, test para pruebas y documentation para resúmenes. Solo test refleja las rutas de src sin repetir su nombre.
    - Crear un documento breve por módulo: Dates.md para el adaptador de fechas y Example.md para la característica Example. No crear un .md por archivo, index, método o detalle de implementación.
    - En características documentar solo los contratos de negocio, casos de uso y validaciones; omitir modelos e implementaciones de data.
    - En librerías resumir el propósito, contrato principal, operaciones y restricciones relevantes del adaptador.
    - Enlazar las fuentes necesarias y actualizar el resumen junto con los cambios funcionales. No duplicar código ni generar árboles de documentación sin necesidad.
    - Usar subcarpetas solo cuando organicen responsabilidades existentes. Un adaptador sencillo conserva Control, Adapter e index en la misma carpeta.
