/**
 * GRIB2 decoder – main entry point.
 *
 * Re-export all public symbols so users only need to import from 'grib2-decoder'.
 */

export {
    decodeGRIB2,
    parseGRIB2Header,
    iterateGRIB2Messages,
    walkSections,
    parseSection1,
    parseSection3,
    parseSection4,
    parseSection5,
    parseSection6,
} from './decoder.js';
export { lookupParameter, PARAMETERS } from './parameters.js';
