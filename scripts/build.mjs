import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const pages = ['index.html', 'projects/cable-pneumatic-soft-robot.html', 'projects/pneumatic-origami-cubes.html'];
const files = new Set(pages);
const external = new Set();
function checkFile(relative) {
  if (relative.startsWith('../') || path.isAbsolute(relative)) throw new Error(`Path outside site: ${relative}`);
  let current = root;
  for (const part of relative.split('/')) {
    if (!fs.readdirSync(current).includes(part)) throw new Error(`Missing file or incorrect case: ${relative}`);
    current = path.join(current, part);
  }
  if (!fs.statSync(current).isFile()) throw new Error(`Not a file: ${relative}`);
  files.add(relative);
  return current;
}
for (const page of pages) {
  const html = fs.readFileSync(checkFile(page), 'utf8');
  if (/(?:\b[A-Za-z]:[\\/]|file:\/\/)/.test(html)) throw new Error(`Local filesystem URL in ${page}`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^https?:/.test(value)) { external.add(value); continue; }
    if (value.startsWith('mailto:')) continue;
    if (/^[a-z]+:/i.test(value) || value.startsWith('//')) throw new Error(`Unexpected URL: ${value}`);
    const [file, fragment] = value.split('#');
    const relative = file ? path.posix.normalize(path.posix.join(path.posix.dirname(page), file.split('?')[0])) : page;
    const target = checkFile(relative);
    if (fragment && relative.endsWith('.html')) {
      const targetHTML = fs.readFileSync(target, 'utf8');
      if (!targetHTML.includes(`id="${decodeURIComponent(fragment)}"`)) throw new Error(`Missing anchor: ${page} -> ${value}`);
    }
    if (value === '#') throw new Error(`Placeholder link in ${page}`);
  }
}
new Script(fs.readFileSync(path.join(root, 'script.js'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
if (/(?:\b[A-Za-z]:[\\/]|file:\/\/)/.test(css)) throw new Error('Local filesystem URL in CSS');
for (const match of css.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) checkFile(match[1]);
for (const file of files) {
  const data = fs.readFileSync(path.join(root, file));
  if (file.endsWith('.pdf') && data.subarray(0, 5).toString() !== '%PDF-') throw new Error(`Invalid PDF: ${file}`);
  if (file.endsWith('.mp4')) {
    if (data.subarray(4, 8).toString() !== 'ftyp') throw new Error(`Invalid MP4: ${file}`);
    if (!data.includes(Buffer.from('avc1'))) throw new Error(`Verify browser codec compatibility: ${file}`);
  }
}
// Clear only the known output directory inside this project.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Unsafe output path');
fs.rmSync(output, { recursive: true, force: true });
for (const file of [...files].sort()) {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}
const bytes = [...files].reduce((total, file) => total + fs.statSync(path.join(output, file)).size, 0);
console.log(`Production build passed: ${pages.length} pages, ${files.size} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB.`);
console.log('Internal routes, anchors, case-sensitive asset paths, PDF/MP4 signatures, H.264 markers and JavaScript syntax passed.');
console.log('External URLs (availability checked separately):\n' + [...external].join('\n'));