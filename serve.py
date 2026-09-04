#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSET_PREFIXES = ("/assets/", "/content/", "/vendor/", "/favicon", "/.nojekyll")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        raw = self.path.split("?", 1)[0].split("#", 1)[0]
        fs = ROOT / raw.lstrip("/")
        if raw != "/" and not fs.exists() and not raw.startswith(ASSET_PREFIXES):
            self.path = "/index.html"
        return SimpleHTTPRequestHandler.do_GET(self)

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
