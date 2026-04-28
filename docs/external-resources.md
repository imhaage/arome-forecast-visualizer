# Ressources externes

## Spécifications GRIB2

- **WMO FM-92 GRIB Edition 2** — spec officielle du format
- **ECMWF** — https://codes.ecmwf.int/grib/format/grib2/
- **Tables WMO en ligne** — https://codes.ecmwf.int/grib/format/grib2/ctables/

## CCSDS / Compression AEC

- **libaec** (Adaptive Entropy Coding) — https://github.com/MathisRosenhauer/libaec
  Source C dans `libaec/`, compilée en WASM via Emscripten (`src/wasm/build.sh`).
- **CCSDS 121.0-B** — standard de compression lossless utilisé par le template 5.42

## Fichier de test

`test/arome__001__SP1__01H__2026-04-25T03_00_00Z.grib2`
- Modèle AROME, Météo-France (centre 85)
- ~24 MB, 4 messages, compression CCSDS (template 5.42)
- Grille lat/lon 2801×1791, résolution 0.01°
- Domaine : 37.5°–55.4°N, -12°–16°E
