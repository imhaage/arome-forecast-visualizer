/**
 * Bit-level helpers for GRIB2 parsing.
 * All reads are big-endian (MSB first), as per the GRIB2 specification.
 */

/**
 * Read `n` bits from the bitstream, starting at `bitPos[0]`.
 * bitPos is a mutable reference (single-element array) so it can be updated.
 * @returns {number} unsigned integer value
 */
export function readBits(data, bitPos, n) {
    let value = 0;
    while (n > 0) {
        const byteIdx = bitPos[0] >>> 3;
        const bitsInThisByte = Math.min(n, 8 - (bitPos[0] & 7));
        const mask = (1 << bitsInThisByte) - 1;
        value = (value << bitsInThisByte) | ((data[byteIdx] >>> (8 - bitsInThisByte - (bitPos[0] & 7))) & mask);
        bitPos[0] += bitsInThisByte;
        n -= bitsInThisByte;
    }
    return value >>> 0; // unsigned
}

/**
 * Write `n` bits from `value` into the bitstream starting at bitPos[0].
 */
export function writeBits(data, bitPos, n, value) {
    let bitsWritten = 0;
    while (bitsWritten < n) {
        const byteIdx = bitPos[0] >>> 3;
        const bitsInThisByte = Math.min(n - bitsWritten, 8 - (bitPos[0] & 7));
        const valueBit = bitsWritten;
        const mask = (1 << bitsInThisByte) - 1;
        const bits = ((value >>> (n - bitsWritten)) & mask) << (8 - bitsInThisByte - (bitPos[0] & 7));
        data[byteIdx] |= bits;
        bitPos[0] += bitsInThisByte;
        bitsWritten += bitsInThisByte;
    }
}

/**
 * Read unsigned 16-bit big-endian.
 */
export function u16be(data, o) {
    return (data[o] << 8) | data[o + 1];
}

/**
 * Read unsigned 24-bit big-endian.
 */
export function u24be(data, o) {
    return (data[o] << 16) | (data[o + 1] << 8) | data[o + 2];
}

/**
 * Read unsigned 32-bit big-endian (returns number, masked to 32 bits).
 */
export function u32be(data, o) {
    return ((data[o] << 24) | (data[o + 1] << 16) | (data[o + 2] << 8) | data[o + 3]) >>> 0;
}

/**
 * Read signed 32-bit big-endian (two's complement).
 */
export function s32be(data, o) {
    const v = (data[o] << 24) | (data[o + 1] << 16) | (data[o + 2] << 8) | data[o + 3];
    return v >= 0x80000000 ? v - 0x100000000 : v;
}

/**
 * Write unsigned 16-bit big-endian.
 */
export function writeU16be(data, o, v) {
    data[o] = v >>> 8;
    data[o + 1] = v & 0xFF;
}

/**
 * Write unsigned 24-bit big-endian.
 */
export function writeU24be(data, o, v) {
    data[o] = (v >>> 16) & 0xFF;
    data[o + 1] = (v >>> 8) & 0xFF;
    data[o + 2] = v & 0xFF;
}

/**
 * Write unsigned 32-bit big-endian.
 */
export function writeU32be(data, o, v) {
    data[o] = (v >>> 24) & 0xFF;
    data[o + 1] = (v >>> 16) & 0xFF;
    data[o + 2] = (v >>> 8) & 0xFF;
    data[o + 3] = v & 0xFF;
}

/**
 * Write signed 32-bit big-endian.
 */
export function writeS32be(data, o, v) {
    // JS bitwise ops work on 32-bit signed ints
    data[o] = v >>> 24;
    data[o + 1] = (v >>> 16) & 0xFF;
    data[o + 2] = (v >>> 8) & 0xFF;
    data[o + 3] = v & 0xFF;
}

/**
 * Write single byte.
 */
export function u8(data, o, v) {
    data[o] = v & 0xFF;
}
