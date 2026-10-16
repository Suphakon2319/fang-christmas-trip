"""Verify GitHub Pages-style subpath serving on a loopback-only temporary server."""
from pathlib import Path
import http.server,threading,json
ROOT=Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if self.path.startswith('/fang-christmas-trip/'):
            self.path=self.path[len('/fang-christmas-trip'):]
        try:super().do_GET()
        except (ConnectionResetError,BrokenPipeError):pass  # Browser teardown can close pending image streams.
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
source=(ROOT/'tests/browser_check.py').read_text(encoding='utf-8')
source=source.split("    check('Direct file open")[0]
body='''    cdp('Network.setBlockedURLs',{'urls':[]})
    cdp('Page.navigate',{'url':'http://127.0.0.1:PORT/fang-christmas-trip/'})
    for _ in range(150):
        if js("location.pathname==='/fang-christmas-trip/'&&typeof TripData!=='undefined'&&TripData.dataVersion===5&&!!document.querySelector('#timeline [data-price-panel]')"):break
        time.sleep(.1)
    check('HTTP subpath opens the V5 application',"location.pathname==='/fang-christmas-trip/'&&TripData.dataVersion===5&&TripData.routes.length===17")
    check('HTTP relative scripts, fonts and styles load',"typeof Chart==='function'&&document.fonts.check('16px Mali')&&getComputedStyle(document.querySelector('h1')).fontFamily.includes('Mali')")
    check('HTTP central bundle is served successfully',"fetch('js/travel-research-data.js').then(r=>r.ok)")
    check('HTTP licensed image resolves correctly',"fetch('assets/images/fang-hot-springs.jpg').then(async r=>r.ok&&(await r.arrayBuffer()).byteLength>1000)")
    check('HTTP V5 scripts and style resolve under project subpath',"Promise.all(['js/travel-v5.js','js/photo-gallery.js','css/travel-v5.css'].map(async u=>{const r=await fetch(u);return r.ok&&(await r.text()).length>100})).then(a=>a.every(Boolean))")
    check('HTTP all six licensed photographs decode under project subpath',"Promise.all(TripResearch.photos.filter(p=>p.allowedToDisplay&&p.rightsStatus==='licensed').map(async p=>{const r=await fetch(p.file);if(!r.ok)return false;const b=await r.blob();const image=await createImageBitmap(b);return image.width>100&&image.height>100})).then(a=>a.length===6&&a.every(Boolean))")
    check('HTTP application does not request external routing or map tiles',"performance.getEntriesByType('resource').every(r=>new URL(r.name).origin===location.origin)")
except Exception:
    results.append({'name':'Complete HTTP V5 suite','passed':False})
    raise
finally:
    (QA/'http-results-v5.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
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
