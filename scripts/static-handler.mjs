import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname, sep } from 'node:path';

const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'",
};

export async function staticHandler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, securityHeaders); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replace(/\\/g, '/'); }
  catch { res.writeHead(400, securityHeaders); res.end(); return; }
  const filename = resolve(root, `.${pathname}`);
  if (filename !== root && !filename.startsWith(root + sep)) { res.writeHead(403, securityHeaders); res.end(); return; }
  // Build URLs from the confined, normalized file path, never decoded request text.
  const trailingSlash = pathname.endsWith('/');
  pathname = '/' + relative(root, filename).split(sep).map(encodeURIComponent).join('/');
  if (trailingSlash && pathname !== '/') pathname += '/';
  let file = filename, status = 200;
  try {
    if ((await stat(file)).isDirectory()) {
      if (!trailingSlash) { res.writeHead(308, { ...securityHeaders, Location: pathname === '/' ? '/' : pathname + '/' }); res.end(); return; }
      file = resolve(file, 'index.html');
    }
    if (pathname === '/404/' || pathname === '/404.html' || pathname === '/es/404/') status = 404;
    const data = await readFile(file);
    res.writeHead(status, { ...securityHeaders, 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    const data = await readFile(resolve(root, pathname.startsWith('/es/') ? 'es/404/index.html' : '404.html'));
    res.writeHead(404, { ...securityHeaders, 'Content-Type': mime['.html'] });
    res.end(req.method === 'HEAD' ? undefined : data);
  }
}
