# /// script
# requires-python = ">=3.12"
# dependencies = ["playwright>=1.56", "pymupdf>=1.26"]
# ///
"""Table cards for printing: cards.html as cards-a4.pdf, one A4 sheet of four
A6 cards at actual size. Run after qr.py, as the cards show menu-qr.svg:

    uv run print/cards_pdf.py

Prints with the installed Google Chrome (Playwright's channel "chrome"), so no
browser is downloaded. The page is served over http, not opened as a file:
Chrome refuses a font loaded from a file:// page.
"""
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pymupdf
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE / "cards-a4.pdf"
A4_PT = (595.28, 841.89)  # 210 x 297 mm
CARDS = 4
ADDRESS = "ro-coffee.ir"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def render(url: str) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")
        # every font the cards use has arrived, else Chrome prints a fallback
        loaded = page.evaluate(
            "document.fonts.ready.then(f => [...f].map(x => x.family + ':' + x.status))"
        )
        if not loaded or any(not entry.endswith(":loaded") for entry in loaded):
            raise SystemExit(f"fonts not loaded: {loaded}")
        page.pdf(path=OUT, prefer_css_page_size=True, print_background=True)
        browser.close()


def check() -> None:
    with pymupdf.open(OUT) as pdf:
        if pdf.page_count != 1:
            raise SystemExit(f"{OUT.name}: {pdf.page_count} pages, expected 1")
        page = pdf[0]
        size = (page.rect.width, page.rect.height)
        if any(abs(got - want) > 1 for got, want in zip(size, A4_PT)):
            raise SystemExit(f"{OUT.name}: page {size} pt, expected A4 {A4_PT}")
        found = page.get_text().count(ADDRESS)
        if found != CARDS:
            raise SystemExit(f"{OUT.name}: {found} cards carry {ADDRESS}, expected {CARDS}")


root = HERE.parent
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=root))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    render(f"http://127.0.0.1:{server.server_port}/print/cards.html")
finally:
    server.shutdown()
check()
print(f"{OUT.name}: 1 A4 page, {CARDS} cards")
