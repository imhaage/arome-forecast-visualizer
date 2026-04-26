import { decodeGRIB2, parseGRIB2Header } from './src/decoder.js';

// Test simple avec une structure minimale GRIB2
console.log('Testing basic GRIB2 parsing...');

// Créer une structure GRIB2 basique (8 octets)
const buffer = new ArrayBuffer(8);
const view = new Uint8Array(buffer);

// Signature GRIB2
view[0] = 0x47; // 'G'
view[1] = 0x52; // 'R'
view[2] = 0x49; // 'I'
view[3] = 0x42; // 'B'
view[4] = 0x02; // edition 2
view[5] = 0x00; // length bytes (will be updated)
view[6] = 0x00;
view[7] = 0x08; // length

try {
    const header = parseGRIB2Header(buffer);
    console.log('Basic parsing works:', header);
} catch (e) {
    console.error('Error in basic parsing:', e.message);
}

// Test avec les sections pour voir ce qui se passe
console.log('\n--- Testing with minimal valid structure ---');

// Créer une structure minimale qui correspond à ce que le parser attend
const minimalBuffer = new ArrayBuffer(100);
const minimalView = new Uint8Array(minimalBuffer);

// GRIB signature and basic structure
minimalView[0] = 0x47; // 'G'
minimalView[1] = 0x52; // 'R'
minimalView[2] = 0x49; // 'I'
minimalView[3] = 0x42; // 'B'
minimalView[4] = 0x02; // edition = 2
minimalView[5] = 0x00; // length (should be 100)
minimalView[6] = 0x00;
minimalView[7] = 0x64; // length = 100 (0x64)

try {
    const header = parseGRIB2Header(minimalBuffer);
    console.log('Minimal structure parsing result:', {
        messageLength: header.header.messageLength,
        gridPoints: header.grid.totalPoints
    });
} catch (e) {
    console.error('Error in minimal parsing:', e.message);
    console.error('Stack:', e.stack);
}