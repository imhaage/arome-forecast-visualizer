# Ressources externes et spécifications WMO

## Spécifications principales

### WMO FM-92 GRIB Edition 2
Les spécifications officielles WMO FM-92 définissent le format GRIB2 Edition 2.

### ECMWF Documentation
Les spécifications ECMWF fournissent des détails supplémentaires :
- https://codes.ecmwf.int/grib/format/grib2/

## Templates spécifiques

### Section 3 (Grid Definition)
- Template 0.0 : lat/lon, earth régulier (actuellement implémenté)
- Template 3.1 : Mercator
- Template 3.2 : Lambert Conformal
- Template 3.3 : Polar Stereographic
- Template 3.4 : Albers Equal Area
- Template 3.5 : Rotated Lat/Lon
- Template 3.6 : Transverse Mercator
- Template 3.7 : Polar Stereographic (alternative)
- Template 3.8 : Lambert Azimuthal Equal Area
- Template 3.9 : Equidistant Cylindrical

### Section 4 (Product Definition)
- Template 4.0 : Surface analysis
- Template 4.1 : Atmospheric layers
- Template 4.2 : Statistical processing
- Template 4.3 : Ensemble forecasts
- Template 4.4 : Probability forecasts

### Section 5 (Representation of Data)
- Template 5.0 : Simple packing (actuellement implémenté)
- Template 5.1 : Complex packing
- Template 5.2 : JPEG 2000 compression
- Template 5.3 : PNG compression

## Fichiers de test
- `test/decoder.test.js` — builder de message GRIB2 synthétique
- Fichier réel: `test/arome__001__SP1__01H__2026-04-25T03_00_00Z.grib2`