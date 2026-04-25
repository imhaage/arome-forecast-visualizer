/**
 * GRIB2 decoder – main entry point.
 *
 * Re-export all public symbols so users only need to import from 'grib2-decoder'.
 */

export { decodeGRIB2, parseGRIB2Header, walkSections, parseSection1, parseSection3, parseSection4, parseSection5 } from './decoder.js';
