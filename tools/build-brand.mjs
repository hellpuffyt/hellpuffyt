// Generates every brand asset in ../assets from the primitives in lib/brand.mjs.
// Usage: npm install && node fetch-fonts.mjs && node build-brand.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import { color as c, text, measure, markGroup, MARK, svgDoc } from './lib/brand.mjs';

const require = createRequire(import.meta.url);
const OUT = path.resolve('..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const written = [];
function write(name, svg) {
  fs.writeFileSync(path.join(OUT, name), svg);
  written.push(name);
}
function png(name, svg, width) {
  const img = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: 'rgba(0,0,0,0)' }).render();
  fs.writeFileSync(path.join(OUT, name), img.asPng());
  written.push(name);
}

const reduce = '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
const ease = 'cubic-bezier(.22,.8,.18,1)';

/* ---------- mark ---------- */
for (const [name, fg, accent, label] of [
  ['hellpuff-mark.svg', c.paper, c.emerald, 'for dark backgrounds'],
  ['hellpuff-mark-ink.svg', c.inkText, c.forest, 'for light backgrounds'],
]) {
  write(name, svgDoc({
    w: 96, h: 96, title: 'hellpuff mark',
    desc: `Geometric lowercase h with an emerald square at ascender height, ${label}.`,
    body: markGroup({ fg, accent }),
  }));
}

/* ---------- wordmark ---------- */
function wordmark({ fg, accent, size = 64 }) {
  const tracking = -0.035;
  const w = measure('sansMedium', 'hellpuff', size, tracking);
  const pad = size * 0.1;
  const px = size * 0.13;                // pixel = roughly one and a half stems
  const asc = size * 0.735;              // Geist ascender height
  const width = Math.ceil(pad * 2 + w + px * 1.6);
  const height = Math.ceil(size * 1.22);
  const base = Math.round(size * 0.93);
  const body =
    text('sansMedium', 'hellpuff', { x: pad, y: base, size, tracking, fill: fg }) +
    `<rect fill="${accent}" x="${(pad + w + px * 0.6).toFixed(2)}" y="${(base - asc).toFixed(2)}" width="${px.toFixed(2)}" height="${px.toFixed(2)}"/>`;
  return { width, height, body };
}
for (const [name, fg, accent] of [
  ['hellpuff-wordmark.svg', c.paper, c.emerald],
  ['hellpuff-wordmark-ink.svg', c.inkText, c.forest],
]) {
  const wm = wordmark({ fg, accent });
  write(name, svgDoc({ w: wm.width, h: wm.height, title: 'hellpuff wordmark', desc: 'The word hellpuff set in Geist Medium with an emerald square after the final f.', body: wm.body }));
}

/* ---------- lockup (mark + wordmark) ---------- */
function lockup({ x, y, size, fg = c.paper, accent = c.emerald }) {
  // size = mark box size; the wordmark baseline sits on the mark's baseline.
  const s = size / MARK.box;
  return markGroup({ x, y, size, fg, accent }) +
    text('sansMedium', 'hellpuff', { x: x + 86 * s, y: y + 80 * s, size: size * 0.5, tracking: -0.03, fill: fg });
}

/* ---------- construction drawing of the mark (banner hero + animation) ---------- */
function construction({ x, y, size, animate }) {
  const s = size / MARK.box;
  const P = (v) => (v * s).toFixed(2);
  const hair = (d) => `<path class="guide" d="${d}" stroke="${c.line}" stroke-width="1"/>`;
  const ext = 18; // guides overshoot the glyph box (mark units)
  const guides = [
    // horizontals: ascender 16, arch top 36, spring 56, baseline 80
    ...[16, 36, 56, 80].map((v) => hair(`M${P(28 - ext)} ${P(v)}H${P(68 + ext)}`)),
    // verticals: stem and leg edges
    ...[28, 40, 56, 68].map((v) => hair(`M${P(v)} ${P(16 - ext)}V${P(80 + ext)}`)),
  ].join('');
  const circles =
    `<circle class="guide" cx="${P(48)}" cy="${P(56)}" r="${P(20)}" stroke="${c.line}" stroke-dasharray="3 5"/>` +
    `<circle class="guide" cx="${P(48)}" cy="${P(56)}" r="${P(8)}" stroke="${c.line}" stroke-dasharray="3 5"/>`;
  const note = (str, nx, ny, anchor = 'start') =>
    text('mono', str, { x: nx * s, y: ny * s, size: Math.max(11, size * 0.034), tracking: 0.06, anchor, fill: c.steel, attrs: 'class="note"' });
  const notes =
    note('12u', 34, 16 - ext - 3, 'middle') +
    note('r 20', 68 + ext + 2, 37) +
    note('r 8', 48, 70, 'middle') +
    note('base', 28 - ext - 2, 79, 'end') +
    note('asc', 28 - ext - 2, 19, 'end');
  const p = MARK.pixel;
  const glyph =
    `<path class="fill" fill="${c.paper}" d="${MARK.outline}" transform="scale(${s.toFixed(4)})"/>` +
    (animate
      ? `<path class="outline" d="${MARK.outline}" transform="scale(${s.toFixed(4)})" stroke="${c.paper}" stroke-width="${(1.4 / s).toFixed(3)}" pathLength="1"/>`
      : '') +
    `<rect class="glow" x="${P(p.x - 6)}" y="${P(p.y - 6)}" width="${P(p.w + 12)}" height="${P(p.h + 12)}" fill="url(#pixelGlow)" opacity="${animate ? 1 : 0}"/>` +
    `<rect class="pixel" x="${P(p.x)}" y="${P(p.y)}" width="${P(p.w)}" height="${P(p.h)}" fill="${c.emerald}"/>`;
  return `<g transform="translate(${x} ${y})">${guides}${circles}${notes}${glyph}</g>`;
}

const glowDef = `<radialGradient id="pixelGlow"><stop offset="0" stop-color="${c.emerald}" stop-opacity=".55"/><stop offset="1" stop-color="${c.emerald}" stop-opacity="0"/></radialGradient>`;

// Final state is the unanimated default; keyframes only describe the "from" side,
// so reduced motion (animation:none) shows the finished mark.
const drawCSS = `
.guide{animation:fadeIn 1.1s ${ease} .1s both}
.note{animation:fadeIn .9s ${ease} 1s both}
.outline{stroke-dasharray:1;animation:draw 1.5s cubic-bezier(.65,0,.35,1) .35s both,fadeOut .6s ease 1.9s forwards}
.fill{animation:fadeIn .7s ${ease} 1.55s both}
.pixel{transform-box:fill-box;transform-origin:center;animation:drop .65s ${ease} 2.05s both}
.glow{opacity:0;animation:glow 7s ease-in-out 2.6s infinite}
@keyframes fadeIn{from{opacity:0}}
@keyframes fadeOut{to{opacity:0}}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes drop{from{opacity:0;transform:translateY(-140%)}}
@keyframes glow{0%,100%{opacity:0}45%{opacity:.9}}
@media (prefers-reduced-motion:reduce){.outline{display:none}.glow{opacity:0}}`;

/* ---------- banner ---------- */
// Tagline: "Building things / that should exist." with the last word in italic
// and the emerald square as its full stop.
export const TAGLINE = ['Building things', 'that should ', 'exist'];
const TAGLINE_TEXT = 'Building things that should exist';
function headline({ x, y1, y2, size }) {
  const [l1, lead, key] = TAGLINE;
  const leadW = measure('serif', lead, size, -0.012);
  const keyW = measure('serifItalic', key, size, -0.012);
  const dot = size * 0.085;
  return {
    line1: text('serif', l1, { x, y: y1, size, tracking: -0.012 }),
    line2: text('serif', lead, { x, y: y2, size, tracking: -0.012 }) +
      text('serifItalic', key, { x: x + leadW, y: y2, size, tracking: -0.012 }) +
      `<rect x="${(x + leadW + keyW + dot * 0.6).toFixed(2)}" y="${(y2 - dot).toFixed(2)}" width="${dot.toFixed(2)}" height="${dot.toFixed(2)}" fill="${c.emerald}"/>`,
  };
}

function banner(animate) {
  const W = 1600, H = 600, M = 80;
  const hl = headline({ x: M - 4, y1: 268, y2: 398, size: 124 });
  const labels = ['Products', 'Infrastructure', 'Security', 'AI systems'];
  let fx = M;
  const footer = labels.map((l, i) => {
    const label = l.toUpperCase();
    const out = text('mono', String(i + 1).padStart(2, '0'), { x: fx, y: 532, size: 15, tracking: 0.08, fill: c.emerald }) +
      text('mono', label, { x: fx + 32, y: 532, size: 15, tracking: 0.1, fill: c.silver });
    fx += 32 + measure('mono', label, 15, 0.1) + 48;
    return out;
  }).join('');
  const siteW = measure('mono', 'HELLPUFF.DEV', 15, 0.14);
  const css = animate ? `
.rule{transform-box:fill-box;transform-origin:left;animation:grow 1.2s ${ease} both}
.h1{animation:rise 1s ${ease} .25s both}.h2{animation:rise 1s ${ease} .42s both}
.meta{animation:fadeIn 1s ${ease} .7s both}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes rise{from{opacity:0;transform:translateY(14px)}}
${drawCSS}${reduce}` : '';
  const body =
    `<rect width="${W}" height="${H}" rx="28" fill="${c.ink}"/>` +
    `<rect x="980" y="0" width="620" height="${H}" fill="url(#heroWash)"/>` +
    `<rect width="${W - 1}" height="${H - 1}" x=".5" y=".5" rx="27.5" stroke="${c.line}"/>` +
    `<g class="meta">${lockup({ x: M - 18, y: 26, size: 72 })}` +
    text('mono', 'HELLPUFF.DEV', { x: W - M, y: 70, size: 15, tracking: 0.14, anchor: 'end', fill: c.silver }) +
    `<rect x="${(W - M - siteW - 20).toFixed(1)}" y="60" width="8" height="8" fill="${c.emerald}"/></g>` +
    `<path class="rule" d="M${M} 116H${W - M}" stroke="${c.line}"/>` +
    `<g class="h1">${hl.line1}</g><g class="h2">${hl.line2}</g>` +
    `<path class="rule" d="M${M} 480H${W - M}" stroke="${c.line}"/>` +
    `<g class="meta">${footer}` +
    text('mono', 'SOFTWARE ENGINEER', { x: W - M, y: 532, size: 15, tracking: 0.1, anchor: 'end', fill: c.steel }) + `</g>` +
    construction({ x: 1088, y: 120, size: 360, animate });
  return svgDoc({
    w: W, h: H,
    title: `hellpuff — ${TAGLINE_TEXT}`,
    desc: `Banner with the hellpuff logo, the headline "${TAGLINE_TEXT}", and a construction drawing of the h mark.`,
    defs: glowDef + `<radialGradient id="heroWash" cx=".55" cy=".5" r=".6"><stop offset="0" stop-color="${c.emerald}" stop-opacity=".07"/><stop offset="1" stop-color="${c.emerald}" stop-opacity="0"/></radialGradient>`,
    style: css, body,
  });
}
write('hellpuff-banner.svg', banner(true));
write('hellpuff-banner-static.svg', banner(false));
png('hellpuff-banner.png', banner(false), 2400);

/* ---------- logo animation (square) ---------- */
function animation(animate) {
  const S = 480;
  return svgDoc({
    w: S, h: S, title: 'hellpuff mark animation',
    desc: 'The h mark is drawn from its construction guides, filled, and completed by an emerald square.',
    defs: glowDef, style: animate ? drawCSS + reduce : '',
    body: `<rect width="${S}" height="${S}" rx="96" fill="${c.ink}"/>` + construction({ x: S * 0.09, y: S * 0.09, size: S * 0.82, animate }),
  });
}
write('hellpuff-animation.svg', animation(true));
write('hellpuff-animation-static.svg', animation(false));

/* ---------- avatar ---------- */
function avatar(size) {
  const k = size * 0.735; // glyph height = 46% of the canvas, safe inside a circle crop
  return svgDoc({
    w: size, h: size, title: 'hellpuff avatar', desc: 'The hellpuff h mark centred on charcoal.',
    body: `<rect width="${size}" height="${size}" fill="${c.ink}"/>` + markGroup({ x: (size - k) / 2, y: (size - k) / 2, size: k }),
  });
}
write('hellpuff-avatar.svg', avatar(460));
png('hellpuff-avatar.png', avatar(1024), 1024);

/* ---------- social preview (GitHub recommends 1280x640) ---------- */
function social() {
  const W = 1280, H = 640, M = 88;
  const hl = headline({ x: M - 4, y1: 340, y2: 440, size: 96 });
  return svgDoc({
    w: W, h: H, title: 'hellpuff social preview',
    desc: `hellpuff logo with the headline "${TAGLINE_TEXT}" and the site address hellpuff.dev.`,
    defs: glowDef + `<radialGradient id="wash" cx=".8" cy=".35" r=".55"><stop offset="0" stop-color="${c.emerald}" stop-opacity=".08"/><stop offset="1" stop-color="${c.emerald}" stop-opacity="0"/></radialGradient>`,
    body: `<rect width="${W}" height="${H}" fill="${c.ink}"/><rect width="${W}" height="${H}" fill="url(#wash)"/>` +
      lockup({ x: M - 20, y: 60, size: 80 }) + hl.line1 + hl.line2 +
      `<path d="M${M} 520H${W - M}" stroke="${c.line}"/>` +
      text('mono', 'GITHUB.COM/HELLPUFFYT', { x: M, y: 566, size: 17, tracking: 0.12, fill: c.silver }) +
      text('mono', 'HELLPUFF.DEV', { x: W - M, y: 566, size: 17, tracking: 0.14, anchor: 'end', fill: c.paper }) +
      construction({ x: 860, y: 96, size: 300, animate: false }),
  });
}
write('hellpuff-social-preview.svg', social());
png('hellpuff-social-preview.png', social(), 1280);

/* ---------- section headers (dark + light, swapped with <picture>) ---------- */
export const sections = [
  ['stack', '01', 'Toolkit'],
  ['products', '02', 'Products'],
  ['systems', '03', 'Systems'],
  ['focus', '04', 'Now'],
];
for (const [slug, num, title] of sections) {
  for (const [variant, fg, rule, accent] of [['dark', c.paper, c.line, c.emerald], ['light', c.inkText, c.lineLight, c.forest]]) {
    const W = 720, H = 64, size = 38, tx = 50;
    const tw = measure('serif', title, size, -0.005);
    write(`section-${slug}-${variant}.svg`, svgDoc({
      w: W, h: H, title, desc: `Section heading: ${num} ${title}.`,
      body: text('mono', num, { x: 0, y: 44, size: 16, tracking: 0.06, fill: accent }) +
        text('serif', title, { x: tx, y: 46, size, tracking: -0.005, fill: fg }) +
        `<path d="M${(tx + tw + 20).toFixed(1)} 36.5H${W - 10}" stroke="${rule}"/>` +
        `<rect x="${W - 6}" y="33.5" width="6" height="6" fill="${accent}"/>`,
    }));
  }
}

/* ---------- closing card ---------- */
function closing() {
  const W = 1600, H = 300, M = 80, hs = 64;
  const lead = 'The rest of the work lives at ';
  const lw = measure('serif', lead, hs, -0.01);
  const sw = measure('serifItalic', 'hellpuff.dev', hs, -0.01);
  const ax = M - 2 + lw + sw + 22;
  return svgDoc({
    w: W, h: H, title: 'The rest of the work lives at hellpuff.dev',
    desc: 'Closing card linking to hellpuff.dev.',
    defs: `<clipPath id="cardClip"><rect width="${W}" height="${H}" rx="28"/></clipPath><radialGradient id="cw" cx=".9" cy=".2" r=".6"><stop offset="0" stop-color="${c.emerald}" stop-opacity=".07"/><stop offset="1" stop-color="${c.emerald}" stop-opacity="0"/></radialGradient>`,
    body: `<rect width="${W}" height="${H}" rx="28" fill="${c.ink}"/><rect width="${W}" height="${H}" rx="28" fill="url(#cw)"/>` +
      `<rect width="${W - 1}" height="${H - 1}" x=".5" y=".5" rx="27.5" stroke="${c.line}"/>` +
      `<g clip-path="url(#cardClip)"><path d="${MARK.outline}" transform="translate(1180 -40) scale(5.2)" stroke="${c.line}" stroke-width="${(1 / 5.2).toFixed(3)}"/>` +
      `<rect x="${1180 + 56 * 5.2}" y="${-40 + 16 * 5.2}" width="${12 * 5.2}" height="${12 * 5.2}" stroke="${c.emerald}" stroke-opacity=".5" stroke-width="1" vector-effect="non-scaling-stroke"/></g>` +
      markGroup({ x: M - 14, y: 40, size: 64 }) +
      text('serif', lead, { x: M - 2, y: 196, size: hs, tracking: -0.01 }) +
      text('serifItalic', 'hellpuff.dev', { x: M - 2 + lw, y: 196, size: hs, tracking: -0.01, fill: c.emerald }) +
      `<path d="M${ax.toFixed(1)} 190l28-28m-20 0h20v20" stroke="${c.emerald}" stroke-width="3"/>` +
      text('mono', 'PORTFOLIO  ·  CASE STUDIES  ·  CONTACT', { x: M, y: 252, size: 15, tracking: 0.12, fill: c.steel }),
  });
}
write('hellpuff-closing.svg', closing());

/* ---------- brand guide plates ---------- */
function palette() {
  const W = 1600, H = 360, M = 64;
  const sw = [
    ['Ink', c.ink, 'Background'], ['Graphite', c.graphite, 'Surfaces'], ['Line', c.line, 'Hairlines'],
    ['Silver', c.silver, 'Secondary text'], ['Paper', c.paper, 'Primary text'],
    ['Emerald', c.emerald, 'Accent on dark'], ['Forest', c.forest, 'Accent on light'], ['Champagne', c.champagne, 'Rare accent'],
  ];
  const cw = (W - M * 2 - 16 * (sw.length - 1)) / sw.length;
  const body = sw.map(([name, hex, use], i) => {
    const x = M + i * (cw + 16);
    return `<rect x="${x.toFixed(1)}" y="${M}" width="${cw.toFixed(1)}" height="160" rx="10" fill="${hex}" stroke="${c.line}"/>` +
      text('sansMedium', name, { x, y: M + 200, size: 20, fill: c.paper }) +
      text('mono', hex.toUpperCase(), { x, y: M + 228, size: 14, tracking: 0.06, fill: c.silver }) +
      text('mono', use.toUpperCase(), { x, y: M + 252, size: 12, tracking: 0.08, fill: c.steel });
  }).join('');
  return svgDoc({ w: W, h: H, title: 'hellpuff colour palette', desc: sw.map(([n, h]) => `${n} ${h}`).join(', '), body: `<rect width="${W}" height="${H}" rx="28" fill="${c.ink}"/>${body}` });
}
write('brand-palette.svg', palette());

function typePlate() {
  const W = 1600, H = 560, M = 72;
  const label = (s, y) => text('mono', s, { x: M, y, size: 13, tracking: 0.12, fill: c.emerald });
  return svgDoc({
    w: W, h: H, title: 'hellpuff typography', desc: 'Instrument Serif for display, Geist for text and the wordmark, Geist Mono for labels.',
    body: `<rect width="${W}" height="${H}" rx="28" fill="${c.ink}"/>` +
      label('DISPLAY  —  INSTRUMENT SERIF', 84) +
      text('serif', 'Building things that should ', { x: M - 3, y: 186, size: 88, tracking: -0.012 }) +
      text('serifItalic', 'exist', { x: M - 3 + measure('serif', 'Building things that should ', 88, -0.012), y: 186, size: 88, tracking: -0.012 }) +
      `<path d="M${M} 236H${W - M}" stroke="${c.line}"/>` +
      label('TEXT + WORDMARK  —  GEIST', 284) +
      text('sansMedium', 'hellpuff', { x: M - 2, y: 352, size: 56, tracking: -0.035 }) +
      text('sans', 'Multi-tenant SaaS, systems software and security tooling.', { x: M + 300, y: 346, size: 26, fill: c.silver }) +
      `<path d="M${M} 396H${W - M}" stroke="${c.line}"/>` +
      label('LABELS  —  GEIST MONO', 444) +
      text('mono', '01  PRODUCTS     02  INFRASTRUCTURE     03  SECURITY     04  AI SYSTEMS', { x: M, y: 494, size: 20, tracking: 0.1, fill: c.silver }),
  });
}
write('brand-type.svg', typePlate());

/* ---------- toolkit strip (dark + light) ---------- */
const cfg = JSON.parse(fs.readFileSync('profile.json', 'utf8'));
const iconPath = (slug) =>
  fs.readFileSync(require.resolve(`simple-icons/icons/${slug}.svg`), 'utf8').match(/ d="([^"]+)"/)[1];
function stackStrip(fg, muted) {
  const W = 680, perRow = 7, colW = W / perRow, rowH = 92;
  const rows = Math.ceil(cfg.stack.length / perRow);
  const body = cfg.stack.map(([slug, label], i) => {
    const cx = (i % perRow) * colW + colW / 2, top = Math.floor(i / perRow) * rowH + 12;
    return `<path fill="${fg}" transform="translate(${(cx - 14).toFixed(1)} ${top}) scale(1.1667)" d="${iconPath(slug)}"/>` +
      text('mono', label, { x: cx, y: top + 60, size: 15, tracking: 0, anchor: 'middle', fill: muted });
  }).join('');
  return svgDoc({ w: W, h: rows * rowH, title: 'Toolkit', desc: cfg.stack.map(([, l]) => l).join(', '), body });
}
write('stack-dark.svg', stackStrip(c.silver, c.steel));
write('stack-light.svg', stackStrip(c.inkMuted, '#878D8A'));

/* ---------- project index rows ---------- */
// Each row is its own image so each can link to its destination. Rows are dark
// cards on purpose: GitHub wraps <picture> in its own link, so a linked row
// cannot swap themes.
const STATUS = {
  'Commercial': c.emerald, 'Deployed': c.emerald, 'Working build': c.silver,
  'In development': c.champagne, 'Prototype': c.steel,
};
function fit(fontName, str, size, max, tracking = 0) {
  const w = measure(fontName, str, size, tracking);
  return w > max ? size * (max / w) : size;
}
function indexRow(item, n) {
  const W = 680, H = 100, R = W - 24, L = 62;
  const tone = STATUS[item.status] || c.emerald; // repositories show their language in emerald
  const statusLabel = item.status.toUpperCase();
  const dest = item.label.toUpperCase();
  const sw = measure('mono', statusLabel, 14, 0.1);
  const dw = measure('mono', dest, 13, 0.08);
  const textMax = R - Math.max(sw + 20, dw + 24) - 28 - L;
  const nameSize = fit('serif', item.name, 36, textMax, -0.01);
  const descSize = fit('sans', item.desc, 19, textMax);
  return svgDoc({
    w: W, h: H, title: item.name, desc: `${item.name}: ${item.desc}. ${item.status}. ${item.label}.`,
    body: `<rect width="${W}" height="${H}" rx="14" fill="${c.ink}"/>` +
      `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="13.5" stroke="${c.line}"/>` +
      `<rect x="0" y="34" width="2" height="32" fill="${tone}"/>` +
      text('mono', String(n).padStart(2, '0'), { x: 22, y: 55, size: 14, tracking: 0.04, fill: c.steel }) +
      text('serif', item.name, { x: L, y: 49, size: nameSize, tracking: -0.01 }) +
      text('sans', item.desc, { x: L, y: 78, size: descSize, fill: c.silver }) +
      `<rect x="${(R - sw - 17).toFixed(1)}" y="34" width="8" height="8" fill="${tone}"/>` +
      text('mono', statusLabel, { x: R, y: 43, size: 14, tracking: 0.1, anchor: 'end', fill: c.paper }) +
      text('mono', dest, { x: R - 19, y: 74, size: 13, tracking: 0.08, anchor: 'end', fill: c.steel }) +
      `<path d="M${R - 12} 73l9-9m-7 0h7v7" stroke="${c.steel}" stroke-width="1.5"/>` +
      `<path d="M${(R - 19 - dw).toFixed(1)} 80.5H${R - 19}" stroke="${c.line}"/>`,
  });
}
fs.mkdirSync(path.join(OUT, 'work'), { recursive: true });
for (const f of fs.readdirSync(path.join(OUT, 'work'))) fs.unlinkSync(path.join(OUT, 'work', f));
let n = 0;
const blocks = {};
for (const [group, items] of Object.entries(cfg.work)) {
  blocks[group] = items.map((item) => {
    write(`work/${item.slug}.svg`, indexRow(item, ++n));
    return `<a href="${item.url}"><img src="assets/work/${item.slug}.svg" width="100%" alt="${`${item.name} — ${item.desc}. ${item.status}.`.replace(/&/g, '&amp;')}"></a>`;
  }).join('<br>\n');
}

/* ---------- README blocks ---------- */
const readmePath = path.resolve('..', 'README.md');
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, 'utf8');
  for (const [group, html] of Object.entries(blocks)) {
    const re = new RegExp(`<!-- work:${group}:start -->[\\s\\S]*<!-- work:${group}:end -->`);
    readme = readme.replace(re, `<!-- work:${group}:start -->\n${html}\n<!-- work:${group}:end -->`);
  }
  fs.writeFileSync(readmePath, readme);
}

console.log(`wrote ${written.length} files:\n  ` + written.join('\n  '));
