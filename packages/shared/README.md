# @mox/shared

Proyecto independiente de contratos y mecanismos elementales compartidos entre
features, librerías y proyectos consumidores. No depende de otros paquetes Mox,
frameworks ni plataformas.

El código está en src/classes y src/interfaces.

API inicial: Respuesta, RespuestaBasic, TipoRespuesta y TIPO_RESPUESTA_MAP.

```ts
import { Respuesta, type RespuestaBasic } from '@mox/shared';
```

Desde la raíz: `pnpm build` y `pnpm typecheck`. Turborepo construye shared antes
de los paquetes que lo declaran como dependencia. Para actuar solo sobre esta
unidad: `pnpm --filter @mox/shared build`.

Los consumidores internos declaran `@mox/shared: workspace:*`. El paquete publica
solo dist con JavaScript generado y declaraciones TypeScript; pnpm convierte el
protocolo workspace al empaquetar. Ningún comando publica automáticamente.
