# UI compartida

Atomic design con libraries, shared, atoms, molecules, organisms, templates y pages.
Los niveles superiores consumen los inferiores; shared contiene solo utilidades y contratos.
Las páginas de negocio permanecen en cada aplicación. Las carpetas sin componentes quedan reservadas para necesidades concretas.

[ThemeAdapter](../src/libraries/Theme/ThemeAdapter.tsx) adapta el proveedor de tema y estilos base MUI.
[Text](../src/atoms/Text/Text.tsx) encapsula tipografía y [PageLayout](../src/templates/PageLayout/PageLayout.tsx) ofrece el contenedor de página.
React es una dependencia peer para compartir la instancia del consumidor. Los componentes admiten TSX.
