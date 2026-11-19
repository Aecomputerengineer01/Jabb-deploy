import http.server
import socketserver
import webbrowser
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"==================================================")
print(f"🚀 JAABBAR 3D LIVE OPS - Live Simulation Server")
print(f"📍 Local URL: http://localhost:{PORT}")
print(f"==================================================")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        webbrowser.open(f"http://localhost:{PORT}")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 เซิร์ฟเวอร์หยุดทำงานแล้ว")
