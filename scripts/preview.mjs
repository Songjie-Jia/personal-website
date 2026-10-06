import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.mp4': 'video/mp4' };
http.createServer((req, res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); } catch { res.writeHead(400).end(); return; }
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
  if (file === root) file = path.join(root, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  const size = fs.statSync(file).size;
  const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
  const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  let start = 0, end = size - 1;
  if (range) {
    start = Number(range[1]); end = range[2] ? Math.min(Number(range[2]), end) : end;
    if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = end - start + 1;
  res.writeHead(range ? 206 : 200, headers);
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(file, { start, end }).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Production preview: http://127.0.0.1:4173'));