"""Download owner-requested generated photography and make local WebP assets."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import urllib.request
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'hero': 'https://v3b.fal.media/files/b/0ab0171d/danoaNw66oLWvj4iGoXUd_uFnyOiCw.png',
    'walnut': 'https://v3b.fal.media/files/b/0ab01729/tFGaYu-k-JWP8UMTJF7jf_SopZoeto.png',
    'raisins': 'https://v3b.fal.media/files/b/0ab01728/QiuRq71BjWiU9H3dj3Dy5_n6Wo2gCJ.png',
    'almonds': 'https://v3b.fal.media/files/b/0ab01728/wrHwf-38fkZDm5m-GUePP_p0v8UjwL.png',
    'orange': 'https://v3b.fal.media/files/b/0ab01729/NaUVv5dJDi51oFPKJz8G-_sXNVlfrZ.png',
    'apple': 'https://v3b.fal.media/files/b/0ab01729/9UE0OAlOrGczTRxJe05bg_tUoV9QJc.png',
    'mandarin': 'https://v3b.fal.media/files/b/0ab01729/F8ws0l3G8lxy1aLXDPnfz_1paNnHQO.png',
    'grapes': 'https://v3b.fal.media/files/b/0ab0172a/GW7YzmOBUAqKMzvWw_VHU_uI6qPHeI.png',
    'grapefruit': 'https://v3b.fal.media/files/b/0ab0172a/YiPigoVqb6XH9bkN_PywU_xBa1Hw1R.png',
    'avocado': 'https://v3b.fal.media/files/b/0ab0172a/UWRU7mEJfdqmTNZnai80y_KeeZOWPq.png',
    'lemon': 'https://v3b.fal.media/files/b/0ab0172a/Y3NAPkL7u1bAghkpHWOOv_L0PIORWd.png',
    'beetroot': 'https://v3b.fal.media/files/b/0ab0172b/RBYmE7S3elwAy1UycrbZz_NUURbWXQ.png',
    'cherry': 'https://v3b.fal.media/files/b/0ab0172b/D3T4OiaCHWgvX2pddgfDn_xTFJWomh.png',
}

def prepare(item):
    name, url = item
    original = ROOT / 'artifacts' / 'image-originals' / f'{name}.png'
    original.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, original)
    image = Image.open(original).convert('RGB')
    target = ROOT / 'public' / 'images' / f'{name}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, quality=88, method=6)
    return {'name': name, 'source_url': url, 'generated': True,
            'purpose': 'Illustrative produce photography; not actual stock or facilities',
            'original': str(original.relative_to(ROOT)),
            'webp': str(target.relative_to(ROOT)), 'dimensions': image.size,
            'bytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        manifest = list(pool.map(prepare, SOURCES.items()))
    (ROOT / 'artifacts' / 'image-provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
    board = Image.new('RGB', (1200, 950), '#f7f3eb')
    draw = ImageDraw.Draw(board)
    for i, name in enumerate(n for n in SOURCES if n != 'hero'):
        x, y = (i % 4) * 300, (i // 4) * 315
        thumb = ImageOps.contain(Image.open(ROOT / 'public' / 'images' / f'{name}.webp'), (285, 285))
        board.paste(thumb, (x, y))
        draw.text((x + 10, y + 288), name, fill='#163e2b')
    board.save(ROOT / 'artifacts' / 'generated-product-review.jpg', quality=90)
    print(json.dumps(manifest, indent=2))
