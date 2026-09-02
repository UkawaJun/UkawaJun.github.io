#!/usr/bin/env python3
"""Local preview server that mimics GitHub Pages (404.html fallback)."""
import http.server
import os
import socketserver
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".md": "text/plain; charset=utf-8",
        ".json": "application/json; charset=utf-8",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = Path(self.translate_path(self.path))
        if path.is_file():
            return super().do_GET()
        fallback = ROOT / "404.html"
        if fallback.exists() and not Path(self.path.lstrip("/")).suffix:
            self.path = "/404.html"
        return super().do_GET()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", 8080), Handler) as httpd:
    print("serving", ROOT, "on 8080", flush=True)
    httpd.serve_forever()
