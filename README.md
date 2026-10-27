# Hexalis · perfil de la organización

Este repositorio es el [perfil público](https://github.com/hexalis) de Hexalis. GitHub muestra `profile/README.md` en la página de la organización.

El sitio está en [hexalis.org](https://hexalis.org).

## Imágenes

Los SVG de `profile/assets/` (portada, cifras, paletas, bitácora, equipo, recorrido y cierre) se generan en versión clara y oscura con:

```sh
node scripts/build-assets.mjs
```

Los colores y los datos vienen del landing: si cambian ahí, cámbialos en el script y vuelve a generarlos. Las animaciones son CSS dentro de cada SVG y se desactivan con `prefers-reduced-motion`.
