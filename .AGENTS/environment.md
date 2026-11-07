# Reglas generales del entorno

Estas reglas se aplican a packages, projects, scripts, pruebas y configuraciones
del sistema. El repositorio está en definición arquitectónica; documentar una
herramienta no implica que ya esté instalada o configurada.

## 1. Node.js

- Usar nvm para gestionar Node.js. La versión del proyecto es Node.js 24 LTS;
  `.nvmrc` fija actualmente 24.22.0. Desde la raíz ejecutar `nvm install`
  para instalarla y `nvm use` para activarla antes de instalar dependencias,
  compilar o ejecutar pruebas. Verificar la versión activa con `node --version`.
- Usar una línea LTS soportada de Node.js, elegida por estabilidad y compatibilidad,
  no la versión Current ni versiones preliminares.
- La línea de referencia al 19 de octubre de 2026 es Node.js 24 LTS. Una nueva
  versión mayor no se adopta automáticamente al publicarse ni al entrar en LTS;
  primero se comprueba su compatibilidad con las herramientas y los proyectos.
- Al configurar el entorno, fijar una versión exacta de esa línea y mantener sus
  actualizaciones de seguridad. Desarrollo, pruebas y CI deben utilizar la misma
  versión fijada. No usar latest como especificación del entorno.
- La versión instalada en una máquina no modifica la versión acordada del sistema.
- Fuente de referencia: [calendario oficial de Node.js](https://github.com/nodejs/Release).

## 2. TypeScript

- Todo código propio de cada proyecto está en src, incluidos scripts propios. Manifiestos, configuraciones, documentación general y test permanecen
  en la raíz. test refleja el contenido de src sin repetir ese contenedor;
  documentation contiene un resumen breve por módulo o característica, no por archivo.

- Todo código propio se escribe en TypeScript: aplicaciones, paquetes, pruebas,
  scripts y configuraciones ejecutables que admitan TypeScript.
- No crear código fuente .js, .jsx, .mjs ni .cjs. Usar .ts; en componentes que
  necesiten JSX, usar .tsx, que sigue siendo TypeScript.
- Los archivos declarativos requeridos por las herramientas, como package.json,
  turbo.json, biome.json, tsconfig.json y archivos de workspace, conservan su
  formato nativo; no son código fuente JavaScript.
- El JavaScript generado por compiladores o dependencias no se mantiene como
  fuente propia ni se edita manualmente.
- Usar tipado estricto y comprobar tipos con TypeScript. Biome y la ejecución de
  pruebas no sustituyen el chequeo de tipos.
- Los archivos .mjs provisionales existentes de pruebas y su cargador están
  pendientes de migración a TypeScript/Jest; no constituyen una excepción para
  crear más JavaScript. Su migración se realizará al preparar las herramientas.

## 3. Formato y pruebas

- Biome es la herramienta de formato y análisis estático del sistema. Compartir
  una configuración base y evitar configuraciones contradictorias entre proyectos.
- Jest es el framework de pruebas; las pruebas se escriben en TypeScript dentro
  de test en la raíz de cada proyecto, reflejando sus rutas productivas.
- Jest está configurado para libraries: las pruebas ESM se compilan por separado
  con TypeScript antes de ejecutarlas. Biome sigue pendiente.
- Las versiones instaladas se fijan en package.json y pnpm-lock.yaml. No
  introducir formateadores alternativos ni declarar verificaciones no ejecutadas.

## 4. Múltiples proyectos con Turborepo

- El sistema central se organiza como un monorepo de múltiples proyectos y paquetes,
  coordinado con Turborepo. También se permiten proyectos standalone externos
  que consuman sus paquetes publicados. Se conservan packages y projects como organización
  conceptual; no es obligatorio cambiar projects por apps.
- Los workspaces y la resolución de dependencias pertenecen al gestor de paquetes;
  Turborepo coordina las tareas y su caché. El gestor es pnpm 10.34.7, fijado
  mediante packageManager, con un único pnpm-lock.yaml en la raíz.
- Cada carpeta directamente bajo packages es un proyecto de workspace con
  package.json y nombre único: @mox/features, @mox/libraries, @mox/shared y las
  demás que se incorporen. Sus carpetas internas son módulos, no paquetes
  anidados. projects/* también se registra como unidades; scripts no es un paquete
  del workspace y se reserva para comandos concretos en scripts/src.
- Las dependencias entre paquetes del workspace usan workspace:*. pnpm transforma
  ese protocolo al empaquetar para consumidores externos. Cada proyecto declara
  solo las dependencias que utiliza.
- Cada proyecto declara y consume solo las características y paquetes necesarios.
  No importar fuentes de otro paquete mediante rutas relativas que eludan su API.
- Definir tareas coherentes de desarrollo, build, test, lint, format y typecheck
  según las necesidades de cada unidad. El grafo de tareas debe respetar las
  dependencias declaradas y cachear únicamente resultados reproducibles.
- Turborepo no impone la arquitectura: se mantienen los límites entre business,
  data, utils, core, shared y las adaptaciones de los proyectos consumidores.
- No exigir un repositorio Git anidado por proyecto. El seguimiento del monorepo
  es común; un proyecto puede tener despliegue independiente sin tener otro Git.
- Los proyectos standalone tienen Git y lockfile propios, usan versiones publicadas
  de los paquetes seleccionados y funcionan sin rutas al monorepo ni a scripts.
  No se exige Git anidado dentro del workspace. No dependen de herramientas
  de generación instaladas en este repositorio.
- Fuente: [estructura oficial de Turborepo](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository).

## 5. Estado de la referencia

- scripts/src/templates/feature conserva la referencia de características y se
  seguirá perfeccionando junto con packages.
- No instalar herramientas, generar aplicaciones ni migrar código por el solo
  hecho de documentar estas reglas. La configuración del workspace es una tarea
  posterior y debe respetar las decisiones aquí registradas.
