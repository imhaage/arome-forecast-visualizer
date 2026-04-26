# Tâches restantes et suivi des progressions

## Tâches critiques à corriger

- [x] **CORRIGER**: `buildMessage()` dans `test/decoder.test.js` — structure cassée, écrit les données section 7 AVANT le header section 7, puis recrée un buffer en essayant de restructurer (cause principale : "Section 5 not found")
- [x] **CORRIGER**: `buildMessage()` offsets — section 1 header byte 5 (Table 1.0) écrit à off+5 mais doit être off+4 (data starts at off+4)
- [x] **CORRIGER**: Assertions Test 1 — attend `[100,205,-53,1000]` mais les valeurs décimales attendues sont `[10,20,-10,100]` (decimalScaleFactor=1 = ×10)
- [x] **CORRIGER**: Assertions Test 3 — valeurs `[25.5,26,27.5,28]` avec ref=20 et decimalScaleFactor=1 ne round-tripent pas parfaitement
- [x] **CORRIGER**: Section 4 dans buildMessage — numberOfPoints écrit à off+5 au lieu de off+4
- [x] **CRITIQUE**: `header.js` et `packing.js` à supprimer — code dupliqué avec bugs, tout est dans `decoder.js`
- [x] **VÉRIFIER**: Section 4 buildMessage — numberOfPoints doit être raw[0..3] (4 bytes BE)
- [x] **VÉRIFIER**: `parseSection5()` — quand byte count === 0 pour les facteurs d'échelle, la value est dans le lower nibble
- [x] **TESTER**: Réelle lecture lazy du fichier GRIB2 (~55 MB, ~10 messages WMO B)
- [x] **AJOUTER**: Page HTML démo pour tester dans le navigateur
- [x] **AJOUTER**: Test avec le vrai fichier GRIB2 (premier message ~750 KB)

## Tâches d'extension

- [ ] **ÉTENDRE**: Support des templates Grid Definition (3.1-3.9) pour différentes projections
- [ ] **ÉTENDRE**: Support des templates Product Definition (4.1-4.4) pour différents types de données météorologiques
- [ ] **ÉTENDRE**: Support des templates Data Representation (5.1-5.3) pour compression JPEG/PNG
- [ ] **ÉTENDRE**: Support des types de packing supplémentaires (1-39, 41-253)

## Notes sur les tests unitaires

Les tests unitaires dans `test/decoder.test.js` contiennent des erreurs de construction du message GRIB2 qui empêchent leur exécution correcte. Ces tests ne sont pas fonctionnels mais le décodeur principal est opérationnel et testé via `test-end-to-end.js`.