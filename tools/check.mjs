// Validates the profile before publishing.
//   node check.mjs            local checks + network checks
//   node check.mjs --offline  local checks only
//
// Checks: every SVG parses and renders and has a <title>; every local link and
// image in the Markdown files resolves; every linked github.com/hellpuffyt repo
// is public; external links respond; nothing that looks like a secret, a
// preview deployment or a private URL is present.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve('..');
const offline = process.argv.includes('--offline');
const failures = [], warnings = [];
const fail = (m) => failures.push(m);
const warn = (m) => warnings.push(m);

/* ---------- SVGs ---------- */
const svgs = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.svg')) svgs.push(p);
  }
})(path.join(ROOT, 'assets'));
for (const file of svgs) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  try {
    new Resvg(src).render();
  } catch (e) {
    fail(`${rel}: does not render (${e.message})`);
  }
  if (!rel.startsWith('assets/icons/') && !/<title[ >]/.test(src)) fail(`${rel}: missing <title>`);
  if (/<text[ >]|font-family/.test(src)) fail(`${rel}: contains live text; convert to outlines`);
  if (/<script|javascript:|href="http/.test(src)) fail(`${rel}: contains script or external reference`);
  if (src.length > 400_000) warn(`${rel}: ${(src.length / 1024).toFixed(0)} KB`);
}
console.log(`svg: ${svgs.length} files checked`);

/* ---------- Markdown links ---------- */
const docs = ['README.md', 'PROJECTS.md', 'SKILLS.md', 'BRAND.md'].filter((f) => fs.existsSync(path.join(ROOT, f)));
const external = new Set();
const repoLinks = new Set();
for (const doc of docs) {
  const src = fs.readFileSync(path.join(ROOT, doc), 'utf8');
  const refs = [
    ...[...src.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]),
    ...[...src.matchAll(/(?:src|srcset|href)="([^"]+)"/g)].map((m) => m[1]),
  ];
  for (const ref of refs) {
    if (/^https?:\/\//.test(ref)) {
      external.add(ref);
      const m = ref.match(/^https:\/\/github\.com\/hellpuffyt\/([^/#?]+)/);
      if (m) repoLinks.add(m[1]);
    } else if (!ref.startsWith('#') && !ref.startsWith('mailto:')) {
      const target = path.join(ROOT, ref.split('#')[0]);
      if (!fs.existsSync(target)) fail(`${doc}: broken local reference ${ref}`);
    }
  }
  for (const [re, why] of [
    [/vercel\.app/i, 'preview deployment URL'],
    [/\b(gh[opsu]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/, 'token-like string'],
    [/localhost|127\.0\.0\.1|\.internal\b/i, 'local or internal address'],
    [/@gmail\.com/i, 'personal email address'],
  ]) if (re.test(src)) fail(`${doc}: contains ${why}`);
}
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
if (!readme.includes('https://www.hellpuff.dev')) fail('README.md: website link https://www.hellpuff.dev missing');
if (/href="https?:\/\/hellpuff\.dev|\(https?:\/\/hellpuff\.dev/.test(readme)) fail('README.md: use https://www.hellpuff.dev, not the bare domain');
console.log(`markdown: ${docs.length} files, ${external.size} external links, ${repoLinks.size} repositories`);

/* ---------- network ---------- */
if (!offline) {
  let token = process.env.GITHUB_TOKEN || '';
  if (!token) {
    try { token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
  }
  for (const repo of repoLinks) {
    const res = await fetch(`https://api.github.com/repos/hellpuffyt/${repo}`, {
      headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const body = res.ok ? await res.json() : null;
    if (!body) fail(`repo ${repo}: HTTP ${res.status}`);
    else if (body.private || body.visibility !== 'public') fail(`repo ${repo}: is not public, remove the link`);
  }
  const others = [...external].filter((u) => !/^https:\/\/github\.com\/hellpuffyt\/[^/]+\/?$/.test(u));
  await Promise.all(others.map(async (url) => {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'hellpuff-profile-check' } });
      if (res.status >= 400) fail(`${url}: HTTP ${res.status}`);
      else if (/window\.location\.href="\/lander"/.test(await res.text())) fail(`${url}: parked domain`);
    } catch (e) {
      warn(`${url}: unreachable (${e.cause?.code || e.name})`);
    }
  }));
  console.log(`network: ${repoLinks.size} repositories and ${others.length} URLs checked`);
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const f of failures) console.log(`FAIL  ${f}`);
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nall checks passed');
process.exit(failures.length ? 1 : 0);
