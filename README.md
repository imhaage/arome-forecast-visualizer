# grib2-decoder

Browser-compatible GRIB2 decoder supporting simple & complex packing.

## Usage

```js
import { decodeGRIB2 } from './src/decoder.js';

const buffer = await fetch('weather.grib2')
  .then(r => r.arrayBuffer());

const result = decodeGRIB2(buffer);
console.log(result.header);
console.log(result.grid);
console.log(result.values.slice(0, 10));
```
