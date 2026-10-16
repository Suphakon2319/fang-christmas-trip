"""V5 acceptance: every route, real image decoding, galleries and shared live allocations."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
setup=(ROOT/'tests/browser_check.py').read_text(encoding='utf-8').split("    check('Direct file open")[0]
body=r'''
    cdp('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
    check('All image rights and central hero image agree',"document.querySelector('[data-hero-place]').getAttribute('src')===TripMedia.list('hotspring')[0].file&&!!document.querySelector('.photo-footnote a[href*=\"creativecommons.org\"]')")
    check('Default per-route allocations reconcile without duplication',"TripRoutePrices.reconciliation().routeTotal===5078.93&&TripRoutePrices.reconciliation().outsideRoutes===1031.07&&TripBudget.total()===6110")
    for width in [1440,360]:
        cdp('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000 if width==1440 else 844,'deviceScaleFactor':1,'mobile':width==360})
        js('TripPresentation.open()')
        for index in range(22):
            rid=js("document.querySelector('[data-slide-route]')?.dataset.slideRoute")
            if rid:
                js("TripApp.selectDay(TripData.routes.find(r=>r.id==='"+rid+"').day)")
                check('Route '+rid+' matches timeline, prices, distance and maps at '+str(width),"""(async()=>{const r=TripData.routes.find(r=>r.id==='RID'),slide=document.querySelector('[data-slide-route]'),card=document.getElementById(r.id);const panel=slide.querySelector('[data-price-panel]');const images=[...slide.querySelectorAll('img')];for(const img of images){img.loading='eager';try{await img.decode()}catch{return false}}return slide.querySelector('[data-photo-place]').dataset.photoPlace===r.toId&&(images.length>0||!!slide.querySelector('[data-illustration]'))&&panel.textContent===card.querySelector('[data-price-panel]').textContent&&panel.textContent.includes('2 คน')&&slide.querySelector('[data-route-value=distance]').textContent===card.querySelector('[data-route-value=distance]').textContent&&slide.querySelectorAll('.ri-route-path').length===(r.geometry?1:0)&&!slide.querySelector('[data-route-value=distance]').textContent.includes('—')&&document.querySelector('#slide-content').scrollWidth<=document.querySelector('#slide-content').clientWidth})()""".replace('RID',rid))
                if rid=='day3-route1':screenshot('v5-hot-spring-'+str(width)+'.png')
                if rid=='day1-route3':screenshot('v5-jr-diagram-'+str(width)+'.png')
            js('TripPresentation.move(1)')
        js('TripPresentation.close()')
    cdp('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1080,'deviceScaleFactor':1,'mobile':False})
    js("TripPresentation.open();TripPresentation.move(17)")
    check('Hot spring gallery offers four licensed thumbnails',"document.querySelector('#slide-content [data-gallery-place]').dataset.galleryPlace==='hotspring'&&document.querySelectorAll('#slide-content [data-gallery-select]').length===4")
    js("document.querySelector('#slide-content [data-gallery-select=\"1\"]').click()")
    check('Thumbnail changes image and keeps its instance focus',"document.querySelector('#slide-content .v5-photo-open img').getAttribute('src')===TripMedia.list('hotspring')[1].file&&document.activeElement.closest('#slide-content')!==null")
    js("document.querySelector('#slide-content [data-gallery-step=\"1\"]').click()")
    check('Gallery next and previous controls update selected image',"document.querySelector('#slide-content [data-gallery-index]').dataset.galleryIndex==='2'")
    js("document.querySelector('#slide-content .v5-photo-open').click()")
    check('Photo expands above presentation with source and license',"document.querySelector('#photo-viewer').open&&document.querySelector('#photo-viewer img').getAttribute('src')===TripMedia.list('hotspring')[2].file&&!!document.querySelector('#photo-viewer a[href*=\"creativecommons\"]')")
    key('ArrowRight')
    check('Lightbox keyboard changes photo without advancing slide',"TripPresentation.getIndex()===17&&document.querySelector('#photo-viewer img').getAttribute('src')===TripMedia.list('hotspring')[3].file")
    key('Escape')
    check('Escape closes only lightbox and restores image focus',"!document.querySelector('#photo-viewer').open&&document.querySelector('#presentation').open&&document.activeElement.matches('.v5-photo-open')")
    js("document.querySelector('#slide-content .v5-photo-open').click();document.querySelector('#photo-viewer [data-photo-step=\"-1\"]').click()")
    check('Lightbox previous button changes photograph',"document.querySelector('#photo-viewer img').getAttribute('src')===TripMedia.list('hotspring')[1].file")
    js("document.querySelector('[data-photo-close]').click();TripPresentation.close();TripApp.selectDay(1);TripPresentation.open();TripPresentation.move(4)")
    js("const row=document.querySelector('tr[data-id=\"food-1\"] [data-field=amount]');row.value=900;row.dispatchEvent(new Event('input',{bubbles:true}))")
    check('Editing daily food updates timeline, slide and destination immediately',"TripRoutePrices.get(TripData.routes.find(r=>r.id==='day1-route2')).items.find(x=>x.expenseId==='food-1').amount===400&&document.querySelector('#slide-content [data-route-subtotal]').textContent.includes('400')&&document.querySelector('#day1-route2 [data-route-subtotal]').textContent.includes('400')&&document.querySelector('[data-place-prices=\"lunch\"]').textContent.includes('400')&&TripBudget.total()===6560")
    js("const row2=document.querySelector('tr[data-id=\"food-1\"] [data-field=amount]');row2.value=450;row2.dispatchEvent(new Event('input',{bubbles:true}));TripPresentation.close()")
    check('Fuel allocation is a subset of the single fuel ledger row',"Math.abs(Object.values(TripRoutePrices.fuelShares()).reduce((a,b)=>a+b,0)-128.93)<1e-9&&TripBudget.getState().expenses.filter(x=>x.id==='fuel').length===1&&TripRoutePrices.reconciliation().ledgerTotal===6110")
    check('No rental or hotel duplication on return routes',"TripRoutePrices.get(TripData.routes.find(r=>r.id==='day3-route3')).items.every(x=>x.expenseId!=='rental')&&TripResearch.prices.routeAllocations.flatMap(x=>x.items).filter(x=>x.expenseId==='stay-1').length===1")
    check('Central photo permission changes immediately affect all renderers',"(()=>{const p=TripResearch.photos.find(x=>x.id==='hotspring-commons-1');p.allowedToDisplay=false;const html=TripGallery.render('hotspring');const result=!html.includes(p.file);p.allowedToDisplay=true;return result})()")
    js("const original=TripBudget.getState();original.expenses.find(e=>e.id==='fuel').amount=123;original.budget=7123;localStorage.setItem('fang-trip-budget-v4',JSON.stringify(original));localStorage.setItem('qa-v4-snapshot',localStorage.getItem('fang-trip-budget-v4'));location.reload()")
    time.sleep(.7)
    check('Existing V4 edited fuel and budget load without clobbering storage',"TripBudget.getState().budget===7123&&TripBudget.expenseAmount('fuel')===123&&localStorage.getItem('fang-trip-budget-v4')===localStorage.getItem('qa-v4-snapshot')")
    errors=[e['params']['exceptionDetails'] for e in events if e.get('method')=='Runtime.exceptionThrown']
    if errors:print(errors)
    results.append({'name':'No runtime exceptions during V5 feature acceptance','passed':not errors})
    if errors:raise AssertionError(errors)
    print('ALL V5 FEATURE CHECKS PASSED',flush=True)
except Exception:
    results.append({'name':'Complete V5 feature suite','passed':False})
    raise
finally:
    (ROOT/'tests/results-v5-features.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    if ws:
        try:cdp('Browser.close')
        except Exception:pass
        ws.close()
    if browser:
        try:browser.wait(timeout=8)
        except subprocess.TimeoutExpired:browser.terminate()
'''
exec(compile(setup+body,str(ROOT/'tests/browser_check.py'),'exec'),{'__file__':str(ROOT/'tests/browser_check.py')})
