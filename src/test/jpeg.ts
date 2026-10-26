// Asset-shape assertions for tests: read a shipped JPEG's SOF marker to get
// its pixel dimensions without an image library. This pins an asset's aspect
// ratio to the tile it renders in — the guard that would have caught the
// portrait-into-landscape crop which once hid the IdeaFusion gallery photo
// behind a featureless ceiling.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Reads width/height straight from a file under public/. */
export function jpegSize(file: string): { w: number; h: number } {
  const buf = readFileSync(resolve(process.cwd(), 'public', file));
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0–SOF15 except DHT (C4) / JPG (C8) / DAC (CC), which aren't frames.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error(`no SOF marker in ${file}`);
}
