# Crear característica

`pnpm feature:create producto` copia la plantilla de
scripts/src/templates/feature a packages/features/src/producto. Renombra archivos,
tipos y referencias Example a Producto y crea documentation/Producto.md en features.
También admite nombres como orden-compra, con tipos OrdenCompra.

Solo recibe el nombre, en minúsculas y guiones. Rechaza nombres reservados,
destinos existentes y colisiones de documentación. Puede ejecutarse desde cualquier
directorio mediante su ruta; no instala dependencias ni crea otro paquete.

Conserva los campos, validaciones y estructura de la plantilla feature; adaptarlos al
dominio después de generar. No añade pruebas ficticias ni modifica el index global.
La característica se puede consumir por la subruta @mox/features/producto/index
una vez compilada. Las pruebas nuevas corresponden a features/test/producto.

Fuente: [CrearCaracteristica.ts](../src/CrearCaracteristica.ts).

La plantilla incluye documentation.md.template para el resumen. Sus imports están
escritos para el destino en features; no se compila como parte de scripts. Los
casos provisionales en test se conservan como referencia y no se copian al src
de la característica generada.
