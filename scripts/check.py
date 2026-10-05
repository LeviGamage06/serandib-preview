"""Offline checks for local assets, static dependencies and JavaScript syntax."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import subprocess
import re
import sys
root = Path(__file__).resolve().parents[1] / (sys.argv[1] if len(sys.argv) > 1 else '.')
errors = []
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids: errors.append('Duplicate ID: ' + attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('href', 'src', 'action'):
            value = attrs.get(key, '')
            if value: self.refs.append(value)
for path in root.glob('*.html'):
    page = Page(); page.feed(path.read_text())
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc: continue
        if url.path.startswith('/'): errors.append(f'{path.name}: root-relative path {ref}')
        elif url.path and not (root / unquote(url.path)).is_file(): errors.append(f'{path.name}: missing {ref}')
        elif not url.path and url.fragment and url.fragment not in page.ids: errors.append(f'{path.name}: missing anchor {ref}')
for path in root.glob('*.js'):
    result = subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
    if result.returncode: errors.append(result.stderr)
    if re.search(r'/api/|signin-with-chatgpt|Serandib\.request|Serandib\.session', path.read_text()): errors.append(f'{path.name}: backend dependency remains')
for path in root.glob('*.css'):
    for ref in re.findall(r'url\([\'\"]?([^\)\'\"]+)', path.read_text()):
        if not urlsplit(ref).scheme and not ref.startswith('#') and not (root/ref).is_file(): errors.append(f'{path.name}: missing CSS asset {ref}')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'PASS: {len(list(root.glob("*.html")))} pages, local links/assets, JavaScript syntax and no missing application-server API dependencies.')
