"""Acceptance for the first-published appearance with the V5 price dataset."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
setup=(ROOT/'tests/browser_check.py').read_text(encoding='utf-8').split("    check('Direct file open")[0]
body=r'''
    cdp('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
    check('First published itinerary and V5 prices load offline',"TripData.dataVersion===3&&TripData.priceVersion===5&&TripData.routes.length===17&&TripPresentation.getSlideCount()===22&&location.protocol==='file:'")
    check('V5 default expense rows and budget are intact',"TripBudget.total()===6110&&TripBudget.getState().expenses.length===12&&TripBudget.allocation().reserve===700&&TripBudget.expenseAmount('rental')===600&&TripBudget.expenseAmount('bus-out')===500")
    check('V5 price units and activity sources are available',"TripPricesV5.activityResearch.length===7&&TripPricesV5.routeAllocations.length===17&&document.querySelectorAll('#expense-rows select[data-field=priceStatus]').length===12")
    check('First version photos and offline maps are restored',"TripData.routePhotos.stay.image==='assets/images/homestay-riverside.jpg'&&TripData.routePhotos.hinoki.image==='assets/images/hinoki-banner.png'&&TripData.routes.filter(r=>r.roadMap).length===8&&!document.querySelector('link[href=\"css/travel-v5.css\"]')&&!document.querySelector('script[src=\"js/photo-gallery.js\"]')")
    check('Default fuel is charged once and stays within allocated fuel',"TripBudget.getState().expenses.filter(e=>e.id==='fuel').length===1&&Object.values(TripRoutePrices.fuelShares()).reduce((a,b)=>a+b,0)<=TripBudget.expenseAmount('fuel')+.001")
    js("document.getElementById('add-expense').click()")
    check('New custom expenses start with unknown price status',"document.querySelector('#expense-rows tr:last-child [data-field=priceStatus]').value==='unknown'")
    js("document.querySelector('#expense-rows tr:last-child [data-remove]').click()")
    for width in [360,768,1440]:
        cdp('Emulation.setDeviceMetricsOverride',{'width':width,'height':1080 if width==1440 else 844,'deviceScaleFactor':1,'mobile':width<600})
        check('Planner width '+str(width),"document.documentElement.scrollWidth<=innerWidth")
        js('TripPresentation.open()')
        check('All 17 route prices match timeline at '+str(width),"(()=>{let n=0;for(let i=0;i<22;i++){const el=document.querySelector('[data-slide-route]');if(el){n++;const r=TripData.routes.find(r=>r.id===el.dataset.slideRoute);TripApp.selectDay(r.day);const card=document.getElementById(r.id);if(el.querySelector('[data-price-panel]').textContent!==card.querySelector('[data-price-panel]').textContent||document.querySelector('#slide-content').scrollWidth>document.querySelector('#slide-content').clientWidth)return false;}TripPresentation.move(1)}return n===17})()")
        js('TripPresentation.close()')
        if width in [360,1440]:
            js('TripPresentation.open();TripPresentation.move(6)');time.sleep(.2);screenshot('first-v5-prices-'+str(width)+'.png');js('TripPresentation.close()')
    js("TripApp.selectDay(1);TripPresentation.open();TripPresentation.move(3);const input=document.querySelector('tr[data-id=\"bus-out\"] [data-field=amount]');input.value=520;input.dispatchEvent(new Event('input',{bubbles:true}))")
    check('Editing V5 budget updates route prices in both original views',"TripBudget.total()===6130&&document.querySelector('#slide-content [data-route-value=cost]').textContent.includes('520')&&document.querySelector('#day1-route1 [data-route-value=cost]').textContent.includes('520')&&document.querySelector('#slide-content [data-price-panel]').textContent.includes('520')")
    js("TripPresentation.close();const saved=TripBudget.getState();saved.budget=7400;saved.expenses.find(e=>e.id==='fuel').amount=123;localStorage.setItem('fang-trip-budget-v4',JSON.stringify(saved));localStorage.setItem('qa-snapshot',localStorage.getItem('fang-trip-budget-v4'));location.reload()")
    time.sleep(.8)
    check('Saved V5 user budget survives switching to original appearance',"TripBudget.getState().budget===7400&&TripBudget.expenseAmount('fuel')===123&&TripBudget.expenseAmount('bus-out')===520&&localStorage.getItem('fang-trip-budget-v4')===localStorage.getItem('qa-snapshot')")
    js("document.querySelector('[data-route-details]').click()")
    check('Original detail modal works with V5 price panel',"document.querySelector('#details-dialog').open&&!!document.querySelector('#details-content [data-price-panel]')")
    js("document.querySelector('#details-content [data-edit-route-budget]').click()")
    check('Price editing action returns to the original budget tracker',"!document.querySelector('#details-dialog').open&&document.activeElement.closest('#expense-rows')!==null")
    js("document.querySelector('#theme-toggle').click();window.dispatchEvent(new Event('beforeprint'))")
    check('Original theme and print remain functional',"document.body.classList.contains('dark')&&document.querySelectorAll('#day-panel .route-card').length===17")
    js("window.dispatchEvent(new Event('afterprint'))")
    errors=[e['params']['exceptionDetails'] for e in events if e.get('method')=='Runtime.exceptionThrown']
    if errors:raise AssertionError(errors)
    results.append({'name':'No runtime exceptions','passed':True})
    print('ALL RESTORED VERSION CHECKS PASSED',flush=True)
except Exception:
    results.append({'name':'Complete restored-version suite','passed':False});raise
finally:
    (ROOT/'tests/results-first-prices.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    if ws:
        try:cdp('Browser.close')
        except Exception:pass
        ws.close()
    if browser:
        try:browser.wait(timeout=8)
        except subprocess.TimeoutExpired:browser.terminate()
'''
exec(compile(setup+body,str(ROOT/'tests/browser_check.py'),'exec'),{'__file__':str(ROOT/'tests/browser_check.py')})
