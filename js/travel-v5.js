/* Views derive media and activity allocations from the same research and saved ledger. */
window.TripMedia = {
  list: placeId => TripResearch.photos.filter(p=>p.placeId===placeId&&p.allowedToDisplay&&p.rightsStatus==='licensed'&&p.license&&p.licenseUrl).sort((a,b)=>Number(!!b.primary)-Number(!!a.primary)),
  credit(p){const e=RouteInfographic.escape;return `<a href="${e(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">${e(p.credit)} ↗</a> · <a href="${e(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${e(p.license)}</a>${p.capturedAt?' · ถ่าย '+e(p.capturedAt.slice(0,4)):''} · แสดงเต็มภาพ`}
};
window.TripRoutePrices = (()=>{
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  const labels={confirmed:'ยืนยันโดยผู้ใช้',historical:'อ้างอิงราคาเก่า · ยังไม่ยืนยันวันเดินทาง',estimated:'งบเผื่อ · ไม่ใช่ราคาของร้าน',unknown:'ยังไม่ยืนยันราคา · วงเงินตั้งเผื่อ'};
  function state(){try{return TripBudget.getState()}catch{return {expenses:TripResearch.prices.expenses,fuel:{efficiency:TripResearch.prices.fuel.efficiencyKmPerLitre,price:TripResearch.prices.fuel.pricePerLitreTHB,detour:TripResearch.prices.fuel.detourPercent,mode:'routes'}}}}
  function allocation(id,s=state()){
    const config=TripResearch.prices.routeAllocations.find(x=>x.routeId===id);
    return (config?.items||[]).map(item=>{
      const e=s.expenses.find(e=>e.id===item.expenseId);
      return {...item,amount:e?round(e.amount*item.share):null,priceStatus:e?.priceStatus||'unknown',sourceUrl:e?.sourceUrl,notes:e?.notes||'รายการนี้ถูกนำออกจากงบที่บันทึกไว้'};
    });
  }
  function fuelShares(s=state()){
    const known=TripData.routes.filter(r=>/มอเตอร์ไซค์/.test(r.transport)&&RouteInfographic.distance(r).km!==null);
    const km=known.reduce((a,r)=>a+RouteInfographic.distance(r).km,0);
    const f=s.fuel,available=s.expenses.find(e=>e.id==='fuel')?.amount||0;
    // Allocate only modelled fuel; leave the unknown-distance allowance outside route totals.
    const needed=km/f.efficiency*f.price*(1+f.detour/100);
    const cents=Math.round(Math.min(available,needed)*100);
    let used=0,coveredKm=0;
    return Object.fromEntries(known.map((r,i)=>{coveredKm+=RouteInfographic.distance(r).km;const cumulative=i===known.length-1?cents:Math.round(cents*coveredKm/(km||1));const next=cumulative-used;used=cumulative;return [r.id,next/100]}));
  }
  function get(r){
    const s=state(),items=allocation(r.id,s),fuel=fuelShares(s)[r.id];
    if(/มอเตอร์ไซค์/.test(r.transport))items.unshift({expenseId:'fuel',name:'เชื้อเพลิงช่วงนี้',amount:fuel??null,priceStatus:'estimated',unit:'สำหรับรถ 1 คัน / 2 คน',notes:fuel===undefined?'ยังไม่ทราบระยะ จึงยังไม่จัดสรรค่าน้ำมัน':`จัดสรรจากระยะ ${RouteInfographic.distance(r).km} กม. · ${s.fuel.efficiency} กม./ลิตร · ${s.fuel.price} บาท/ลิตร · เผื่ออ้อม ${s.fuel.detour}% · เป็นส่วนหนึ่งของงบน้ำมัน`});
    const transfer=/เดิน|รับจ้าง|รถรับจ้าง/.test(r.transport)&&r.id!=='day2-route3';
    if(transfer)items.unshift({expenseId:null,name:'เดิน / ต่อรถในพื้นที่',amount:null,priceStatus:'unknown',unit:'สำหรับ 2 คน',notes:'เดินได้หรือไม่ต้องตรวจทางจริง; ถ้าใช้รถรับจ้างยังไม่ยืนยันราคา เงินสำรองอยู่ในงบแยก ไม่บวกซ้ำ'});
    const total=round(items.reduce((sum,x)=>sum+(x.amount??0),0));
    const unknown=items.some(x=>x.amount===null);
    return {items,total,unknown,notes:r.id==='day2-route3'?'เดินในพื้นที่ · ไม่จัดสรรค่าเดินทางเพิ่ม; ค่าเข้าคิดที่ Hinoki แล้ว':r.id==='day3-route3'?'คืนรถ · ค่าเช่าทั้งทริปจัดสรรไว้ตอนรับรถแล้ว':r.toId==='homestay'&&!items.some(x=>x.expenseId?.startsWith('stay'))?'กลับที่พักเดิม · ไม่คิดค่าห้องซ้ำ':items.length?'ยอดนี้เป็นส่วนแบ่งของ Budget Tracker ไม่ใช่รายจ่ายเพิ่ม':'ไม่มีรายการจ่ายใหม่ที่จัดสรรในช่วงนี้ · ไม่ได้ยืนยันว่าไม่มีค่าใช้จ่าย'};
  }
  function reconciliation(){const s=state(),routeTotal=round(TripData.routes.reduce((a,r)=>a+get(r).total,0)),ledgerTotal=round(s.expenses.reduce((a,e)=>a+e.amount,0));return {routeTotal,outsideRoutes:round(ledgerTotal-routeTotal),ledgerTotal}}
  function render(r){const e=RouteInfographic.escape,p=get(r),research=TripResearch.prices.activityResearch.find(x=>x.placeId===r.toId);return `<section class="v5-route-prices" data-price-panel="${e(r.id)}"><header><strong>ค่าใช้จ่ายช่วงนี้ · 2 คน</strong><span>${p.unknown?'จัดสรรแล้วบางส่วน':'งบประมาณ'}</span></header>${p.items.map(x=>`<div class="v5-price-row"><div><b>${e(x.name)}</b><small>${e(x.unit)} · ${e(labels[x.priceStatus])}</small></div><strong>${x.amount===null?'ยังไม่ทราบ':'≈ '+TripBudget.money(x.amount)}</strong></div>`).join('')}<footer><span>ยอดจัดสรรช่วงนี้${p.unknown?' (ยังไม่ครบ)':''}</span><strong data-route-subtotal="${e(r.id)}">≈ ${TripBudget.money(p.total)}</strong></footer><p>${e(p.notes)}</p><details><summary>หน่วยราคา / ที่มา / แก้งบ</summary>${p.items.map(x=>`<p>${e(x.name)}: ${e(x.notes)}${x.sourceUrl?` <a href="${e(x.sourceUrl)}" target="_blank" rel="noopener noreferrer">ข้อมูลอ้างอิง ↗</a>`:''}${x.expenseId&&x.expenseId!=='fuel'?` · แบ่ง ${Math.round(x.share*10000)/100}% ของรายการในงบ`:''}</p>`).join('')}${research?`<p>${e(research.notes)}${research.publishedPriceTHB!==null?` · ราคาเผยแพร่อ้างอิง ${research.publishedPriceTHB} ${e(research.unit)}`:''}${research.sourceUrl?` <a href="${e(research.sourceUrl)}" target="_blank" rel="noopener noreferrer">แหล่งราคากิจกรรม ↗</a>`:''}</p>`:''}<button class="button outline" data-edit-route-budget>แก้งบต้นทางใน Budget Tracker</button></details></section>`}
  function refresh(){document.querySelectorAll('[data-price-panel]').forEach(el=>{const r=TripData.routes.find(x=>x.id===el.dataset.pricePanel);if(r)el.outerHTML=render(r)});document.querySelectorAll('[data-route-value=cost]').forEach(el=>{const r=TripData.routes.find(x=>x.id===el.dataset.routeId);if(r){const p=get(r);el.textContent='≈ '+TripBudget.money(p.total)+(p.unknown?' + รอราคา':'')}});const box=document.querySelector('#v5-budget-reconciliation');if(box){const p=reconciliation();box.innerHTML=`<strong>แบ่งงบไว้ตามช่วงเดินทาง</strong><span>ใน 17 ช่วง ${TripBudget.money(p.routeTotal)} · นอกช่วง ${TripBudget.money(p.outsideRoutes)} · รวม ${TripBudget.money(p.ledgerTotal)}</span><small>นอกช่วงรวมอาหารเช้า เงินสำรอง น้ำมันระยะที่ยังขาด และรายการที่คุณเพิ่มเอง ไม่บวกซ้ำกับงบด้านบน</small>`}}
  function placePrices(id){const items=TripData.routes.filter(r=>r.toId===id).flatMap(r=>allocation(r.id));return `<div class="v5-place-prices" data-place-prices="${RouteInfographic.escape(id)}">${items.length?items.map(x=>`<span>${RouteInfographic.escape(x.name)} · ${x.amount===null?'ยังไม่ทราบ':'งบเผื่อ '+TripBudget.money(x.amount)}<small>${RouteInfographic.escape(labels[x.priceStatus])}</small></span>`).join(''):'งบการเดินทางและกิจกรรมดูในแต่ละช่วง · ยังไม่ยืนยันค่าบริการ'}</div>`}
  window.addEventListener('trip:budget-rendered',()=>{document.querySelectorAll('[data-place-prices]').forEach(el=>{el.outerHTML=placePrices(el.dataset.placePrices)})});
  return {get,render,refresh,reconciliation,fuelShares,allocation,placePrices};
})();
