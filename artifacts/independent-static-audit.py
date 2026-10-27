"""Independent generated-site audit. Run after Codex finishes building dist/."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
ADDRESS = 'LT 5 PC 30 DESP CAMPESIN NULL MARIA PINTO'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.title = ''
        self.in_title = False
        self.h1 = 0
        self.meta = {}
        self.links = []
        self.assets = []
        self.ids = set()
        self.anchors = []
        self.jsonld = []
        self.ld = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'meta': self.meta[a.get('name', a.get('property', ''))] = a.get('content', '')
        if tag == 'link': self.links.append(a)
        if tag == 'a' and a.get('href'): self.anchors.append(a['href'])
        if tag in ('img', 'script') and a.get('src'): self.assets.append((tag, a))
        if tag == 'script' and a.get('type') == 'application/ld+json': self.ld = ''

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.ld is not None:
            self.jsonld.append(json.loads(self.ld))
            self.ld = None

    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.ld is not None: self.ld += data


def target_for(path):
    p = DIST / unquote(path).lstrip('/')
    if p.is_dir() or not p.suffix:
        p = p / 'index.html'
    return p


def run():
    errors = []
    pages = {}
    for file in sorted(DIST.rglob('*.html')):
        rel = file.relative_to(DIST)
        if file.name == 'index.html':
            route = '/' if rel.parent == Path('.') else '/' + rel.parent.as_posix() + '/'
        else:
            route = '/' + rel.as_posix()
        parser = Page()
        try:
            parser.feed(file.read_text())
        except Exception as e:
            errors.append(f'{route}: HTML/JSON parse failed: {e}')
            continue
        pages[route] = parser
    assert pages, 'No generated HTML pages found'
    titles = {}
    descriptions = {}
    for route, p in pages.items():
        if '404' in route: continue
        if p.h1 != 1: errors.append(f'{route}: expected one h1, got {p.h1}')
        if not p.lang or not p.lang.startswith('es' if route.startswith('/es/') else 'en'):
            errors.append(f'{route}: unexpected lang {p.lang}')
        if not p.title: errors.append(f'{route}: no title')
        if p.title in titles: errors.append(f'{route}: duplicate title with {titles[p.title]}')
        titles[p.title] = route
        description = p.meta.get('description', '')
        if not description: errors.append(f'{route}: missing description')
        if description in descriptions: errors.append(f'{route}: duplicate description with {descriptions[description]}')
        descriptions[description] = route
        canonical = [a['href'] for a in p.links if a.get('rel') == 'canonical']
        if canonical != ['https://afreen.cl' + route]: errors.append(f'{route}: canonical mismatch {canonical}')
        alternates = {a.get('hreflang'): a.get('href') for a in p.links if a.get('rel') == 'alternate'}
        if not {'en', 'es-CL', 'x-default'}.issubset(alternates): errors.append(f'{route}: missing hreflang entries')
        for lang, href in alternates.items():
            alternate = urlparse(href).path
            if alternate not in pages:
                errors.append(f'{route}: alternate absent {alternate}')
            else:
                reverse = {a.get('hreflang'): a.get('href') for a in pages[alternate].links if a.get('rel') == 'alternate'}
                if reverse != alternates: errors.append(f'{route}: nonreciprocal alternate {alternate}')
        for tag, attrs in p.assets:
            src = attrs['src']
            parsed = urlparse(src)
            if not parsed.netloc and src.startswith('/') and not target_for(parsed.path).exists():
                errors.append(f'{route}: missing {tag} {src}')
            if tag == 'img' and (not attrs.get('alt') or not attrs.get('width') or not attrs.get('height')):
                errors.append(f'{route}: image missing alt/dimensions {src}')
        for href in p.anchors:
            u = urlparse(href)
            if u.scheme or u.netloc: continue
            if u.path and not u.path.startswith('/'): continue
            path = u.path or route
            if not target_for(path).exists(): errors.append(f'{route}: broken link {href}')
            if u.fragment and path in pages and unquote(u.fragment) not in pages[path].ids:
                errors.append(f'{route}: broken fragment {href}')
        if not p.jsonld: errors.append(f'{route}: no structured data')
    # Parse only our locally generated sitemap, never remotely supplied XML.
    sitemap = ET.parse(DIST / 'sitemap.xml')
    locs = [e.text for e in sitemap.iter() if e.tag.split('}')[-1] == 'loc' and e.text is not None]
    for url in locs:
        if not url.startswith('https://afreen.cl/'): errors.append(f'Sitemap external URL {url}')
        if not target_for(urlparse(url).path).exists(): errors.append(f'Sitemap target missing {url}')
        if '404' in url: errors.append(f'404 indexed {url}')
    canonical_routes = {'https://afreen.cl' + r for r in pages if '404' not in r}
    if set(locs) != canonical_routes:
        errors.append(f'Sitemap route mismatch missing={canonical_routes-set(locs)}, extra={set(locs)-canonical_routes}')
    if not (DIST / 'robots.txt').is_file(): errors.append('robots.txt missing')
    home = (DIST / 'index.html').read_text()
    if ADDRESS not in home: errors.append('Exact owner address not on homepage')
    products = ['walnut','raisins','almonds','orange','apple','mandarin','grapes','grapefruit','avocado','lemon','beetroot','cherry']
    for name in products:
        if not (DIST / 'images' / (name + '.webp')).exists(): errors.append(f'Product photo missing {name}')
    result = {'passed': not errors, 'html_pages': len(pages), 'sitemap_urls': len(locs),
              'verified_product_images': len(products), 'errors': errors}
    (ROOT / 'artifacts' / 'independent-static-audit.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))
    return 0 if result['passed'] else 1

if __name__ == '__main__':
    raise SystemExit(run())
