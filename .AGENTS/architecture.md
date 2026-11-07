# 0. Requerimientos
    - Aplicar las reglas generales de entorno en [environment.md](./environment.md): Node.js LTS, TypeScript, Biome, Jest y organización multiproyecto con Turborepo.
    - Respuesta es obligatoria en casos de uso, repositorios implementados, dataSource implementados y sus contratos, validaciones maestras y operaciones de adaptadores de librerías de terceros. Los detalles de estos adaptadores se definirán al abordar libraries.
    - Las conversiones de modelos y funciones auxiliares no están obligadas a devolver Respuesta. Las validaciones elementales y de campo devuelven observaciones según good-practices.md.
    - Todos los casos de uso deben implementar UseCaseControl.
    - El sistema está en definición arquitectónica. example es una referencia, no una aplicación productiva. Las propuestas y TODO no equivalen a decisiones aprobadas.


# 1. Estructura del sistema
    - Todo código fuente de cada proyecto/paquete reside en su carpeta src. Esto incluye clases, contratos, módulos, entradas públicas, scripts de compilación propios y otras herramientas propias.
    - Los manifiestos y configuraciones de herramientas permanecen en la raíz del proyecto, junto con README, test y documentation. test refleja el contenido de src sin repetir esa carpeta; dist y .test-dist contienen únicamente artefactos generados.
    - En packages, cada carpeta inmediata sigue siendo un proyecto independiente: packages/<proyecto>/src. Sus módulos internos no crean otro src ni otro package.json.
    - documentation: Aqui van archivos .md con la documentacion decada seccion, para mas detalle adjunto en seccion 2. documentation.
    - packages: Aqui van modulos, funciones, constantes, y la arquitectura de cada proyecto, que se comparten entre los proyectos, para mas detalle adjunto en seccion 3. packages.
    - projects: Aqui van los proyectos del sistema, para mas detalle adjunto en seccion 4. projects.
    - scripts:Aqui van scripts, comandos que ayuden a formalizar el sistema, en su arquitectura en su exportacion y desarrollo, para mas detalle adjunto en seccion 5. scripts.

# 2. documentation
    - Cada proyecto/paquete tiene documentation en su raíz. La documentation de la raíz del sistema se reserva para decisiones y guías transversales.
    - La documentación es por módulo o característica, no por archivo ni por carpeta de implementación. Por ejemplo, src/Dates se resume en documentation/Dates.md y src/example en documentation/Example.md.
    - Para librerías, resumir qué necesidad resuelve el adaptador, su contrato principal y sus operaciones relevantes. Incluir formatos o restricciones solo si son parte importante de su comportamiento.
    - Para características, resumir exclusivamente los contratos de negocio (entidades, entradas/salidas, repositorios y dataSource), casos de uso y validaciones. No crear documentos por cada modelo, implementación de repositorio, index o detalle interno de data.
    - Cada resumen debe ser breve, concreto y enlazar las fuentes relevantes. Los módulos de core, shared y herramientas también se resumen por responsabilidad, sin un .md por clase o función.
    - documentation no reproduce el árbol completo de src ni el de test. No generar documentation/src, documentation/test ni documentation/documentation. Se permiten agrupaciones útiles para módulos de UI o plataforma, sin reproducir sus archivos internos.
    - test mantiene su propia regla de espejo del contenido de src sin repetir el contenedor src; esa regla no se aplica a documentation.
    - Mantener el resumen cuando cambien contratos o comportamiento. README explica propósito, requisitos y comandos; las guías transversales se añaden solo cuando sean necesarias, sin duplicar los resúmenes.
    - Los futuros comandos que creen módulos deben incluir su resumen inicial, detectar colisiones y no sobrescribir contenido del usuario.

# 3. packages
    - Los packages contiene todo lo que se pueda compartir entre los proyectos,incluyendo la arquitectura
    - Cada paquete tiene responsabilidades y dependencias explícitas dentro del workspace coordinado por Turborepo.
    - packages se divide en las siguientes carpetas/proyectos: shared, features, libraries, web-mui, mobile-ui, window-ui, backend, db. Cada carpeta inmediata es una unidad de pnpm/Turborepo; las carpetas internas son módulos sin package.json propio.

- [ ] **TODO: Definir los límites y la distribución de los paquetes.**
  - **Falta o duda:** Faltan reglas de importación, exportaciones públicas, versionado y una sección para `packages/db`; compartir arquitectura puede significar código o plantillas.
  - **Sugerencia:** Publicar contratos públicos explícitos, evitar ciclos, acordar la distribución entre repositorios y separar paquetes reutilizables de plantillas o generadores. Documentar qué ofrece `packages/db` y qué pertenece a cada proyecto.

## 3.1 features
    - El código productivo usa TypeScript independiente de frameworks y plataformas. Jest está configurado para las pruebas del proyecto libraries. La misma regla de test espejo se aplica al resto de proyectos; Biome sigue pendiente de configuración.
    - Aqui van las diferentes caracteristicas que estan relacionadas entre los proyectos,cada caracteristica tiene la siguiente:
        - business: reglas y contratos relacionados a la caracteristicas.
        - data: aqui van modelos y los repositorios implementados.
        - utils: funciones, validaciones, constantes y tipos propios de la característica. Los contratos de entrada y salida pertenecen a business/params; los mapeadores de persistencia pertenecen a data.
    - packages/shared es un proyecto independiente (@mox/shared) con contratos y mecanismos elementales compartidos entre todas las librerías y proyectos. Contiene Respuesta y RespuestaBasic; no depende de features ni de librerías concretas.
    - features/core contiene UseCaseControl, ValidationControl y validaciones elementales de las características. Consume Respuesta desde @mox/shared; no duplica esos contratos. No depende de funcionalidades concretas.
    - No confundir packages/shared con utilidades internas de una característica o de UI. Las utilidades específicas permanecen en su módulo; solo los contratos elementales transversales se promueven al proyecto shared.
    - Las características se pueden consumir desde frontend, backend y otras plataformas sin cambiar sus contratos de negocio. No importan proyectos consumidores, frameworks de UI o servidor, APIs exclusivas del navegador ni controladores de almacenamiento concretos.
    - Cada proyecto consume únicamente las características que necesita y sus dependencias explícitas; no debe importar ni construir todas las características del sistema.
    - Los proyectos dependen de features; features nunca depende de los proyectos.
    - Cada funcionalidad usa business, data y utils; sus pruebas se ubican en test/<característica>/... en la raíz de features, reflejando las rutas productivas. La nomenclatura oficial es business/dataSource para contratos y data/repositories para implementaciones de repositorios.

### Dependencias entre capas
    - business define entidades, parámetros de entrada/salida, contratos de repositorios y dataSource, y casos de uso. Depende de core y de sus contratos; no depende de implementaciones de data ni de validadores concretos de utils.
    - utils/validations puede depender de core y de los contratos de business, incluidos entities y params. No depende de implementaciones de data ni de proyectos.
    - data implementa los repositorios y modelos usando los contratos de business y core. Coordina dataSource por sus interfaces; no conoce HTTP, SQLite, IndexedDB ni frameworks concretos.
    - Los casos de uso reciben repositorios y validadores por sus contratos mediante el constructor. No construyen implementaciones concretas ni seleccionan plataformas.
    - Los index.ts publican únicamente los contratos y componentes previstos para consumo. Las dependencias de tipos usan import type; evitar ciclos entre módulos.

### Construcción y adaptación por plataforma
    - El proyecto consumidor implementa los dataSource específicos de su plataforma y construye las dependencias que necesita: dataSource, repositorios, validadores y casos de uso.
    - La ubicación de ese punto de composición dentro de cada proyecto se define con su arquitectura concreta. Su ausencia en features es intencional.
    - Usar inyección por constructor. No exigir contenedores de inyección, fábricas generales ni carpetas vacías para plataformas que todavía no se utilizan.
    - La referencia Example se conserva como plantilla en scripts/src/templates/feature, no como característica instalada. Su adaptación pendiente (parámetros en utils/params y validador predeterminado) se resolverá al perfeccionar la plantilla.

## 3.1.1 business
    - Se divide en las siguientes carpetas: entities, params, repositories, dataSource, useCases.

### 3.1.1.1 entities
    - Contiene solo interfaces, un archivo por interfaz
    - Es el elemento mas simple de la caracteristica
    - Es un contrato que detalla los elementos de la carac
    - Una entidad puede extender a otras entidades, como tambien puede ser usado en params (solo en partials).

### 3.1.1.2 repositories
    - Son contratos que contienen las funciones relacionadas con la entidad.
    - Son las acciones mas importantes de la aplicacion.

### 3.1.1.3 dataSource
    - Son contratos de las operaciones de acceso a datos que necesitan los repositorios implementados. Se mantienen en business/dataSource.
    - Las implementaciones concretas pertenecen al proyecto consumidor y cumplen estos contratos usando Respuesta. No es obligatorio definirlas dentro de la referencia compartida.

### 3.1.1.4 useCases
    - Cada caso de uso representa una acción de negocio, implementa UseCaseControl y devuelve Respuesta.
    - Ejecuta las validaciones necesarias y coordina los contratos de repositorio que requiere la acción. Puede utilizar más de un repositorio cuando el caso lo justifique.
    - Recibe sus dependencias mediante el constructor; el consumidor elige las implementaciones.
    - Las reglas de atomicidad para operaciones sobre varias fuentes se definirán cuando exista un caso concreto.

### 3.1.1.5 params
    - Contiene contratos de entrada y salida por operación, compartidos por casos de uso, repositorios, dataSource y validadores.
    - Los contratos de entrada terminan en Input, por ejemplo CreateExampleInput o UpdateExampleInput. Los contratos de salida específicos terminan en Output, por ejemplo CreateExampleOutput.
    - Input y Output nombran los datos de la operación, no la envoltura Respuesta. Si la salida ya es una entidad o un identificador suficiente, se puede devolver ese contrato directamente sin crear un Output redundante.
    - Los parámetros pueden reutilizar campos de entidades mediante Partial o extender contratos cuando mantengan su significado; no usar Omit según la regla de entidades.
    - Un identificador de creación puede ser opcional: lo puede proporcionar el consumidor o generar el sistema responsable de persistir, según el caso. No asumir que solo el servidor genera identificadores ni que el cliente siempre debe enviarlos.
    - La política de identidad para fuentes remotas, locales y sincronización se define por implementación. No se exige identificador para crear en la referencia Example.

## 3.1.2 data
    - Se divide en las siguientes carpetas: models, repositories.

    - La ausencia de dataSource concretos en esta capa es intencional: el proyecto consumidor implementa el acceso específico a su plataforma e inyecta los contratos requeridos por los repositorios.

### 3.1.2.1 models
    - Es una clase que implementa la interfaz de entidad mediante implements y permite convertir entre entidad y modelo.
    - Las validaciones se realizan en los casos de uso, por las validaciones.

### 3.1.2.2 repositories
    - Los repositorios implementan los contratos con implements e inyectan los dataSource necesarios. Se ubican en data/repositories.
    - Un repositorio puede coordinar varias fuentes, por ejemplo una remota y otra SQLite o IndexedDB para sincronización. No se presupone que cada repositorio corresponda a una única base de datos.
    - Conservar errores, advertencias e información de las fuentes al convertir resultados; nunca convertirlos automáticamente en éxito. Las operaciones que prometen datos deben detectar éxito sin datos requeridos. Una lista vacía sí es un resultado válido.
    - Los conflictos de sincronización, reintentos y atomicidad quedan pendientes hasta definir una operación concreta.

## 3.1.3 utils
    - Se divide en las siguientes carpetas según necesidad: validations, functions, constants, types, others. Los parámetros de operación están en business/params.

- [ ] **TODO: Delimitar utilidades y sus dependencias.**
  - **Falta o duda:** Las responsabilidades de `functions`, `types` y mapeadores pueden solaparse o permitir dependencias circulares con `business` y `data`.
  - **Sugerencia:** Mantener cada utilidad junto a su responsabilidad, mover las reglas de negocio al dominio y ubicar los mapeadores de persistencia en `data`. Compartir solo utilidades estables con dependencias explícitas.

### 3.1.3.1 validations
    - Son funciones que validan los modelos o los parametros
    - Respetar reglas de validaciones en good-practices.md

### 3.1.3.2 functions
    - Son funciones que realizan acciones relacionadas a las entidades o parametros o la caracteristica
    - Reservar esta carpeta para transformaciones y cálculos auxiliares; colocar acciones de negocio en casos de uso

### 3.1.3.3 constants
    - Son constantes
    - Cada archivo tiene su propia constante o coleccion de esta
    - En caso una constante sea un arreglo y tenga su propio tipado este debe estar en la misma constante
    - No se usan enums para nada
    -Usar valores `as const` y tipos derivados cuando corresponda. Mantener configuración y secretos del entorno fuera de las constantes de dominio y aplicar la convención de nombres globales acordada

### 3.1.3.3 types
    - Son tipos
    - En cada archivo de cada tipo debe haber mapeadores en caso se requiera
    - No se usan enums
    - Mantener junto al tipo únicamente conversiones propias de ese concepto, ubicar conversiones de transporte o persistencia en sus capas y corregir la numeración al consolidar el documento

### 3.1.3.6 others
    - Son casos particulares que no encajan con ninguno de los casos anteriormeeente mensionados
    - Exigir que cada incorporación documente su responsabilidad
    - Crear una ubicación con nombre específico cuando aparezca un patrón repetido

## 3.2 libraries
    - Mantener una estructura simple por adaptador: DateControl.ts, DateAdapter.ts e index.ts en la misma carpeta. El contrato principal y sus tipos asociados pueden convivir en el archivo Control.
    - No crear una carpeta interfaces para un único contrato. Introducir subcarpetas solo cuando existan varias responsabilidades reales que necesiten organización; no por anticipación.
    - Cada adaptador define primero su contrato propio, sin tipos del proveedor, y devuelve Respuesta en sus operaciones públicas. La implementación traduce los formatos y errores de la dependencia.
    - Dates contiene DateControl y DateAdapter, implementado con date-fns. Presentación por defecto DD/MM/YYYY; persistencia DATE como YYYY-MM-DD o DATETIME como YYYY-MM-DD HH:mm:ss. No almacenar el formato visual como dato de fecha.
    - DATE y DATETIME se interpretan como calendario local sin conversión de zona implícita. Una política de instantes UTC/TIMESTAMP requiere un contrato explícito adicional; no se presume equivalencia con DATETIME.
    - Las pruebas se ubican en libraries/test y reflejan el contenido de src, por ejemplo test/Dates/DateAdapter.test.ts. Aplicar esta estructura a todos los proyectos según good-practices.md.
    - Solo TS puro.
    - Aqui van todas las librerias de terceros adaptadas a nuestros sistemas y que no esten relacionados a backend ni a front, en una carpeta con un nombre autodescriptivo y no personalizado ejemplo: si se usa date-fs, se crea una carpeta llamada Dates, y una clase llamda DateAdapter con las funciones necesarias o configuraciones requeridas, como puedes ver esta clase no tiene ninguna relacion con la libreria al nombrar la clase.
    -Definir contratos propios para integraciones que se quieran aislar, inyectar sus implementaciones y excluir compiladores, formateadores y otras herramientas de desarrollo.

## 3.3 web-ui, mobile-ui, window-ui
    - Solo Ts puro y librerias de acuerdo a entorno
    - Aqui van los componentes que se compartiran entre proyectos web o mobile o window.
    - Para este caso se requiere una arquitectura atomic design.
    - Se debe dividir en las siguientes carpetas:
        - libraries: adapters relacionado al entorno del proyecto
        - shared: funciones,tipos, etc que se repiten entre componentes, (pero no componentes)
        - atoms: componentes pequeños (pueden tener UI de terceros como MUI)
        - molecules: componentes que usan atoms
        - organisms: componentes que usan molecules y/o atoms
        - templates: componentes que usan organisms y/o molecules o atoms
        - pages: componentes que usan templates y/o organisms, molecules o atoms
    - Se mobile-ui y window-ui son opcionales de acuerdo al alcance de los proyectos

- [ ] **TODO: Completar las reglas de UI por plataforma.**
  - **Falta o duda:** Faltan frameworks y formatos permitidos, dependencias entre niveles, acceso a casos de uso y límites para páginas compartidas. No se aclara si los átomos envuelven UI de terceros.
  - **Sugerencia:** Permitir TSX cuando corresponda, documentar importaciones entre niveles y usar átomos como envoltorios de componentes externos. Mantener rutas y páginas específicas en cada proyecto y definir accesibilidad, temas y pruebas de interacción.

## 3.4 backend
    - Solo Ts puro
    - Aqui van todas las funciones, middleware, control de apiRest que se repiten en cada backend de los proyectos.
    - HttpServerAdapter encapsula Express, Swagger y Helmet. Los handlers declaran tipos explícitos de entrada, respuesta, parámetros, query y locals; usar unknown para datos externos sin validar, nunca any.
    - LoggerControl y LoggerAdapter encapsulan Pino para registro del proceso servidor. Los proyectos inyectan el logger; no se registran automáticamente cuerpos ni cabeceras HTTP.
    - EnvironmentControl y EnvironmentAdapter encapsulan Zod para configuración de arranque tipada (PORT, NODE_ENV, LOG_LEVEL). Los proyectos validan antes de escuchar; las validaciones de negocio conservan sus contratos actuales.
    - Las operaciones públicas de estos adaptadores devuelven Respuesta y los contratos no exponen tipos de proveedores. Cada módulo tiene su resumen en packages/backend/documentation.
    - Persistencia, selección de base de datos, autenticación y autorización permanecen pendientes de coordinación.

- [ ] **TODO: Delimitar el backend compartido y su plataforma.**
  - **Falta o duda:** No se distingue código independiente del framework de middleware específico; faltan configuración, autenticación, autorización, errores y observabilidad.
  - **Sugerencia:** Separar contratos y funciones reutilizables de adaptadores del framework. Definir configuración validada, manejo de errores, registro y controles de acceso; impedir que módulos exclusivos del servidor se importen desde clientes.

# 4. projects
    - Aqui van los diferentes proyectos del sistema
    - Cada proyecto consume solo las características que necesita e implementa sus adaptaciones de plataforma y construcción de dependencias. No se requiere consumir todo packages/features.
    - Se permiten dos modos: workspace dentro del monorepo coordinado por Turborepo y standalone fuera del monorepo, con Git, instalación, lockfile, desarrollo y despliegue propios.
    - Un proyecto standalone consume versiones publicadas de los paquetes que necesita. No depende de rutas relativas al monorepo ni de su carpeta scripts. Un proyecto workspace declara las mismas dependencias mediante las reglas del gestor acordado.
    - El modo standalone se genera en una ubicación externa explícita; inicializar Git es una opción del comando, sin commits automáticos. No crear repositorios anidados accidentalmente.
    - Cada proyecto puede tener los siguientes sub-proyectos
        - db: aqui van las tablas, spu, middleware y functions relacionados al proyecto.
        - backend: aqui va el sistema backend del proyecto
        - web: aqui va el sistema front para web
        - mobile:(opcional, depende de la magnitud del proyecto)
        - window:(opcional, depende de la magnitud del proyecto)

- [ ] **Pendiente: configuración del workspace y distribución.**
  - pnpm y Turborepo están configurados en la raíz. Cada carpeta inmediata de packages declara su manifiesto; no crear paquetes dentro de features, libraries o UI.
  - Añadir proyectos mediante los patrones explícitos de pnpm-workspace.yaml y ejecutar build/typecheck mediante Turborepo.
  - El gestor acordado es pnpm. El workspace tiene un lockfile común; cada proyecto standalone tiene el suyo.
  - Los paquetes reutilizables se distribuyen como paquetes versionados, con API pública y artefactos compilados. El registro, alcance de publicación y credenciales siguen pendientes. Generar o empaquetar no autoriza publicar.
  - Los límites de db frente a packages/db y los detalles de persistencia siguen pendientes.

# 5. scripts
    - Contiene comandos concretos para agilizar tareas repetitivas de desarrollo, mantenimiento y organización del sistema.
    - Añadir comandos solo ante una necesidad real. No crear un generador general, paquetes de herramientas ni comandos anticipados.
    - Escribir los comandos en TypeScript bajo scripts/src; agruparlos por responsabilidad solo cuando haya varios casos relacionados. No crear un proyecto independiente por cada comando.
    - Antes de añadir un comando, comprobar si pnpm, Turborepo o una herramienta ya instalada resuelven la tarea; evitar duplicar sus funciones.
    - Cada comando debe tener nombre descriptivo, propósito, argumentos y forma de ejecución documentados. Devolver código de salida distinto de cero ante fallos y comunicar los errores claramente.
    - Para comandos que modifiquen archivos, validar rutas y entradas, detectar colisiones y ofrecer simulación cuando aporte valor. No sobrescribir ni eliminar contenido ajeno a su alcance.
    - No ejecutar instalaciones, publicaciones o cambios externos como efecto secundario de otro comando. No registrar secretos en argumentos o salidas.
    - Si un comando necesita dependencias o una tarea de pnpm, declararlas explícitamente cuando se incorpore; scripts no es actualmente una unidad del workspace.

    - Comando actual: pnpm feature:create <nombre> crea una característica en packages/features/src a partir de scripts/src/templates/feature, sustituyendo nombres de archivos, tipos y referencias, y copia su resumen de negocio a documentation. Por ahora recibe solo el nombre.

    - scripts/src/templates conserva los formatos utilizados por comandos concretos. feature contiene la referencia de características y su resumen; sus imports corresponden al destino generado y no se compila dentro de scripts. No requiere que example exista en features.

## Decisión aplicada: auth

Auth se organiza en projects/auth/backend y projects/auth/web, cada uno como unidad pnpm con manifiesto propio y lockfile compartido. packages/web-mui implementa la arquitectura atomic design web en React/TSX y MUI. packages/backend aloja los adaptadores reutilizables de Express y Swagger, sin importar aplicaciones consumidoras.
