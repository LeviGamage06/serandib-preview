"""Build an allowlisted static site for root or project-path GitHub Pages hosting."""
from pathlib import Path
from urllib.parse import urlsplit
from html import escape
import argparse
import shutil
import re

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='https://levigamage06.github.io/serandib-preview/')
args = parser.parse_args()
base = args.base_url.rstrip('/') + '/'
parsed = urlsplit(base)
if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.query or parsed.fragment:
    parser.error('--base-url must be an absolute http(s) URL without a query or fragment')
out = ROOT / '_site'
if out.is_symlink():
    parser.error('_site must not be a symlink')
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)
# Never deploy .git, tests, source management scripts, or local machine files.
for pattern in ('*.html', '*.css', '*.js', '*.jpg'):
    for path in ROOT.glob(pattern):
        shutil.copy2(path, out / path.name)
shutil.copytree(ROOT / 'assets', out / 'assets', ignore=shutil.ignore_patterns('.DS_Store'))
(out / '.nojekyll').touch()
if (ROOT / 'CNAME').is_file():
    shutil.copy2(ROOT / 'CNAME', out / 'CNAME')
public = ['index.html', 'portfolio.html', 'venues.html', 'planning.html', 'consultation.html', 'privacy.html']
for path in out.glob('*.html'):
    content = path.read_text()
    if path.name == 'consultation.html':
        for field, page in [('next', 'thank-you.html'), ('url', 'consultation.html')]:
            content = re.sub(r'(data-form-' + field + r' value=")[^"]*(")', lambda m: m[1] + escape(base + page, quote=True) + m[2], content)
    if path.name == '404.html':
        # A 404 may be served at /project/missing/deep/path. Resolve all links at the deployment root.
        content = content.replace('<head>', '<head><base href="' + escape(base, quote=True) + '">', 1)
    if path.name in public:
        url = base + ('' if path.name == 'index.html' else path.name)
        content = content.replace('</head>', '<link rel="canonical" href="' + escape(url, quote=True) + '"><meta property="og:url" content="' + escape(url, quote=True) + '"><meta property="og:image" content="' + escape(base + 'wedding.jpg', quote=True) + '"></head>')
    path.write_text(content)
(out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('<url><loc>' + escape(base + ('' if name == 'index.html' else name)) + '</loc></url>\n' for name in public) + '</urlset>\n')
(out / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: ' + base + 'sitemap.xml\n')
print(f'Built {len(list(out.rglob("*")))} files/directories in {out} for {base}')
