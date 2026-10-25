// Shared brand primitives: colour tokens, the mark geometry and text-to-path.
// Every asset converts type to outlines because SVGs embedded through <img>
// on GitHub cannot load web fonts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

export const color = {
  ink: '#0C0D0D',        // near-black charcoal, primary background
  graphite: '#17191A',   // raised surfaces
  line: '#2A2E2D',       // hairlines on dark
  steel: '#5E6562',      // tertiary text on dark
  silver: '#A3AAA6',     // secondary text on dark
  paper: '#EEEAE2',      // warm off-white, primary text on dark
  emerald: '#3FBF8A',    // accent on dark
  forest: '#14724F',     // accent on light
  champagne: '#C8B48A',  // rare secondary accent
  inkText: '#14161A',    // primary text on light
  inkMuted: '#5B615E',   // secondary text on light
  lineLight: '#D9D6CF',  // hairlines on light
};

const fontFiles = {
  serif: path.join(root, '.cache/fonts/InstrumentSerif-Regular.ttf'),
  serifItalic: path.join(root, '.cache/fonts/InstrumentSerif-Italic.ttf'),
  sans: path.join(root, 'node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf'),
  sansMedium: path.join(root, 'node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf'),
  sansSemi: path.join(root, 'node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf'),
  mono: path.join(root, 'node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf'),
  monoMedium: path.join(root, 'node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.ttf'),
};

const fontCache = new Map();
export function font(name) {
  if (!fontCache.has(name)) {
    const file = fontFiles[name];
    if (!fs.existsSync(file)) {
      throw new Error(`Missing font ${file}. Run "node fetch-fonts.mjs" first.`);
    }
    fontCache.set(name, opentype.parse(fs.readFileSync(file).buffer.slice(0)));
  }
  return fontCache.get(name);
}

const r = (n) => Math.round(n * 100) / 100;

// Lays out a string with kerning and tracking (em units, e.g. -0.02).
function layout(f, text, size, tracking = 0) {
  const glyphs = f.stringToGlyphs(text);
  const scale = size / f.unitsPerEm;
  const placed = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    placed.push({ g, x });
    x += g.advanceWidth * scale;
    if (i < glyphs.length - 1) {
      x += f.getKerningValue(g, glyphs[i + 1]) * scale;
      x += tracking * size;
    }
  });
  return { placed, width: x };
}

export function measure(fontName, text, size, tracking = 0) {
  return layout(font(fontName), text, size, tracking).width;
}

// Returns path data for `text` with its baseline at y. anchor: start | middle | end.
export function textPath(fontName, text, { x = 0, y = 0, size = 16, tracking = 0, anchor = 'start' } = {}) {
  const f = font(fontName);
  const { placed, width } = layout(f, text, size, tracking);
  const ox = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  return placed
    .map(({ g, x: gx }) => g.getPath(ox + gx, y, size).toPathData(2))
    .filter(Boolean)
    .join('');
}

export function text(fontName, str, opts = {}) {
  const { fill = color.paper, attrs = '', ...rest } = opts;
  return `<path fill="${fill}" ${attrs} d="${textPath(fontName, str, rest)}"/>`;
}

import { EAGLE, WORD, POTRACE_TRANSFORM } from './logo.mjs';

/*
 * The mark: the owner's eagle (tools/lib/logo.mjs), drawn in one colour.
 * `size` is the rendered width; height follows the artwork's proportions.
 */
export const MARK = { w: EAGLE.w, h: EAGLE.h, ratio: EAGLE.h / EAGLE.w };

function traced(art, { fg, x, y, width, attrs = '' }) {
  const s = +(width / art.w).toFixed(6); // full precision: art boxes are ~2500 units wide
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${s})" ${attrs}>` +
    `<path fill="${fg}" transform="${POTRACE_TRANSFORM(art.h)}" d="${art.d}"/></g>`;
}

export function markGroup({ fg = color.paper, x = 0, y = 0, size = 96, attrs = '' } = {}) {
  return traced(EAGLE, { fg, x, y, width: size, attrs });
}

/** The supplied HELLPUFF wordmark (spaced capitals), `size` = rendered width. */
export const WORDMARK = { ratio: WORD.h / WORD.w };
export function wordmarkGroup({ fg = color.paper, x = 0, y = 0, size = 320, attrs = '' } = {}) {
  return traced(WORD, { fg, x, y, width: size, attrs });
}

/**
 * The supplied lockup: eagle above the wordmark, spaced exactly as in the original artwork.
 * Both traced crops carry the same 4 px padding, so offsets are measured crop to crop in the
 * 500 px source: eagle crop 208 px wide (x 146, bottom 314), wordmark crop 186 px (x 158, top 342).
 */
const LOCKUP = { word: 186 / 208, dx: 12 / 208, gap: 28 / 208 };
export function lockupStacked({ fg = color.paper, x = 0, y = 0, width = 200 } = {}) {
  const eh = width * MARK.ratio;
  const ww = width * LOCKUP.word;
  const wy = y + eh + width * LOCKUP.gap;
  return {
    w: width, h: wy - y + ww * WORDMARK.ratio,
    body: markGroup({ fg, x, y, size: width }) + wordmarkGroup({ fg, x: x + width * LOCKUP.dx, y: wy, size: ww }),
  };
}

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function svgDoc({ w, h, title, desc, body, defs = '', style = '' }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="${id}-title ${id}-desc">` +
    `<title id="${id}-title">${xml(title)}</title><desc id="${id}-desc">${xml(desc)}</desc>` +
    (style ? `<style>${style}</style>` : '') +
    (defs ? `<defs>${defs}</defs>` : '') +
    body + `</svg>\n`;
}
