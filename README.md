# GRIB2 Decoder

Browser-native GRIB2 decoder — no server, no backend required.

## Développement

Projet développé intégralement avec **Claude Code** (modèle **Sonnet 4.6**). Aucune ligne de code n'a été écrite manuellement par un humain.

## Fonctionnalités

- Décodage GRIB2 (édition 2) en **JavaScript pur** — sections 0–8 selon la spec WMO FM-92
- Décompression CCSDS via **libaec compilé en WebAssembly** (aucune dépendance native à l'exécution)
- **Carte interactive** MapLibre GL JS + fond OpenFreeMap : zoom, pan, plein écran
- **Tooltip au survol** : valeur exacte du pixel (nom long, valeur, unité)
- Plusieurs palettes de couleurs, colorscale dynamique
- Testé avec les données **AROME SP** (Météo-France)
- Fonctionne entièrement dans le navigateur — aucun serveur requis

## Démarrage rapide

```bash
npm install
npm run serve   # → http://localhost:3000
```

Glissez-déposez un fichier `.grib2` dans l'interface, sélectionnez une variable, explorez les données sur la carte.

## Outils CLI

```bash
# Rapport métadonnées (variables, grille, dates)
npm run info -- <file.grib2>

# Statistiques + export CSV (lat, lon, valeur)
npm run export -- <file.grib2> --variable <shortName>
npm run export -- <file.grib2> --variable t output.csv
```

## Tests

```bash
npm test   # 101 tests
```

- Parsers de sections (walkSections, parseSection1/3/5/6)
- Table de paramètres WMO (régressions sur indices CAPE/CIN, LW radiation, SLHF/SSHF…)
- Cross-validation contre **eccodes** sur 500 points de référence — écart max mesuré : **4.1 × 10⁻⁹ K**

> eccodes est utilisé uniquement pour générer les fixtures de test, pas à l'exécution.

## Limites

| Composant | Support |
|-----------|---------|
| Section 3 — grille | Template 0 uniquement (lat/lon régulière) |
| Section 4 — produit | Template 0 uniquement (analyse / prévision surface) |
| Section 5 — représentation | CCSDS (42), simple packing (0), IEEE 754 (254), missing (255) |
| Fichiers testés | AROME SP — autres centres et configurations non validés |
