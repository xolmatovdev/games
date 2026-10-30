import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 60)
        print("  ⚡ COUNTER-STRIKE 1.6: WEB EDITION ⚡")
        print("=" * 60)
        print(f"O'yin manzili: {url}")
        print("Server ishga tushdi. Brauzer ochilmoqda...")
        print("Serverni to'xtatish uchun: Ctrl + C")
        print("=" * 60)
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer to'xtatildi.")

if __name__ == '__main__':
    run()
