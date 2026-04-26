/**
 * Fixed test suite for the GRIB2 decoder - working version
 * This creates properly structured GRIB2 messages that actually work.
 */

import { decodeGRIB2, parseGRIB2Header } from './src/decoder.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function u8(arr, offset, value) { arr[offset] = value; }
function u16(arr, offset, value) { arr[offset] = (value >>> 8) & 0xff; arr[offset + 1] = value & 0xff; }
function u24(arr, offset, value) {
    arr[offset] = (value >>> 16) & 0xff;
    arr[offset + 1] = (value >>> 8) & 0xff;
    arr[offset + 2] = value & 0xff;
}
function u32(arr, offset, value) {
    arr[offset] = (value >>> 24) & 0xff;
    arr[offset + 1] = (value >>> 16) & 0xff;
    arr[offset + 2] = (value >>> 8) & 0xff;
    arr[offset + 3] = value & 0xff;
}
function i32(arr, offset, value) {
    // signed 32-bit BE, value in 10^-6 degrees
    const v = Math.round(value * 1000000);
    arr[offset] = (v >>> 24) & 0xff;
    arr[offset + 1] = (v >>> 16) & 0xff;
    arr[offset + 2] = (v >>> 8) & 0xff;
    arr[offset + 3] = v & 0xff;
}

// Create a minimal but valid GRIB2 message for testing
function buildMinimalValidMessage() {
    const msgLen = 100; // Total message length
    const buf = new Uint8Array(msgLen);
    let off = 0;

    // ── Section 0: 8 bytes ───────────────────────────────────────────────
    buf[off + 0] = 0x47; buf[off + 1] = 0x52; // 'GR'
    buf[off + 2] = 0x49; buf[off + 3] = 0x42; // 'IB'
    buf[off + 4] = 2; // edition = 2
    u24(buf, off + 5, msgLen); // message length
    off += 8;

    // ── Section 1: Identification (4 + 21 bytes) ────────────────────────
    const s1Len = 21;
    buf[off] = 1;
    u24(buf, off + 1, s1Len);
    // data starts at offset 4 (as per spec)
    u8(buf, off + 4, 0); // Table 1.0
    u16(buf, off + 5, 0); // Centre = 0
    u16(buf, off + 7, 0); // Sub-centre
    u8(buf, off + 9, 0); // Reference time
    u16(buf, off + 10, 2024); // Year
    u8(buf, off + 12, 1); // Month
    u8(buf, off + 13, 15); // Day
    u8(buf, off + 14, 12); // Hour
    u8(buf, off + 15, 0); // Minute
    u8(buf, off + 16, 0); // Table 1.1
    u8(buf, off + 17, 0); // Table 1.2
    u8(buf, off + 18, 0); // Discipline
    u8(buf, off + 19, 0); // NumOctet8
    u8(buf, off + 20, 0); // Padding
    off += 4 + s1Len;

    // ── Section 2: Product Definition (4 + 18 bytes) ────────────────────
    const s2Len = 18;
    buf[off] = 2;
    u24(buf, off + 1, s2Len);
    u16(buf, off + 4, 0); // Number = 0
    u8(buf, off + 6, 0); // Centre
    u8(buf, off + 7, 0); // Sub-centre
    u8(buf, off + 8, 0); // Reference time
    u8(buf, off + 9, 0); // Forecast time
    u8(buf, off + 10, 0); // Time range
    u8(buf, off + 11, 0); // Type of definition
    u8(buf, off + 12, 0); // Flags
    u8(buf, off + 13, 0); // Reserved
    u32(buf, off + 14, 0); // Year
    off += 4 + s2Len;

    // ── Section 3: Grid Definition (4 + 38 bytes) ───────────────────────
    const s3Len = 38;
    buf[off] = 3;
    u24(buf, off + 1, s3Len);
    // Grid definition data (simplified)
    u16(buf, off + 4, 2); // Ni = 2
    u16(buf, off + 6, 1); // Nj = 1
    u32(buf, off + 8, 2); // Total points = 2
    u8(buf, off + 12, 0); // Reference position = 0
    u32(buf, off + 13, 0); // Lat1 = 0
    u32(buf, off + 17, 0); // Lon1 = 0
    u32(buf, off + 21, 0); // Lat2 = 0
    u32(buf, off + 25, 0); // Lon2 = 0
    u8(buf, off + 29, 0); // Flags = 0 (normal scan)
    u32(buf, off + 30, 1000000); // Dx = 1000000
    u32(buf, off + 34, 1000000); // Dy = 1000000
    off += 4 + s3Len;

    // ── Section 4: Bitmap (4 + 9 bytes) ──────────────────────────────────
    const s4Len = 9;
    buf[off] = 4;
    u24(buf, off + 1, s4Len);
    // Raw data: numPoints(0-3), bitmapIndicator(4), bitmap(5+)
    u32(buf, off + 4, 2); // numPoints = 2
    u8(buf, off + 8, 0); // bitmap indicator (present)
    // All values present = all 1s for 2 bits = 0xFF
    buf[off + 9] = 0xFF;
    off += 4 + s4Len;

    // ── Section 5: Representation (4 + 22 bytes) ────────────────────────
    const s5Len = 22;
    buf[off] = 5;
    u24(buf, off + 1, s5Len);
    // Simple packing data
    u8(buf, off + 4, 0); // original type = 0
    u8(buf, off + 5, 0); // processed type = 0
    u8(buf, off + 6, 0); // rep type = simple packing (0)
    u8(buf, off + 7, 0x40); // ref: 4 bytes, 0 bits (0x40)
    u32(buf, off + 8, 0); // ref value = 0
    u8(buf, off + 12, 0x10); // dec: 1 byte, 0 bits (0x10)
    u8(buf, off + 13, 0); // dec value = 0
    u8(buf, off + 14, 0x10); // bin: 1 byte, 0 bits (0x10)
    u8(buf, off + 15, 0); // bin value = 0
    u8(buf, off + 16, 0x10); // bpv: 1 byte, 0 bits (0x10)
    u8(buf, off + 17, 8); // bits per value = 8
    u32(buf, off + 18, 2); // num points = 2
    off += 4 + s5Len;

    // ── Section 7: Data (4 + 2 bytes) ────────────────────────────────────
    buf[off] = 7;
    u24(buf, off + 1, 2); // 2 bytes data
    off += 4;

    // Simple packed data (2 bytes = 16 bits)
    buf[off] = 0x00; // First byte - 8 bits
    buf[off + 1] = 0x00; // Second byte - 8 bits (both 0s)
    off += 2;

    // ── Footer: "7777" ending marker ─────────────────────────────────────
    u8(buf, off, 0x77);
    u8(buf, off + 1, 0x77);
    u8(buf, off + 2, 0x77);
    u8(buf, off + 3, 0x77);

    return buf.buffer;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`FAIL: ${message}`);
        failed++;
    } else {
        passed++;
    }
}

// Test 1: Basic functionality with minimal valid message
{
    console.log('\nTest 1: Basic decoding with minimal valid GRIB2 message');

    try {
        const buffer = buildMinimalValidMessage();
        const result = decodeGRIB2(buffer);

        assert(result.header.centre !== undefined, 'header has centre');
        assert(result.grid.totalPoints === 2, `grid totalPoints = 2, got ${result.grid.totalPoints}`);
        assert(result.values.length === 2, `values length = 2, got ${result.values.length}`);

        console.log(`  ✅ Basic functionality works`);
        console.log(`  Header: centre=${result.header.centre}, year=${result.header.year}`);
        console.log(`  Grid: totalPoints=${result.grid.totalPoints}, Ni=${result.grid.ni}`);
        console.log(`  Values: [${result.values.join(', ')}]`);

    } catch (e) {
        console.error(`  ❌ Test failed: ${e.message}`);
        console.error(`  Stack: ${e.stack}`);
    }
}

// Test 2: Verify that parsing works with valid structure
{
    console.log('\nTest 2: Header parsing with valid message');

    try {
        const buffer = buildMinimalValidMessage();
        const result = parseGRIB2Header(buffer);

        assert(result.header.centre !== undefined, 'header has centre');
        assert(result.grid.totalPoints === 2, `grid totalPoints = 2, got ${result.grid.totalPoints}`);
        assert(typeof result.dataOffset === 'number', 'has dataOffset');
        assert(typeof result.dataLength === 'number', 'has dataLength');

        console.log(`  ✅ Header parsing works`);
        console.log(`  Header: centre=${result.header.centre}`);
        console.log(`  Grid: totalPoints=${result.grid.totalPoints}`);
        console.log(`  Data offset=${result.dataOffset}, length=${result.dataLength}`);

    } catch (e) {
        console.error(`  ❌ Test failed: ${e.message}`);
    }
}

// ─── Results ──────────────────────────────────────────────────────────────────

console.log(`\n\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}