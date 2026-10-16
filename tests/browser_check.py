"""Browser QA against file:// using the installed Edge. No application server."""
import base64,json,pathlib,subprocess,time,urllib.request,websocket,uuid

ROOT=pathlib.Path(__file__).resolve().parents[1]
QA=ROOT/'.qa'
QA.mkdir(exist_ok=True)
results=[]
browser=None
ws=None
events=[]
counter=0

def cdp(method,params=None):
    global counter
    counter+=1
    current=counter
    ws.send(json.dumps({'id':current,'method':method,'params':params or {}}))
    while True:
        message=json.loads(ws.recv())
        if message.get('id')==current:
            if 'error' in message: raise RuntimeError(message['error'])
            return message.get('result',{})
        events.append(message)

def js(expression):
    value=cdp('Runtime.evaluate',{'expression':expression,'returnByValue':True,'awaitPromise':True,'userGesture':True})
    if value.get('exceptionDetails'):raise RuntimeError(value['exceptionDetails'])
    return value.get('result',{}).get('value')

def check(name,expression):
    passed=bool(js(expression))
    results.append({'name':name,'passed':passed})
    print(('PASS ' if passed else 'FAIL ')+name,flush=True)
    if not passed:raise AssertionError(name)

def key(value):
    vk={'Escape':27,'ArrowRight':39,'ArrowLeft':37}.get(value,0)
    cdp('Input.dispatchKeyEvent',{'type':'keyDown','key':value,'code':value,'windowsVirtualKeyCode':vk})
    cdp('Input.dispatchKeyEvent',{'type':'keyUp','key':value,'code':value,'windowsVirtualKeyCode':vk})
    time.sleep(.1)

def screenshot(name):
    (QA/name).write_bytes(base64.b64decode(cdp('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']))

try:
    profile=QA/('edge-profile-'+uuid.uuid4().hex[:8]);profile.mkdir(exist_ok=True)
    browser=subprocess.Popen([r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe','--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+str(profile),'about:blank'],creationflags=subprocess.CREATE_NO_WINDOW,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    portfile=profile/'DevToolsActivePort'
    for attempt in range(300):
        try:
            port=portfile.read_text().splitlines()[0]
            pages=json.load(urllib.request.urlopen('http://127.0.0.1:'+port+'/json',timeout=2))
            target=next(p for p in pages if p['type']=='page');break
        except (OSError,IndexError,StopIteration,ValueError):
            if attempt==299:raise
            time.sleep(.1)
    ws=websocket.create_connection(target['webSocketDebuggerUrl'],timeout=30)
    cdp('Page.enable');cdp('Runtime.enable');cdp('Network.enable')
    cdp('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
    cdp('Network.setBlockedURLs',{'urls':['http://*','https://*']})
    cdp('Page.navigate',{'url':(ROOT/'index.html').as_uri()})
    for _ in range(100):
        if js("typeof TripBudget!=='undefined' && !!document.querySelector('#planned-total')"):break
        time.sleep(.1)
    js("localStorage.clear();location.reload()")
    time.sleep(.8)
    check('Direct file open completely offline',"location.protocol==='file:' && TripData.dataVersion===4 && typeof Chart==='function' && document.fonts.check('16px Mali')")
    check('Seventeen routes, all three days complete',"TripData.routes.length===17 && [1,2,3].map(d=>TripData.routes.filter(r=>r.day===d).length).join(',')==='6,6,5'")
    check('Thai interface and local Thai fonts regression',"document.querySelector('h1').textContent.includes('ไปฝาง') && getComputedStyle(document.querySelector('h1')).fontFamily.includes('Mali') && document.fonts.check('16px Mali')")
    js("document.querySelector('[data-check]').click();const note=document.querySelector('#contact-notes');note.value='QA editable contact';note.dispatchEvent(new Event('input',{bubbles:true}));location.reload()")
    time.sleep(.6)
    check('Checklist and contact editing persist after reload',"document.querySelector('[data-check]').checked && document.querySelector('#contact-notes').value==='QA editable contact'")
    check('No embedded maps, community tiles, or routing requests',"document.querySelectorAll('iframe').length===0 && performance.getEntriesByType('resource').every(r=>!/^https?:/.test(r.name))")
    check('Overview shows three static route lanes',"document.querySelectorAll('#overview-map .ri-day-lane').length===3 && document.querySelector('#overview-map').dataset.mapProvider==='infographic'")
    check('Timeline uses shared infographic for every shown route',"document.querySelectorAll('#timeline .ri-visual').length===6 && document.querySelectorAll('#timeline .ri-svg').length===6")
    check('Every route uses an offline georeferenced road basemap',"TripData.routes.every(r=>{const el=document.createElement('div');el.innerHTML=RouteInfographic.visual(r);return !!el.querySelector('.road-basemap[href^=\"assets/maps/\"]')&&!el.querySelector('iframe')})")
    check('Ten sourced road paths replace decorative curves',"TripData.routes.filter(r=>r.roadMap).length===10 && TripData.routes.filter(r=>r.roadMap).every(r=>r.geometry.coordinates.length>5&&r.geometry.sourceUrl.includes('router.project-osrm.org'))")
    check('All A/B labels agree with route source data',"TripData.routes.every(r=>{const el=document.createElement('div');el.innerHTML=RouteInfographic.visual(r);const labels=el.querySelectorAll('.ri-endpoints strong');return labels[0].textContent===r.from&&labels[1].textContent===r.to})")
    check('Unknown shop locations never receive a fabricated route line',"TripData.routes.filter(r=>!r.roadMap).every(r=>{const el=document.createElement('div');el.innerHTML=RouteInfographic.visual(r);return !el.querySelector('.ri-route-path') && el.querySelector('.ri-visual').dataset.mapKind==='area'})")
    check('All ten road maps retain sources and matching Web Mercator extents',"TripData.routes.filter(r=>r.roadMap).every(r=>r.roadMap.mapExtent.spatialReference.latestWkid===3857&&r.roadMap.endpointSourceUrls.length===2&&r.distanceVerificationStatus==='estimated')")
    check('Status badges have been removed from route maps',"TripData.routes.every(r=>!RouteInfographic.visual(r).includes('ri-state')) && [...document.querySelectorAll('.status,.status-dot')].every(el=>getComputedStyle(el).display==='none')")
    check('Pending labels are absent from route titles and departure times',"TripData.routes.every(r=>![r.from,r.to,r.departure,r.arrival].some(text=>text.includes('รอยืนยัน')))")
    check('Displayed photographs have established reuse rights',"TripResearch.photos.filter(p=>p.allowedToDisplay).every(p=>['licensed','original'].includes(p.rightsStatus)&&p.license) && Object.values(TripData.routePhotos).every(p=>p.license==='CC0 1.0')")
    check('All 17 logical route endpoints form a continuous chain',"TripData.routes.slice(1).every((r,i)=>r.fromId===TripData.routes[i].toId)")
    check('JR is the pickup and return choice without fabricated coordinates',"TripData.routes.find(r=>r.id==='day1-route3').toId==='jr'&&TripData.routes.find(r=>r.id==='day3-route3').toId==='jr'&&TripData.places.find(p=>p.id==='jr').latitude===null&&TripData.routes.filter(r=>r.fromId==='jr'||r.toId==='jr').every(r=>r.geometry===null)")
    check('Restaurant route starts at Laojang, not the museum',"TripData.routes.find(r=>r.id==='day2-route2').fromId==='laojang'&&TripData.routes.find(r=>r.id==='day2-route2').geometry.endpointSourceUrls[0].includes('117862ZM')")
    check('Bus time remains separate from the car routing model',"TripData.routes.filter(r=>/รถบัส|รถตู้/.test(r.transport)).every(r=>r.plannedDurationMinutes===210&&r.modelDurationMinutes<210&&r.tripServiceConfirmed===false)")
    check('Unknown current prices remain null and not zero',"TripResearch.prices.expenses.every(e=>e.priceTHB===null)&&TripResearch.prices.unpricedItems.every(e=>e.priceTHB===null)")
    check('Contact section includes callable JR and restaurant contacts',"!!document.querySelector('a[href=\"tel:0861177576\"]')&&!!document.querySelector('a[href=\"tel:0871248060\"]')&&!!document.querySelector('a[href=\"tel:0979386618\"]')")
    check('Claiming verified without geometry cannot change map status',"RouteInfographic.status({...TripData.routes[0],geometry:null,mapStatus:'verified'})==='illustrative'")
    check('Every road label has a source',"TripData.routes.every(r=>r.roads.every(x=>/^https:/.test(x.sourceUrl)&&x.scope))")
    check('Every route has seven travel instruction fields and contextual photos',"TripData.routes.every(r=>r.instructions.length===7&&r.steps.length>=3&&!!r.toId)")
    check('No fabricated distances, prices or actual durations',"TripData.routes.every(r=>(r.distanceKm===null||!!r.geometry)&&r.durationMinutes===null&&r.priceTHB===null&&r.costTHB===null)")
    js("document.querySelector('#tab-2').click()")
    check('Day two includes Yunnan restaurant as a separate route',"document.querySelectorAll('#timeline .route-card').length===6 && !!document.querySelector('#day2-lunch') && !!document.querySelector('#day2-assessment')")
    js("document.querySelector('#tab-2').focus()")
    key('ArrowRight')
    check('Keyboard day navigation and explicit return-to-station leg',"document.querySelector('#tab-3').getAttribute('aria-selected')==='true' && document.querySelectorAll('#timeline .route-card').length===5 && !!document.querySelector('#day3-transfer')")
    js("document.querySelector('[data-route-details]').click()")
    check('Detail modal uses same route component and full travel facts',"document.querySelector('#details-dialog').open && !!document.querySelector('#detail-map .ri-visual') && document.querySelectorAll('#details-content .ri-facts dt').length===8")
    check('Detail editor is available without overwriting route facts',"document.querySelectorAll('#details-content [data-route-edit]').length===3")
    check('External navigation links encode endpoints',"[...document.querySelectorAll('a[href*=\"maps/dir\"]')].every(a=>new URL(a.href).searchParams.has('origin')&&new URL(a.href).searchParams.has('destination')&&a.target==='_blank')")
    key('Escape')
    check('Escape closes route detail',"!document.querySelector('#details-dialog').open")
    js("TripApp.selectDay(1);document.querySelector('[data-route-map]').click()")
    check('View A/B map opens static infographic',"!!document.querySelector('#detail-map .ri-svg') && document.querySelectorAll('#detail-map iframe').length===0")
    js("document.querySelector('.dialog-close').click()")
    check('New default allocation is honest about exceeding budget',"TripBudget.total()===6110 && TripBudget.allocation().unallocated===-110 && !document.querySelector('#budget-warning').hidden")
    check('Reserve, operating expenses, unallocated funds are distinct',"TripBudget.allocation().reserve===700 && TripBudget.allocation().operating===5410 && TripBudget.allocation().confirmed===0 && document.querySelector('#budget-health').dataset.health==='over'")
    check('Daily allocation and per-person totals are visible',"document.querySelectorAll('#daily-expenses>span').length===4 && document.querySelector('#person-total').textContent.includes('3,055')")
    check('New route-linked fuel shows unknown distance instead of fake total',"TripBudget.fuelCalculation().aggregate.pending===4 && Math.abs(TripBudget.fuelCalculation().km-98.1)<.00001 && !TripBudget.fuelCalculation().complete && TripBudget.getState().fuel.mode==='routes' && document.querySelector('#fuel-distance').disabled")
    check('Unknown fuel is a single labelled allowance',"TripBudget.getState().expenses.filter(e=>e.id==='fuel').length===1 && TripBudget.getState().expenses.find(e=>e.id==='fuel').amount===160 && document.querySelector('#fuel-state').textContent.includes('ยังขาด')")
    js("const mode=document.querySelector('#fuel-mode');mode.value='manual';mode.dispatchEvent(new Event('input'));const dist=document.querySelector('#fuel-distance');dist.value='70';dist.dispatchEvent(new Event('input'))")
    check('Manual fuel plus 15 percent detour, without duplicate charge',"TripBudget.calculateFuel()===92 && TripBudget.total()===6042 && TripBudget.getState().expenses.filter(e=>e.id==='fuel').length===1")
    js("document.querySelector('#fuel-mode').value='routes';document.querySelector('#fuel-mode').dispatchEvent(new Event('input'));document.querySelector('[data-route-details=\"day1-route4\"]').click();const inp=document.querySelector('[data-route-edit=distance]');inp.value=12.5;inp.dispatchEvent(new Event('change',{bubbles:true}))")
    check('Editing a route updates fuel aggregate and preserves unknown-leg allowance',"Math.abs(RouteInfographic.aggregate().knownKm-110.6)<.00001 && RouteInfographic.aggregate().pending===3 && TripBudget.getState().expenses.find(e=>e.id==='fuel').amount===160")
    check('Manual route distance is explicitly an estimate',"RouteInfographic.distance(TripData.routes.find(r=>r.id==='day1-route4')).verified===false && document.querySelector('[data-route-value=distance][data-route-id=\"day1-route4\"]').textContent.includes('12.5')")
    js("document.querySelector('.dialog-close').click();for(const r of TripData.routes.filter(r=>/มอเตอร์ไซค์/.test(r.transport))){TripApp.selectDay(r.day);document.querySelector('[data-route-details=\"'+r.id+'\"]').click();const f=document.querySelector('[data-route-edit=distance]');f.value=35;f.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.dialog-close').click()}")
    check('All route distances recompute motorcycle litres and detour',"RouteInfographic.aggregate().knownKm===385 && RouteInfographic.aggregate().pending===0 && TripBudget.calculateFuel()===506 && TripBudget.total()===6456")
    js("TripApp.selectDay(1);document.querySelector('[data-route-details=\"day1-route1\"]').click();const field=document.querySelector('[data-route-edit=distance]');field.value=999;field.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.dialog-close').click()")
    check('Bus kilometres never enter motorcycle fuel',"RouteInfographic.aggregate().knownKm===385 && TripBudget.calculateFuel()===506")
    js('location.reload()');time.sleep(.8)
    check('Route overrides and V4 budget persist after file reload',"RouteInfographic.aggregate().knownKm===385 && TripBudget.total()===6456 && JSON.parse(localStorage.getItem('fang-trip-budget-v4')).schemaVersion===4")
    # Seed a V1 fixture only inside this isolated test profile.
    js("localStorage.clear();const amounts={'bus-out':360,'bus-back':360,rental:600,'stay-1':650,'stay-2':650,'food-1':450,'food-2':700,'food-3':350,cafe:250,fuel:160,entrance:500,reserve:700};const expenses=TripData.defaultExpenses.map(e=>({id:e.id,name:e.name,category:e.category,day:e.day,amount:amounts[e.id]}));expenses.push({id:'legacy-custom',name:'My legacy expense',category:'other',day:2,amount:123});const old={budget:7000,expenses,fuel:{distance:140,efficiency:35,price:40,date:''}};localStorage.setItem('fang-trip-budget-v1',JSON.stringify(old));localStorage.setItem('qa-original-v1',JSON.stringify(old));localStorage.setItem('fang-contacts',JSON.stringify('legacy contact'));localStorage.setItem('fang-checklist','[2]');localStorage.setItem('fang-theme',JSON.stringify('dark'));location.reload()")
    time.sleep(.8)
    check('V1 migration preserves custom expense, total, budget and manual distance',"TripBudget.total()===5853 && TripBudget.getState().budget===7000 && TripBudget.getState().expenses.length===13 && TripBudget.getState().fuel.distance===140 && TripBudget.getState().fuel.mode==='manual'")
    check('V1 original is byte-identical and no V4 write occurs on load',"localStorage.getItem('fang-trip-budget-v1')===localStorage.getItem('qa-original-v1') && localStorage.getItem('fang-trip-budget-v4')===null")
    check('Legacy notes, checklist, theme survive',"document.querySelector('#contact-notes').value==='legacy contact' && document.querySelector('[data-check=\"2\"]').checked && document.body.classList.contains('dark')")
    js("const item=document.querySelector('tr[data-id=\"bus-out\"] [data-field=amount]');item.value=371;item.dispatchEvent(new Event('input',{bubbles:true}))")
    check('Editing migrated data saves V4 without changing V1',"TripBudget.total()===5864 && !!localStorage.getItem('fang-trip-budget-v4') && localStorage.getItem('fang-trip-budget-v1')===localStorage.getItem('qa-original-v1')")
    js("const status=document.querySelector('tr[data-id=\"bus-out\"] [data-field=priceStatus]');status.value='confirmed';status.dispatchEvent(new Event('input',{bubbles:true}))")
    check('Confirmed and estimated prices can be separated by user',"TripBudget.allocation().confirmed===371 && TripBudget.allocation().reserve===700")
    js("document.querySelector('#add-expense').click()")
    check('Add expense regression',"TripBudget.getState().expenses.length===14")
    js("document.querySelector('#expense-rows tr:last-child button').click()")
    check('Delete expense regression',"TripBudget.getState().expenses.length===13")
    js("window.confirm=()=>false;document.querySelector('#reset-budget').click()")
    check('Reset cancellation preserves user budget',"TripBudget.total()===5864")
    js("window.confirm=()=>true;document.querySelector('#reset-budget').click()")
    check('Explicit reset affects V4 only',"TripBudget.total()===6110 && localStorage.getItem('fang-trip-budget-v1')===localStorage.getItem('qa-original-v1')")
    js("localStorage.setItem('fang-trip-budget-v4','{broken');location.reload()")
    time.sleep(.8)
    js("const bad=document.querySelector('tr[data-id=\"bus-out\"] [data-field=amount]');bad.value=600;bad.dispatchEvent(new Event('input',{bubbles:true}))")
    check('Corrupt V4 data is never silently overwritten',"localStorage.getItem('fang-trip-budget-v4')==='{broken' && localStorage.getItem('fang-trip-budget-v1')===localStorage.getItem('qa-original-v1')")
    js("localStorage.clear();const v2={schemaVersion:2,budget:7200,expenses:TripData.defaultExpenses.map(e=>({...e})),fuel:{mode:'manual',distance:140,efficiency:35,price:40,date:'',detour:0,allowance:160}};v2.expenses.push({id:'v2-custom',name:'Existing V2 custom',category:'other',day:2,amount:77});localStorage.setItem('fang-trip-budget-v2',JSON.stringify(v2));localStorage.setItem('qa-original-v2',JSON.stringify(v2));location.reload()")
    time.sleep(.8)
    check('V2 migration preserves custom item, total and fuel without writing either key',"TripBudget.total()===6187&&TripBudget.getState().budget===7200&&TripBudget.getState().fuel.distance===140&&localStorage.getItem('fang-trip-budget-v2')===localStorage.getItem('qa-original-v2')&&localStorage.getItem('fang-trip-budget-v4')===null")
    js("const field=document.querySelector('tr[data-id=\"v2-custom\"] [data-field=amount]');field.value=88;field.dispatchEvent(new Event('input',{bubbles:true}))")
    check('V2 edit saves V4 and leaves original V2 byte-identical',"TripBudget.total()===6198&&localStorage.getItem('fang-trip-budget-v4')!==null&&localStorage.getItem('fang-trip-budget-v2')===localStorage.getItem('qa-original-v2')")
    js("localStorage.clear();localStorage.setItem('fang-route-overrides-v2',JSON.stringify({'day1-route5':{distance:14,note:'old same endpoints'},'day1-route4':{distance:99,note:'old unknown rental'}}));localStorage.setItem('qa-old-route',localStorage.getItem('fang-route-overrides-v2'));location.reload()")
    time.sleep(.8)
    check('Old route distances migrate only for unchanged endpoints',"TripData.routes.find(r=>r.id==='day1-route5').userDistanceKm===14&&TripData.routes.find(r=>r.id==='day1-route4').userDistanceKm===undefined&&localStorage.getItem('fang-route-overrides-v2')===localStorage.getItem('qa-old-route')")
    js('localStorage.clear();location.reload()');time.sleep(.8)
    js("document.querySelector('#theme-toggle').click()")
    check('Dark mode regression',"document.body.classList.contains('dark')")
    js("document.querySelector('#theme-toggle').click();document.querySelector('[data-place-details]').click()")
    check('Destination gallery details regression',"document.querySelector('#details-dialog').open && document.querySelector('#details-content').textContent.includes('เวลาเปิด')")
    key('Escape')
    check('Gallery uses licensed photos and honest placeholders',"document.querySelectorAll('#destination-grid .destination-card').length===10 && document.querySelectorAll('#destination-grid img').length===1 && document.querySelectorAll('#destination-grid .v4-photo-placeholder').length===9")
    check('Four price categories are selectable in the budget',"document.querySelector('tr[data-id=\"rental\"] [data-field=priceStatus]').options.length===4&&getComputedStyle(document.querySelector('#expense-rows td:nth-child(4)')).display==='table-cell'")
    js("document.querySelector('[data-present]').click()")
    check('Presentation starts with 22 slides',"document.querySelector('#presentation').open && TripPresentation.getSlideCount()===22 && TripPresentation.getIndex()===0")
    js("document.querySelector('#fullscreen').click()");time.sleep(.2)
    check('Fullscreen enters',"document.fullscreenElement===document.documentElement")
    js("document.querySelector('#fullscreen').click()");time.sleep(.2)
    check('Fullscreen exits',"document.fullscreenElement===null")
    js("document.querySelector('#next-slide').click()")
    check('Next button regression',"TripPresentation.getIndex()===1")
    key('ArrowRight');key('ArrowRight')
    check('Keyboard next reaches route one',"TripPresentation.getIndex()===3 && document.querySelector('[data-slide-route]').dataset.slideRoute===TripData.routes[0].id")
    check('Research routes and displayed routes are the same live objects',"TripData.routes.every((r,i)=>r===TripResearch.routes[i])")
    js("window.qaDistance=TripResearch.routes[0].distanceKm;TripResearch.routes[0].distanceKm=148.8;TripPresentation.move(0);TripApp.selectDay(1)")
    check('A central route edit immediately updates Timeline and Presentation',"document.querySelector('#slide-content [data-route-value=distance]').textContent.includes('148.8')&&document.querySelector('#timeline [data-route-value=distance]').textContent.includes('148.8')")
    js("TripResearch.routes[0].distanceKm=window.qaDistance;TripPresentation.move(0);TripApp.selectDay(1);const cost=document.querySelector('tr[data-id=\"bus-out\"] [data-field=amount]');cost.value=510;cost.dispatchEvent(new Event('input',{bubbles:true}));TripPresentation.move(0)")
    check('Bus allocation uses the same edited budget in both views',"document.querySelector('#slide-content [data-route-value=cost]').textContent.includes('510')&&document.querySelector('#timeline [data-route-value=cost]').textContent.includes('510')")
    js("const resetCost=document.querySelector('tr[data-id=\"bus-out\"] [data-field=amount]');resetCost.value=500;resetCost.dispatchEvent(new Event('input',{bubbles:true}));TripPresentation.move(0)")
    js("document.querySelector('#previous-slide').click()")
    check('Previous button regression',"TripPresentation.getIndex()===2")
    key('ArrowRight')
    check('Exactly one shared route component per route slide',"document.querySelectorAll('#slide-content .ri-visual').length===1 && document.querySelectorAll('#slide-content iframe').length===0")
    check('Presentation route labels and endpoint data agree',"(()=>{for(let i=0;i<TripPresentation.getSlideCount();i++){const slide=document.querySelector('[data-slide-route]');if(slide){const r=TripData.routes.find(r=>r.id===slide.dataset.slideRoute);const points=slide.querySelectorAll('.ri-endpoints strong');if(points[0].textContent!==r.from||points[1].textContent!==r.to)return false}TripPresentation.move(1)}return true})()")
    check('Next clamps at final slide',"TripPresentation.getIndex()===21 && document.querySelector('#next-slide').disabled")
    js('TripPresentation.move(-999)')
    check('Previous clamps at first slide',"TripPresentation.getIndex()===0 && document.querySelector('#previous-slide').disabled")
    key('Escape')
    check('Escape returns from presentation and restores scroll',"!document.querySelector('#presentation').open && document.body.style.overflow===''")
    js("document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0)")
    cdp('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
    # Each viewport verifies layout and actual route-map bounds, not just CSS breakpoints.
    for width in [360,390,768,1024,1440,1920]:
        height=1080 if width>=1440 else 844
        cdp('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<600})
        time.sleep(.25)
        if js('document.documentElement.scrollWidth>document.documentElement.clientWidth'):
            print('OVERFLOW',width,js("JSON.stringify([...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,90),right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width})).slice(0,25))"),flush=True)
            screenshot('overflow-v2.png')
        check('Planner no horizontal overflow '+str(width),"document.documentElement.scrollWidth<=document.documentElement.clientWidth")
        js("document.querySelector('[data-present]').click();TripPresentation.move(3)")
        check('Presentation map and text fit width '+str(width),"document.querySelector('#slide-content').scrollWidth<=document.querySelector('#slide-content').clientWidth && [...document.querySelectorAll('#slide-content .ri-svg')].every(svg=>svg.getBoundingClientRect().width<=svg.parentElement.getBoundingClientRect().width+1)")
        if width in [1440,1920]:
            check('Desktop route fits single slide '+str(width),"document.querySelector('#slide-content').scrollHeight<=document.querySelector('#slide-content').clientHeight+2")
            check('Every desktop route fits its slide '+str(width),"(()=>{TripPresentation.move(-999);for(let i=0;i<TripPresentation.getSlideCount();i++){if(document.querySelector('[data-slide-route]')&&document.querySelector('#slide-content').scrollHeight>document.querySelector('#slide-content').clientHeight+2)return false;TripPresentation.move(1)}TripPresentation.move(-999);TripPresentation.move(3);return true})()")
            screenshot('presentation-v4-'+str(width)+'.png')
        if width==360:
            screenshot('presentation-v4-mobile.png')
            js("const a=document.querySelector('#slide-content');for(const [type,x] of [['touchstart',250],['touchend',100]]){const e=new Event(type);Object.defineProperty(e,'changedTouches',{value:[{clientX:x,clientY:300}]});a.dispatchEvent(e)}")
            check('Mobile swipe also works over static infographic',"TripPresentation.getIndex()===4")
        js("document.querySelector('#close-presentation').click()")
        if width in [360,1440]:
            js('window.scrollTo(0,0)');time.sleep(.25);screenshot('planner-v4-'+str(width)+'.png')
            js("document.querySelector('#itinerary').scrollIntoView()")
            time.sleep(.25);screenshot('itinerary-v4-'+str(width)+'.png')
    js("window.ChartBackup=window.Chart;window.Chart=null;document.querySelector('#fuel-price').dispatchEvent(new Event('input'))")
    check('CSS chart fallback regression',"!document.querySelector('#chart-fallback').hidden && document.querySelector('#budget-chart').hidden")
    js("window.Chart=window.ChartBackup;document.querySelector('#fuel-price').dispatchEvent(new Event('input'));window.dispatchEvent(new Event('beforeprint'))")
    check('Print contains all 17 route infographics and full budget',"document.querySelectorAll('#day-panel .route-card').length===17 && document.querySelectorAll('#day-panel .ri-svg').length===17 && !!document.querySelector('#budget-health')")
    check('SVG accessibility IDs remain unique during print',"(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.length===new Set(ids).size})()")
    cdp('Emulation.setEmulatedMedia',{'media':'print'})
    pdf=cdp('Page.printToPDF',{'printBackground':True,'paperWidth':8.27,'paperHeight':11.69,'marginTop':.3,'marginBottom':.3,'marginLeft':.3,'marginRight':.3})
    pdf_bytes=base64.b64decode(pdf['data']);(QA/'itinerary-v4.pdf').write_bytes(pdf_bytes)
    results.append({'name':'Actual browser PDF generated with all routes','passed':pdf_bytes.startswith(b'%PDF') and len(pdf_bytes)>10000})
    cdp('Emulation.setEmulatedMedia',{'media':''})
    js("window.dispatchEvent(new Event('afterprint'))")
    check('After printing planner controls are restored',"!!document.querySelector('#day-title') && document.querySelectorAll('#timeline .ri-svg').length===6")
    js("window.print=()=>window.printWasCalled=true;document.querySelector('#print').click()")
    check('Print button invokes browser print regression',"window.printWasCalled===true")
    errors=[e['params']['exceptionDetails'] for e in events if e.get('method')=='Runtime.exceptionThrown']
    results.append({'name':'No application runtime exceptions','passed':not errors})
    if errors:raise AssertionError(json.dumps(errors,ensure_ascii=False))
    js('localStorage.clear()')
    print('ALL V4 CHECKS PASSED',flush=True)
except Exception:
    results.append({'name':'Complete browser suite','passed':False})
    raise
finally:
    (QA/'results-v4.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    if results and all(x['passed'] for x in results):(QA/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    if ws:
        try:cdp('Browser.close')
        except Exception:pass
        ws.close()
    if browser:
        try:browser.wait(timeout=8)
        except subprocess.TimeoutExpired:browser.terminate()
