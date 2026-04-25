# Architecture du décodeur GRIB2

## Fichiers sources
- `src/decoder.js` — Entry point principal, contient `decodeGRIB2()`, `parseGRIB2Header()`, `walkSections()`, `parseSection1/3/4/5()`
- `src/bitstream.js` — Helpers au niveau des bits: `readBits()`, `writeBits()`, `u16be()`, `u24be()`, `u32be()`, `s32be()`
- `src/bitmap.js` — Gestion bitmap: `decodeSection4()`, `readBitmap()`, `isSpecialBitmap()`

## Format message GRIB2
- Section 0: Signature "GRIB" + édition + longueur (8 bytes)
- Section 1: Identification (centre, temps, discipline)
- Section 2: Product Definition Template (variable)
- Section 3: Grid Definition Template (Ni, Nj, lat/lon, flags)
- Section 4: Bitmap (1 bit par point)
- Section 5: Representation of Data (type de packing + paramètres)
- Section 6: Local Use (optionnel)
- Section 7: Données + ending indicator "7777" (4 bytes 0x77)

## Types de packing supportés
- 0 (simple), 40 (constant), 254 (IEEE 754 big-endian), 255 (missing)

## Formulaire simple packing
`val[i] = ((coded_int[i] * 10^Kdec) + R0) * 2^(-Kbin)`