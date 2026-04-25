/**
 * GRIB2 bitmap handling (Sections 4 & 5).
 * Bitmap indicates which grid points have valid values (1) vs missing (0).
 * A "special bitmap" may be used when all or no values are present.
 */

/**
 * Decode the section 4 header to get bitmap info.
 */
export function decodeSection4(data, offset) {
    const sectionNumber = data[offset];
    if (sectionNumber !== 4) {
        throw new Error(`Expected section 4, got ${sectionNumber}`);
    }

    // Section length (4 bytes, big-endian)
    let sectionLength = 0;
    for (let i = 1; i <= 4; i++) {
        sectionLength = sectionLength * 256 + data[offset + i];
    }

    // Reserved (1 byte), total number of grid points (4 bytes)
    const numberOfPoints = (data[offset + 5] << 24) | (data[offset + 6] << 16) | (data[offset + 7] << 8) | data[offset + 8];

    // Bitmap indicator (1 byte)
    const bitmapIndicator = data[offset + 9];

    const bitmapPresent = bitmapIndicator !== 255;
    const bitmapStartOffset = bitmapPresent ? offset + 10 : offset;
    const bitmapLength = bitmapPresent ? sectionLength - 9 : 0;

    return {
        sectionNumber,
        sectionLength,
        numberOfPoints,
        hasBitmap: bitmapPresent,
        bitmapStartOffset,
        bitmapLength,
    };
}

/**
 * Read bitmap bits from section 4 data.
 * Returns array of 0/1 for each grid point.
 */
export function readBitmap(data, offset, bitOffset, count) {
    const bitmap = new Int32Array(count);
    for (let i = 0; i < count; i++) {
        const byteIndex = offset + (bitOffset / 8) | 0;
        const bitIndex = 7 - (bitOffset % 8);
        bitmap[i] = (data[byteIndex] >> bitIndex) & 1;
        bitOffset++;
    }
    return { bitmap, bitOffset };
}

/**
 * Check if the bitmap indicates special bitmap handling.
 * Returns true if special bitmap is used (all or none values present).
 */
export function isSpecialBitmap(bitmap) {
    let allSet = true;
    let noneSet = true;
    for (let i = 0; i < bitmap.length; i++) {
        if (bitmap[i] === 0) allSet = false;
        if (bitmap[i] === 1) noneSet = false;
    }
    return allSet || noneSet;
}
