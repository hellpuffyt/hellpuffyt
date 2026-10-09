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

/*
 * The mark: a geometric lowercase h on a 4-unit grid inside a 96 box.
 * Stem and arch share one 12-unit stroke; the emerald square ("the lit pixel")
 * sits in the leg's column at ascender height, so the glyph and the pixel
 * together describe a closed rectangle: structure plus the one idea that ships.
 */
export const MARK = {
  box: 96,
  // Single outline of the whole glyph. Outer arch r=20 centred on x=48,
  // inner counter r=8, both springing at y=56.
  outline: 'M28 16H40V37.67A20 20 0 0 1 68 56V80H56V56A8 8 0 0 0 40 56V80H28Z',
  pixel: { x: 56, y: 16, w: 12, h: 12 },
};

export function markGroup({ fg = color.paper, accent = color.emerald, x = 0, y = 0, size = 96, attrs = '' } = {}) {
  const s = r(size / MARK.box);
  const p = MARK.pixel;
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${s})" ${attrs}>` +
    `<path fill="${fg}" d="${MARK.outline}"/>` +
    `<rect fill="${accent}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"/>` +
    `</g>`;
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
