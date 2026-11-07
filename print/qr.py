# /// script
# requires-python = ">=3.9"
# dependencies = ["segno>=1.6"]
# ///
"""Menu QR code for printing.

The address comes from <link rel="canonical"> in index.html, so the QR
always matches the site. To move to your own domain, change that link
(and og:url, og:image) in index.html, then run:

    uv run print/qr.py        (or: pip install segno && python print/qr.py)

Writes menu-qr.svg / .pdf / .png next to this file. Open cards.html in a
browser and print it (A4, 100% scale) for the table cards.
"""
from html.parser import HTMLParser
from pathlib import Path

import segno

HERE = Path(__file__).resolve().parent


class Canonical(HTMLParser):
    url = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "link" and a.get("rel") == "canonical":
            self.url = a.get("href")


p = Canonical()
p.feed((HERE.parent / "index.html").read_text(encoding="utf-8"))
if not p.url or not p.url.startswith("https://"):
    raise SystemExit("index.html needs <link rel=\"canonical\" href=\"https://...\">")

# Standard QR (ISO/IEC 18004, Model 2), byte mode, level Q (25% damage
# tolerance), 4-module quiet zone, pure black on white: what every phone
# camera and scanner app reads.
qr = segno.make_qr(p.url, error="q", boost_error=False)
style = dict(border=4, dark="#000000", light="#ffffff")
# Real print size: 1.5 mm a module, 55.5 mm with the quiet zone.
qr.save(HERE / "menu-qr.svg", scale=1.5, unit="mm", svgclass=None,
        lineclass=None, xmldecl=False, title=p.url, **style)
qr.save(HERE / "menu-qr.pdf", scale=1.5 * 72 / 25.4, **style)
qr.save(HERE / "menu-qr.png", scale=40, dpi=600, **style)
print(f"{p.url}  version {qr.version}, level {qr.error}, {qr.symbol_size(border=0)[0]} modules")
