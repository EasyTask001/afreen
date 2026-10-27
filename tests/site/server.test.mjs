import test from 'node:test';
import assert from 'node:assert/strict';
import { staticHandler } from '../../scripts/static-handler.mjs';

// Exercise the real HTTP request handler without binding a forbidden socket.
async function request(url, method = 'GET') {
  const response = { status: null, headers: {}, data: undefined,
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(data) { this.data = data?.toString(); },
  };
  await staticHandler({ url, method }, response);
  return response;
}

test('preview serves real static pages, scripts and media with appropriate content types', async () => {
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.match(home.data, /<html lang="en"/);
  assert.match(home.headers['Content-Type'], /^text\/html/);
  assert.match(home.headers['Content-Security-Policy'], /form-action 'none'/);
  assert.equal((await request('/styles.css')).headers['Content-Type'], 'text/css; charset=utf-8');
  assert.equal((await request('/js/client.js')).headers['Content-Type'], 'text/javascript; charset=utf-8');
  assert.equal((await request('/images/cherry.webp')).headers['Content-Type'], 'image/webp');
  assert.equal((await request('/catalogue')).status, 308);
  assert.equal((await request('/catalogue')).headers.Location, '/catalogue/');
  assert.equal((await request('/', 'HEAD')).data, undefined);
});

test('preview returns genuine localized 404 status, rejects writes and confines requests to dist', async () => {
  const en = await request('/not-a-page/');
  assert.equal(en.status, 404);
  assert.match(en.data, /Back to the good things/);
  const es = await request('/es/not-a-page/');
  assert.equal(es.status, 404);
  assert.match(es.data, /Volvamos a lo esencial/);
  assert.equal((await request('/es/404/')).status, 404);
  assert.equal((await request('/404/')).status, 404);
  assert.equal((await request('/404.html')).status, 404);
  assert.equal((await request('/contact/', 'POST')).status, 405);
  assert.equal((await request('/%2e%2e%2fpackage.json')).status, 403);
  assert.equal((await request('/%zz')).status, 400);
  assert.doesNotMatch((await request('/package.json')).data, /devDependencies/);
});

test('encoded separators and dot segments redirect only to normalized local paths', async () => {
  for (const [path, target] of [
    ['/%2fexample.com%2f..%2fes', '/es/'],
    ['/%5cexample.com%5c..%5ces', '/es/'],
    ['/catalogue%2f..%2fes', '/es/'],
    ['/catalogue%5c..%5ces', '/es/'],
    ['/%2fexample.com%2f..', '/'],
    ['/es%2f..%2fcatalogue', '/catalogue/'],
  ]) {
    const response = await request(path);
    assert.equal(response.status, 308, path);
    assert.equal(response.headers.Location, target, path);
    assert.equal(new URL(response.headers.Location, 'http://127.0.0.1').origin, 'http://127.0.0.1', path);
    assert.equal((await request(response.headers.Location)).status, 200, path);
  }
  assert.equal((await request('/%2fexample.com%2f..%2fes/')).status, 200);
  for (const path of ['/%2e%2e%2fpackage.json', '/%2e%2e%5cpackage.json']) {
    assert.equal((await request(path)).status, 403, path);
  }
  for (const path of ['/es%2fmissing-page', '/es%5cmissing-page', '/es%2f404', '/es%5c404']) {
    const response = await request(path.endsWith('404') ? path + '/' : path);
    assert.equal(response.status, 404, path);
    assert.match(response.data, /Volvamos a lo esencial/, path);
    assert.equal(response.headers.Location, undefined, path);
  }
});
