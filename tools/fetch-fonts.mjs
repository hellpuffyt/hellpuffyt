// Downloads Instrument Serif (SIL OFL 1.1) from the Google Fonts repository.
// Geist comes from the "geist" npm package.
import fs from 'node:fs';
const base = 'https://github.com/google/fonts/raw/main/ofl/instrumentserif/';
fs.mkdirSync('.cache/fonts', { recursive: true });
for (const f of ['InstrumentSerif-Regular.ttf', 'InstrumentSerif-Italic.ttf']) {
  const res = await fetch(base + f);
  if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
  fs.writeFileSync(`.cache/fonts/${f}`, Buffer.from(await res.arrayBuffer()));
  console.log('fetched', f);
}
