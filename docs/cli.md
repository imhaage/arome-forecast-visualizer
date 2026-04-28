# Outils CLI

## Scripts npm

```bash
npm test                                                       # 93 tests (node --test)
npm run info  -- <file.grib2> [output.txt]                     # rapport métadonnées
npm run export -- <file.grib2> --variable <shortName> [out.csv]# export CSV
npm run serve                                                  # npx serve .
```

---

## grib2-info.js

Rapport textuel des métadonnées d'un fichier GRIB2 (sections 0–7).
N'invoque pas le WASM, ne décode pas les valeurs.

```bash
node grib2-info.js test/arome....grib2            # stdout
node grib2-info.js test/arome....grib2 meta.txt   # fichier
```

Sections couvertes : indicateur, identification, définition de grille,
représentation des données, bitmap, taille compressée/non-compressée.

Importe les tables WMO et helpers depuis `src/wmo-tables.js`.

---

## grib2-export.js

Liste les variables d'un fichier ou exporte une variable en CSV.

```bash
# Lister les variables
node grib2-export.js test/arome....grib2

# Stats + preview (sans écriture)
node grib2-export.js test/arome....grib2 --variable t

# Export CSV (lat,lon,value)
node grib2-export.js test/arome....grib2 --variable t output.csv
```

Format CSV : `lat,lon,value` — une ligne par point valide (points manquants omis).

Utilise `iterateGRIB2Messages()` pour lister, `decodeGRIB2()` pour décoder,
`computeStats()` pour les stats, `indexToLatLon()` pour les coordonnées.
