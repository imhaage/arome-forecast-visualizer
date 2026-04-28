/**
 * WMO GRIB2 parameter table — embedded subset of FM-92 code tables 4.1/4.2.
 *
 * Key format: "<discipline>:<parameterCategory>:<parameterNumber>"
 * Derived from eccodes/definitions/grib2/tables/32/4.2.*.*.table
 *
 * Browser-compatible: no I/O, pure JS object literal.
 *
 * @type {Record<string, { name: string, shortName: string, units: string }>}
 */
const PARAMETERS = {
    // ── Discipline 0: Meteorological ────────────────────────────────────────────

    // Category 0: Temperature
    '0:0:0':  { shortName: 't',     name: 'Temperature',                         units: 'K'         },
    '0:0:1':  { shortName: 'tv',    name: 'Virtual temperature',                  units: 'K'         },
    '0:0:2':  { shortName: 'pt',    name: 'Potential temperature',                units: 'K'         },
    '0:0:4':  { shortName: 'tmax',  name: 'Maximum temperature',                  units: 'K'         },
    '0:0:5':  { shortName: 'tmin',  name: 'Minimum temperature',                  units: 'K'         },
    '0:0:6':  { shortName: 'td',    name: 'Dewpoint temperature',                 units: 'K'         },
    '0:0:17': { shortName: 'skt',   name: 'Skin temperature',                     units: 'K'         },
    '0:0:18': { shortName: 'tsn',   name: 'Snow temperature (top of snow)',       units: 'K'         },
    '0:0:21': { shortName: 'atmp',  name: 'Apparent temperature',                 units: 'K'         },
    '0:0:27': { shortName: 'twb',   name: 'Wet-bulb temperature',                 units: 'K'         },

    // Category 1: Moisture
    '0:1:0':  { shortName: 'q',     name: 'Specific humidity',                    units: 'kg kg-1'   },
    '0:1:1':  { shortName: 'r',     name: 'Relative humidity',                    units: '%'         },
    '0:1:3':  { shortName: 'pwat',  name: 'Precipitable water',                   units: 'kg m-2'    },
    '0:1:7':  { shortName: 'prate', name: 'Precipitation rate',                   units: 'kg m-2 s-1'},
    '0:1:8':  { shortName: 'tp',    name: 'Total precipitation',                  units: 'kg m-2'    },
    '0:1:10': { shortName: 'sr',    name: 'Snowfall rate water equivalent',       units: 'kg m-2 s-1'},
    '0:1:11': { shortName: 'sd',    name: 'Snow depth',                           units: 'm'         },
    '0:1:13': { shortName: 'swe',   name: 'Water equiv of accum snow depth',      units: 'kg m-2'    },
    '0:1:22': { shortName: 'clwmr', name: 'Cloud mixing ratio',                   units: 'kg kg-1'   },
    '0:1:65': { shortName: 'sshf',  name: 'Sensible heat net flux',               units: 'W m-2'     },
    '0:1:66': { shortName: 'slhf',  name: 'Latent heat net flux',                 units: 'W m-2'     },

    // Category 2: Momentum / Wind
    '0:2:0':  { shortName: 'wdir',  name: 'Wind direction (from which blowing)',  units: 'degree true'},
    '0:2:1':  { shortName: 'wspd',  name: 'Wind speed',                           units: 'm s-1'     },
    '0:2:2':  { shortName: 'u',     name: 'U-component of wind',                  units: 'm s-1'     },
    '0:2:3':  { shortName: 'v',     name: 'V-component of wind',                  units: 'm s-1'     },
    '0:2:4':  { shortName: 'strm',  name: 'Stream function',                      units: 'm2 s-1'    },
    '0:2:8':  { shortName: 'w',     name: 'Vertical velocity (pressure)',          units: 'Pa s-1'    },
    '0:2:9':  { shortName: 'wz',    name: 'Vertical velocity (geometric)',         units: 'm s-1'     },
    '0:2:10': { shortName: 'absv',  name: 'Absolute vorticity',                   units: 's-1'       },
    '0:2:12': { shortName: 'relv',  name: 'Relative vorticity',                   units: 's-1'       },
    '0:2:14': { shortName: 'pvort', name: 'Potential vorticity',                  units: 'K m2 kg-1 s-1'},
    '0:2:20': { shortName: 'bdis',  name: 'Boundary layer dissipation',           units: 'W m-2'     },
    '0:2:21': { shortName: 'maxws', name: 'Maximum wind speed',                   units: 'm s-1'     },
    '0:2:22': { shortName: 'gust',  name: 'Wind speed (gust)',                    units: 'm s-1'     },
    '0:2:23': { shortName: 'ugust', name: 'U-component of wind (gust)',           units: 'm s-1'     },
    '0:2:24': { shortName: 'vgust', name: 'V-component of wind (gust)',           units: 'm s-1'     },

    // Category 3: Mass / Pressure
    '0:3:0':  { shortName: 'p',     name: 'Pressure',                             units: 'Pa'        },
    '0:3:1':  { shortName: 'msl',   name: 'Pressure reduced to MSL',              units: 'Pa'        },
    '0:3:2':  { shortName: 'ptend', name: 'Pressure tendency',                    units: 'Pa s-1'    },
    '0:3:4':  { shortName: 'z',     name: 'Geopotential',                         units: 'm2 s-2'    },
    '0:3:5':  { shortName: 'gh',    name: 'Geopotential height',                  units: 'gpm'       },
    '0:3:10': { shortName: 'den',   name: 'Density',                              units: 'kg m-3'    },
    '0:3:25': { shortName: 'lnsp',  name: 'Natural log of pressure',              units: 'Numeric'   },

    // Category 4: Short-wave radiation
    '0:4:0':  { shortName: 'nswrs', name: 'Net short-wave radiation flux (surface)', units: 'W m-2'  },
    '0:4:1':  { shortName: 'nswrt', name: 'Net short-wave radiation flux (TOA)',  units: 'W m-2'     },
    '0:4:7':  { shortName: 'dswrf', name: 'Downward short-wave radiation flux',   units: 'W m-2'     },
    '0:4:9':  { shortName: 'ssr',   name: 'Net solar radiation',                  units: 'J m-2'     },

    // Category 5: Long-wave radiation
    '0:5:3':  { shortName: 'nlwrs', name: 'Net long-wave radiation flux (surface)', units: 'W m-2'   },
    '0:5:4':  { shortName: 'nlwrt', name: 'Net long-wave radiation flux (TOA)',   units: 'W m-2'     },
    '0:5:5':  { shortName: 'dlwrf', name: 'Downward long-wave radiation flux',    units: 'W m-2'     },

    // Category 6: Cloud
    '0:6:1':  { shortName: 'tcc',   name: 'Total cloud cover',                    units: '%'         },
    '0:6:3':  { shortName: 'lcc',   name: 'Low cloud cover',                      units: '%'         },
    '0:6:4':  { shortName: 'mcc',   name: 'Medium cloud cover',                   units: '%'         },
    '0:6:5':  { shortName: 'hcc',   name: 'High cloud cover',                     units: '%'         },
    '0:6:6':  { shortName: 'cw',    name: 'Cloud water',                          units: 'kg m-2'    },
    '0:6:11': { shortName: 'ctp',   name: 'Cloud top pressure',                   units: 'Pa'        },
    '0:6:12': { shortName: 'ctt',   name: 'Cloud top temperature',                units: 'K'         },

    // Category 7: Stability indices
    '0:7:0':  { shortName: 'cape',  name: 'CAPE',                                 units: 'J kg-1'    },
    '0:7:1':  { shortName: 'cin',   name: 'Convective inhibition',                units: 'J kg-1'    },
    '0:7:6':  { shortName: 'bli',   name: 'Best lifted index',                    units: 'K'         },

    // ── Discipline 10: Oceanographic ────────────────────────────────────────────

    // Category 0: Waves
    '10:0:3': { shortName: 'swh',   name: 'Significant height of wind waves',     units: 'm'         },
    '10:0:5': { shortName: 'mpww',  name: 'Mean period of wind waves',            units: 's'         },
};

/**
 * Look up a GRIB2 parameter by discipline, category, and number.
 *
 * @param {number} discipline        - From Section 0 (0=Meteorological, 10=Oceanographic…)
 * @param {number} parameterCategory - From Section 4, template offset +0
 * @param {number} parameterNumber   - From Section 4, template offset +1
 * @returns {{ name: string, shortName: string, units: string }}
 */
export function lookupParameter(discipline, parameterCategory, parameterNumber) {
    const key = `${discipline}:${parameterCategory}:${parameterNumber}`;
    return PARAMETERS[key] ?? {
        name:      `Unknown (D${discipline} C${parameterCategory} N${parameterNumber})`,
        shortName: `par_d${discipline}_c${parameterCategory}_n${parameterNumber}`,
        units:     'unknown',
    };
}

export { PARAMETERS };
