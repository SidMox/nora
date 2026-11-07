# mox-master

Arquitectura y herramientas compartidas para proyectos frontend, backend, mobile
y escritorio. pnpm gestiona el workspace y Turborepo coordina compilación y tipos.
Los consumidores eligen las características y librerías que necesitan.

## Requisitos

Node 24 LTS gestionado con nvm (24.22.0 en .nvmrc) y pnpm 10.34.7 (fijado en packageManager).
Código propio en TypeScript; Jest está configurado para libraries y Biome sigue pendiente.

## Proyectos del workspace

- packages/shared: @mox/shared, contratos elementales como Respuesta y RespuestaBasic.
- packages/features: @mox/features, core y características como módulos internos.
- packages/libraries: @mox/libraries, adaptadores generales como módulos internos.
- projects/*: aplicaciones consumidoras que se añadan.

Cada carpeta inmediata bajo packages tiene su propio package.json. No crear otro
package.json dentro de features/src/core, cada característica o cada adaptador.
Todo el código de cada proyecto está en src; test refleja el contenido de src sin repetir su nombre.

## Comandos

```sh
nvm use
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @mox/shared build
pnpm feature:create producto
```

Después de crear una unidad nueva, ejecutar pnpm install para enlazar sus
dependencias. Los módulos internos nuevos usan la compilación de su paquete padre.
Los proyectos independientes conservan su propio Git y consumen paquetes publicados.

Consultar las reglas en
[architecture.md](.AGENTS/architecture.md), [environment.md](.AGENTS/environment.md)
y [good-practices.md](.AGENTS/good-practices.md).

El primer adaptador es [Dates](packages/libraries/documentation/Dates.md), implementado con date-fns.
Las pruebas de cada proyecto viven en su raíz test y reflejan las rutas de las
clases y funciones productivas.

Cada proyecto mantiene documentation junto a src y test. Cada módulo tiene un
resumen, por ejemplo documentation/Dates.md. Las características resumen sus
contratos, casos de uso y validaciones, sin documentar cada archivo interno.

La carpeta scripts contiene comandos para tareas concretas.
`pnpm feature:create <nombre>` crea una característica usando scripts/src/templates/feature como plantilla.
Consultar [CrearCaracteristica](scripts/documentation/CrearCaracteristica.md).

Auth: [guía y comandos](projects/auth/README.md). Paquetes nuevos: `@mox/backend` y `@mox/web-mui`. Las aplicaciones se registran en `projects/*/backend` y `projects/*/web`.
