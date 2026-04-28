# Application web — index.html

## Architecture

SPA sans framework, un seul fichier. Routage par hash (`#grid/<shortName>`).
Servie statiquement (`npm run serve`).

```
#             → vue home  (#view-home)
#grid/<name>  → vue grille (#view-grid)
```

### État en mémoire

```js
let fileState      = null; // { messages } — messages parsés sans décodage WASM
let gridState      = null; // { values, min, range } — valeurs décodées, conservées
let currentPalette = 'Plasma';
```

`gridState` est conservé pour permettre de changer la palette sans relancer le WASM.

---

## Vue home

- Zone drag-and-drop / file input → `processFile(file)`
- `iterateGRIB2Messages(buffer)` (synchrone, sans WASM) pour lister les variables
- Bandeau de métadonnées : fichier, taille, centre, date de référence
- Grille de cartes (une par variable) : paramètre, niveau, prévision, grille

---

## Vue grille

### Décodage
`showGridView(shortName)` → `decodeGRIB2(msg.buffer)` (WASM CCSDS).
Le résultat est stocké dans `gridState`.

### Rendu canvas
Canvas pleine résolution (ex : 2801×1791 pour AROME).

```js
function buildLUT(paletteName)  // 256 entrées RGB, évite N appels chroma par pixel
function renderHeatmap()         // lit gridState + currentPalette, repeint le canvas
```

Points manquants (≤ MISSING_VALUE) → gris semi-transparent (180, 180, 180, α=100).

### Palette de couleurs (chroma-js)
Chargé via ESM CDN : `https://esm.sh/chroma-js@2.4.2`

11 palettes en 3 groupes (`<select>` dans la toolbar) :
- **Perceptually uniform** : Plasma, Viridis, Magma, Inferno
- **Diverging** : Spectral, RdBu, RdYlBu
- **Sequential** : YlOrRd, OrRd, Blues, YlGnBu

`Viridis` et les échelles ColorBrewer sont dans `chroma.brewer`.
`Plasma`, `Magma`, `Inferno` sont absents du build ESM → définis comme tableaux hex
dans `CUSTOM_SCALES` et passés directement à `chroma.scale([...])`.

Changement de palette → `renderHeatmap()` uniquement (pas de re-décodage WASM).

### Légende couleur
Dégradé CSS généré depuis la scale courante (8 stops via `sc(i/7).css()`),
appliqué sur `#cs-bar`. Min/max affichés avec l'unité du paramètre.

---

## Imports JS

```js
import chroma from 'https://esm.sh/chroma-js@2.4.2';
import { iterateGRIB2Messages, decodeGRIB2, MISSING_VALUE } from './src/index.js';
import { computeStats } from './src/stats.js';
import { CENTRES, GENERATING_PROCESS, fmtRefTime, fmtLevel, fmtForecast }
  from './src/wmo-tables.js';
```
