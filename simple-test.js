/**
 * Simple test to check if basic decoding works with a minimal example
 */
import { decodeGRIB2 } from './src/decoder.js';

// Create a simple 1-byte array to test if decoder can parse basic structure
const buffer = new ArrayBuffer(8);
const view = new Uint8Array(buffer);

// Write basic GRIB2 signature
view[0] = 0x47; // 'G'
view[1] = 0x52; // 'R'
view[2] = 0x49; // 'I'
view[3] = 0x42; // 'B'
view[4] = 0x02; // edition 2
view[5] = 0x00; // length bytes (will be updated)
view[6] = 0x00;
view[7] = 0x08; // length

try {
    const result = decodeGRIB2(buffer);
    console.log('Basic parsing works:', result);
} catch (e) {
    console.error('Error:', e.message);
}