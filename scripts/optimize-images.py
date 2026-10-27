"""Optional asset maintenance: make responsive copies; never modify supplied originals.

Requires Python 3 and Pillow. The generated WebP variants ship with the project,
so a normal npm build has no Python dependency.
"""
from pathlib import Path
from PIL import Image

images = Path(__file__).resolve().parents[1] / 'public' / 'images'
ids = ['hero', 'walnut', 'raisins', 'almonds', 'orange', 'apple', 'mandarin',
       'grapes', 'grapefruit', 'avocado', 'lemon', 'beetroot', 'cherry']
for name in ids:
    with Image.open(images / f'{name}.webp') as original:
        for width in [480, 768]:
            output = images / f'{name}-{width}.webp'
            if output.exists():
                continue
            height = round(original.height * width / original.width)
            original.resize((width, height), Image.Resampling.LANCZOS).save(output, 'WEBP', quality=82, method=6)
print('Responsive WebP copies ready. Original assets unchanged.')
