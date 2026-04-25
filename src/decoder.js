/**
 * GRIB2 Decoder – browser-compatible pure JavaScript implementation.
 *
 * Based on the eccodes C library source code and the WMO FM-92 GRIB Edition 2 specification.
 *
 * Supported encoding types:
 *   0 – Simple packing (most common)
 *   40 – Constant (all values equal)
 *   254 – Grid IEEE (32-bit floats, big-endian)
 *   255 – Missing data
 *
 * GRIB2 message structure:
 *   Section 0: "GRIB" + edition + message length (8 bytes)
 *   Section 1: Identification (centre, time, discipline, etc.)
 *   Section 2: Product Definition Template
 *   Section 3: Grid Definition Template (Ni, Nj, lat/lon, flags)
 *   Section 4: Bitmap (1 bit per grid point)
 *   Section 5: Representation of Data (packing type + parameters)
 *   Section 6: Local Use (optional)
 *   Section 7: Packed data + "7777" ending marker
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

function u16be(data, i) { return (data[i] << 8) | data[i + 1]; }
function u24be(data, i) { return (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]; }
function u32be(data, i) { return ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0; }
function i32be(data, i) {
    const v = (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
    return v >= 0x80000000 ? v - 0x100000000 : v;
}

// ─── Section walker ───────────────────────────────────────────────────────────

/**
 * Walk the raw GRIB2 byte stream and extract section boundaries.
 */
function walkSections(data) {
    const sig = String.fromCharCode(data[0], data[1], data[2], data[3]);
    if (sig !== 'GRIB') throw new Error('Invalid GRIB signature');

    const edition = data[4];
    if (edition !== 2) throw new Error(`Expected GRIB2 edition, got ${edition}`);

    const messageLength = u24be(data, 5);

    const sections = {};
    let offset = 8;

    for (let s = 1; s <= 8; s++) {
        if (offset + 4 > data.length) break;

        const secNum = data[offset];
        const secLen = u24be(data, offset + 1);
        const dataOff = offset + 4;

        sections[secNum] = {
            number: secNum,
            length: secLen,
            dataOffset: dataOff,
            raw: data.slice(dataOff, dataOff + secLen),
        };

        offset = dataOff + secLen;
        if (secNum === 7) break;
    }

    // Find "7777" ending marker
    const s7 = sections[7];
    let dataOffset = s7 ? s7.dataOffset : offset;
    let dataLength = -1;

    for (let i = dataOffset; i <= data.length - 4; i++) {
        if (data[i] === 0x77 && data[i + 1] === 0x77 && data[i + 2] === 0x77 && data[i + 3] === 0x77) {
            dataLength = i - dataOffset;
            break;
        }
    }

    if (dataLength < 0) dataLength = messageLength - (dataOffset - 8) - 4;
    if (dataLength < 0) dataLength = 0;

    return { edition, messageLength, sections, dataOffset, dataLength };
}

// ─── Section 1: Identification ────────────────────────────────────────────────

/**
 * Parse Section 1 (Identification).
 *
 * Layout (per GRIB2 spec):
 *   [Table 1.0: 1 byte] [Centre: 2 bytes BE] [Sub-centre: 2 bytes BE]
 *   [Reference time (modified Julian day): 1 byte]
 *   [Year: 2 bytes BE] [Month: 1 byte] [Day: 1 byte] [Hour: 1 byte] [Minute: 1 byte]
 *   [Table 1.1: 1 byte] [Table 1.2: 1 byte] [Discipline: 1 byte] [Num Octet 8 appended: 1 byte]
 */
function parseSection1(raw) {
    if (!raw || raw.length < 16) return {};

    return {
        table1_0: raw[0],
        centre: u16be(raw, 1),
        subCentre: u16be(raw, 3),
        referenceTime: raw[5],
        year: u16be(raw, 6),
        month: raw[8],
        day: raw[9],
        hour: raw[10],
        minute: raw[11],
        table1_1: raw[12],
        table1_2: raw[13],
        discipline: raw[14],
        numOctet8Appended: raw[15],
    };
}

// ─── Section 3: Grid Definition ───────────────────────────────────────────────

/**
 * Parse Section 3 (Grid Definition Template 0.0 – lat/lon, regular Earth).
 *
 * Layout:
 *   [Ni: 2 bytes BE] [Nj: 2 bytes BE] [Total points: 4 bytes BE]
 *   [Reference position: 1 byte] [Lat1: 4 bytes BE signed] [Lon1: 4 bytes BE signed]
 *   [Lat2: 4 bytes BE signed] [Lon2: 4 bytes BE signed]
 *   [Flags: 1 byte] [Rotation angle?: 4 bytes BE signed]
 *   [Dx: 4 bytes BE] [Dy: 4 bytes BE]
 *   ... more fields possible
 *
 * Flags byte:
 *   bits 0-2: scan mode (7 = normal, 11 = j scans negatively, etc.)
 *   bit 4: boustrophedic order
 *   bit 5: rotation applied
 */
function parseSection3(raw) {
    const result = {
        totalPoints: 0,
        ni: 0,
        nj: 0,
        latitudeOfFirstPoint: 0,
        longitudeOfFirstPoint: 0,
        latitudeOfLastPoint: 0,
        longitudeOfLastPoint: 0,
        scanMode: 0,
        rotationApplied: false,
        boustrophedic: false,
        dx: 0,
        dy: 0,
    };

    if (!raw || raw.length < 32) return result;

    result.ni = u16be(raw, 0);
    result.nj = u16be(raw, 2);
    result.totalPoints = result.ni * result.nj;

    // Bytes 4-7: total points field (check if present)
    const totalField = u32be(raw, 4);
    if (totalField > 0 && totalField !== result.ni * result.nj) {
        result.totalPoints = totalField;
    }

    // Byte 8: reference position
    const refPos = raw[8] !== undefined ? raw[8] : 0;

    // Bytes 9-22: coordinates (signed, 10^-6 degrees)
    result.latitudeOfFirstPoint = i32be(raw, 9) / 1000000;
    result.longitudeOfFirstPoint = i32be(raw, 13) / 1000000;
    result.latitudeOfLastPoint = i32be(raw, 17) / 1000000;
    result.longitudeOfLastPoint = i32be(raw, 21) / 1000000;

    // Byte 25: flags
    if (raw.length > 25) {
        const flags = raw[25];
        result.scanMode = flags & 0x07;
        result.rotationApplied = !!(flags & 0x20);
        result.boustrophedic = !!(flags & 0x10);
    }

    // If rotation applied, byte 26-29: angle
    if (result.rotationApplied && raw.length > 29) {
        result.angleOfRotation = i32be(raw, 26) / 1000000;
    }

    // Dx, Dy (meters) at byte 30 (or 34 if rotated)
    const dxOff = result.rotationApplied ? 34 : 30;
    if (raw.length > dxOff) {
        result.dx = u32be(raw, dxOff);
    }
    if (raw.length > dxOff + 4) {
        result.dy = u32be(raw, dxOff + 4);
    }

    return result;
}

// ─── Section 4: Bitmap ────────────────────────────────────────────────────────

/**
 * Parse Section 4 (Bitmap).
 *
 * Layout:
 *   [Number of points: 4 bytes BE] [Bitmap indicator: 1 byte]
 *   [Bitmap bytes: (N+7)/8 bytes, 1 bit per point]
 *
 * Bitmap indicator:
 *   255 = no bitmap (all values present)
 *   0-254 = bitmap present, encoded as 1-bit flags
 *   Value 0 = missing value, value 1 = value present
 */
function parseSection4(raw) {
    const result = {
        numberOfPoints: 0,
        hasBitmap: true,
        bitmapIndicator: 0,
    };

    if (!raw || raw.length < 5) return result;

    // In buildMessage, numberOfPoints is at raw[0..3]
    result.numberOfPoints = u32be(raw, 0);
    // bitmapIndicator at raw[4]
    result.bitmapIndicator = raw[4];
    result.hasBitmap = result.bitmapIndicator !== 255;

    if (!result.hasBitmap) {
        return result;
    }

    // Bitmap data starts at byte 5
    const bitmapBits = new Uint8Array(result.numberOfPoints);
    let bitOffset = 0;

    for (let i = 0; i < result.numberOfPoints; i++) {
        const byteIdx = 5 + (bitOffset >>> 3);
        const bitIdx = 7 - (bitOffset & 7);
        if (byteIdx < raw.length) {
            bitmapBits[i] = (raw[byteIdx] >> bitIdx) & 1;
        }
        bitOffset++;
    }

    result.bitmap = bitmapBits;
    return result;
}

// ─── Section 5: Representation of Data ────────────────────────────────────────

/**
 * Parse Section 5 (Representation of Data, Template 0 – Simple Packing).
 *
 * Layout:
 *   [Type of original field: 1 byte] [Type of processed field: 1 byte]
 *   [Type of representation: 1 byte]
 *   [Bits & bytes for reference value: 1 byte]
 *   [Reference value R0: N bytes]
 *   [Bits & bytes for decimal scale factor: 1 byte]
 *   [Decimal scale factor Kdec: N bytes]
 *   [Bits & bytes for binary scale factor: 1 byte]
 *   [Binary scale factor Kbin: N bytes]
 *   [Bits & bytes for bits per value: 1 byte]
 *   [Bits per value: 1 byte]
 *   [Number of points: 4 bytes BE]
 *   ...
 *
 * The "Bits & bytes" field: upper nibble = number of bytes, lower nibble = number of bits.
 * For scaling factors, the lower nibble typically gives the exponent (for decimal scale factor)
 * or the binary exponent (for binary scale factor).
 */
function parseSection5(raw) {
    const result = {
        representationType: 0,
        referenceValue: 0,
        decimalScaleFactor: 0,
        binaryScaleFactor: 0,
        bitsPerValue: 8,
        numberOfPoints: 0,
    };

    if (!raw || raw.length < 4) return result;

    // Bytes 0-2: original field type, processed field type, representation type
    result.representationType = raw[2];

    if (result.representationType === 0) {
        // Simple packing - parse according to the GRIB2 spec
        const refBb = raw[3];
        const decBb = raw[8];
        const binBb = raw[12];
        const bpvBb = raw[16];

        // Reference value: 4 bytes BE starting at byte 4
        result.referenceValue = u32be(raw, 4);

        // Decimal scale factor:
        // The "Bits & bytes" descriptor in byte 8 (upper nibble = byte count, lower nibble = bit count)
        // When byte count is 0 (as in the example), value is stored in the lower nibble of that byte
        const decNumBytes = decBb >>> 4;
        if (decNumBytes === 0) {
            result.decimalScaleFactor = decBb & 0x0F;
        } else {
            result.decimalScaleFactor = i32be(raw, 9);
        }

        // Binary scale factor:
        const binNumBytes = binBb >>> 4;
        if (binNumBytes === 0) {
            result.binaryScaleFactor = binBb & 0x0F;
        } else {
            result.binaryScaleFactor = i32be(raw, 13);
        }

        // Bits per value:
        result.bitsPerValue = raw[17];

        // Number of points:
        result.numberOfPoints = u32be(raw, 18);
    } else if (result.representationType === 40) {
        // Constant value
        result.referenceValue = u32be(raw, 8);
        result.decimalScaleFactor = raw[13];
        result.numberOfPoints = u32be(raw, 18);
    } else if (result.representationType === 254) {
        // IEEE 754 single precision
        result.bitSize = raw[8];
        result.numberOfPoints = u32be(raw, 18);
    } else if (result.representationType === 255) {
        result.numberOfPoints = u32be(raw, 18);
    }

    return result;
}

// ─── Data decoding ────────────────────────────────────────────────────────────

/**
 * Read n bits from the bitstream starting at bitOffset[0].
 * bitOffset is a mutable array for in-place updates.
 * Big-endian bit order (MSB first), as specified by GRIB2.
 */
function readBits(data, bitOffset, nBits) {
    let value = 0;
    for (let i = 0; i < nBits; i++) {
        const byteIdx = bitOffset[0] >>> 3;
        const bitIdx = 7 - (bitOffset[0] & 7);
        value = (value << 1) | ((data[byteIdx] >> bitIdx) & 1);
        bitOffset[0]++;
    }
    return value >>> 0; // ensure unsigned
}

/**
 * Decode a GRIB2 message into structured output.
 *
 * @param {ArrayBuffer} buffer - GRIB2 message as ArrayBuffer
 * @returns {{ header, grid, values, bitmap }}
 */
export function decodeGRIB2(buffer) {
    const data = new Uint8Array(buffer);

    // 1. Walk sections
    const sections = walkSections(data);

    // 2. Parse Section 1
    const s1 = sections.sections[1] ? parseSection1(sections.sections[1].raw) : {};

    // 3. Parse Section 3
    const s3 = sections.sections[3] ? parseSection3(sections.sections[3].raw) : {};

    // 4. Parse Section 4 (bitmap)
    const s4 = sections.sections[4] ? parseSection4(sections.sections[4].raw) : null;

    // 5. Parse Section 5
    const s5 = sections.sections[5] ? parseSection5(sections.sections[5].raw) : null;

    if (!s5) throw new Error('Section 5 not found');

    // Total number of grid points
    const numPoints = s3.totalPoints || s4?.numberOfPoints || s5.numberOfPoints || 0;

    // 6. Decode data values
    let values = new Float64Array(numPoints);
    let bitmap = s4?.bitmap || null;

    const dataStart = sections.dataOffset;
    const dataEnd = sections.dataOffset + sections.dataLength;

    if (numPoints === 0) {
        return {
            header: { ...s1, messageLength: sections.messageLength },
            grid: s3,
            values: new Float64Array(0),
            bitmap: null,
        };
    }

    switch (s5.representationType) {
        case 0: {
            // Simple packing
            const s = Math.pow(10, s5.decimalScaleFactor);
            const d = Math.pow(2, -s5.binaryScaleFactor);
            const bpv = s5.bitsPerValue;
            const refVal = s5.referenceValue;
            const bitPos = [dataStart];

            for (let i = 0; i < numPoints; i++) {
                const coded = readBits(data, bitPos, bpv);
                values[i] = ((coded * s) + refVal) * d;
                if (bitmap && bitmap[i] === 0) {
                    values[i] = -1e100; // missing
                }
            }
            break;
        }

        case 40: {
            // Constant value
            const s = Math.pow(10, s5.decimalScaleFactor);
            const val = s5.referenceValue * s;
            values.fill(val);
            break;
        }

        case 254: {
            // IEEE 754 single precision, big-endian
            const view = new DataView(buffer);
            for (let i = 0; i < numPoints; i++) {
                values[i] = view.getFloat32(dataStart + i * 4, false); // false = big-endian
            }
            break;
        }

        case 255: {
            // All values missing
            values.fill(-1e100);
            break;
        }

        default: {
            throw new Error(`Unsupported representation type: ${s5.representationType}`);
        }
    }

    return {
        header: {
            ...s1,
            messageLength: sections.messageLength,
        },
        grid: s3,
        values,
        bitmap,
    };
}

/**
 * Parse only the header of a GRIB2 message (fast, no data decoding).
 *
 * @param {ArrayBuffer} buffer - GRIB2 message buffer
 * @returns {{ header, grid, dataOffset, dataLength, messageLength }}
 */
export function parseGRIB2Header(buffer) {
    const data = new Uint8Array(buffer);
    const sections = walkSections(data);

    const s1 = sections.sections[1] ? parseSection1(sections.sections[1].raw) : {};
    const s3 = sections.sections[3] ? parseSection3(sections.sections[3].raw) : {};

    return {
        header: { ...s1, messageLength: sections.messageLength },
        grid: s3,
        dataOffset: sections.dataOffset,
        dataLength: sections.dataLength,
    };
}

export { parseSection1, parseSection3, parseSection4, parseSection5, walkSections };
