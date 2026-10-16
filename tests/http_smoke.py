"""Verify GitHub Pages-style subpath serving on a loopback-only temporary server."""
from pathlib import Path
import http.server,threading,json
ROOT=Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if self.path.startswith('/fang-christmas-trip/'):
            self.path=self.path[len('/fang-christmas-trip'):]
        super().do_GET()
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
source=(ROOT/'tests/browser_check.py').read_text(encoding='utf-8')
source=source.split("    check('Direct file open")[0]
body='''    cdp('Network.setBlockedURLs',{'urls':[]})
    cdp('Page.navigate',{'url':'http://127.0.0.1:PORT/fang-christmas-trip/'})
    time.sleep(1)
    check('HTTP subpath opens the V4 application',"location.pathname==='/fang-christmas-trip/'&&TripData.dataVersion===4&&TripData.routes.length===17")
    check('HTTP relative scripts, fonts and styles load',"typeof Chart==='function'&&document.fonts.check('16px Mali')&&getComputedStyle(document.querySelector('h1')).fontFamily.includes('Mali')")
    check('HTTP central bundle is served successfully',"fetch('js/travel-research-data.js').then(r=>r.ok)")
    check('HTTP licensed image resolves correctly',"fetch('assets/images/fang-hot-springs.jpg').then(r=>r.ok)")
    check('HTTP application does not request external routing or map tiles',"performance.getEntriesByType('resource').every(r=>new URL(r.name).origin===location.origin)")
    (QA/'http-results-v4.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
finally:
    if ws:
        try:cdp('Browser.close')
        except Exception:pass
        ws.close()
    if browser:
        try:browser.wait(timeout=8)
        except subprocess.TimeoutExpired:browser.terminate()
'''.replace('PORT',str(server.server_port))
try:exec(compile(source+body,str(ROOT/'tests/browser_check.py'),'exec'),{'__file__':str(ROOT/'tests/browser_check.py')})
finally:server.shutdown();server.server_close()
